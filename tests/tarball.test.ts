import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  mkdtemp,
  rm,
  writeFile,
  readFile,
  rename,
  mkdir,
  copyFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { exec, execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import { once } from 'node:events';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const execAsync = promisify(exec);
const execFileAsync = promisify(execFile);
const repository = resolve(import.meta.dirname, '..');
const packageVersion: string = JSON.parse(
  await readFile(join(repository, 'package.json'), 'utf8'),
).version;

describe('Production tarball installation', () => {
  let tempDir: string;
  let packageRoot: string;
  let cli: string;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'promptopt-tarball-'));
    const artifact = process.env.PROMPTOPT_TEST_TARBALL;
    if (artifact) {
      await copyFile(resolve(artifact), join(tempDir, 'package.tgz'));
    } else {
      // Fixed shell commands; paths are passed through cwd/env or execFile arguments.
      const { stdout } = await execAsync('npm pack --json', {
        cwd: repository,
        env: { ...process.env, npm_config_pack_destination: tempDir },
        timeout: 60000,
      });
      // Lifecycle output precedes npm's final JSON array.
      const pack = JSON.parse(stdout.slice(stdout.lastIndexOf('\n[') + 1));
      await rename(
        join(tempDir, pack[0].filename),
        join(tempDir, 'package.tgz'),
      );
    }
    await writeFile(
      join(tempDir, 'package.json'),
      JSON.stringify({ private: true, type: 'module' }),
    );
    await execAsync(
      'npm install --ignore-scripts --omit=dev --no-audit --no-fund ./package.tgz',
      {
        cwd: tempDir,
        timeout: 90000,
      },
    );
    packageRoot = join(tempDir, 'node_modules', 'prompt-optimizer-mcp-engine');
    cli = join(packageRoot, 'dist', 'apps', 'mcp-server', 'src', 'cli.js');
  }, 180000);

  afterAll(async () => {
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  });

  it('imports public SDK exports and optimizes offline with production dependencies only', async () => {
    const script = join(tempDir, 'test-sdk.mjs');
    await writeFile(
      script,
      `
import assert from 'node:assert/strict';
import { PromptOptimizer } from 'prompt-optimizer-mcp-engine';
import { inspectPrompt } from 'prompt-optimizer-mcp-engine/core';
import * as providers from 'prompt-optimizer-mcp-engine/providers';
import { createServer } from 'prompt-optimizer-mcp-engine/server';
const result = await new PromptOptimizer().optimize({ prompt: 'fix auth' });
assert.ok(result.optimizedPrompt.startsWith('fix auth'));
assert.equal(result.metadata.remoteUsed, false);
assert.ok(inspectPrompt({ prompt: 'fix auth' }).intent);
assert.ok(Object.keys(providers).length);
assert.equal(typeof createServer, 'function');
console.log('OK');
`,
    );
    const { stdout } = await execFileAsync(process.execPath, [script], {
      cwd: tempDir,
    });
    expect(stdout.trim()).toBe('OK');
    await expect(
      readFile(join(tempDir, 'node_modules', 'vitest', 'package.json')),
    ).rejects.toThrow();
  });

  it('runs the installed binary without downloading a fallback', async () => {
    const { stdout } = await execAsync(
      'npm exec --offline -- promptopt --version',
      { cwd: tempDir },
    );
    expect(stdout.trim()).toBe(packageVersion);
  });

  it('audits the freshly resolved production dependency tree', async () => {
    const { stdout } = await execAsync('npm audit --omit=dev --json', {
      cwd: tempDir,
      timeout: 60000,
    });
    const audit = JSON.parse(stdout);
    expect(audit.error).toBeUndefined();
    expect(audit.metadata.vulnerabilities.total).toBe(0);
  }, 65000);

  it('runs CLI inspect, optimize and eval against a file', async () => {
    const input = join(tempDir, 'prompt.md');
    await writeFile(input, 'fix auth');
    for (const command of ['inspect', 'optimize', 'eval']) {
      const { stdout } = await execFileAsync(process.execPath, [
        cli,
        command,
        input,
      ]);
      const result = JSON.parse(stdout);
      if (command === 'inspect')
        expect(result.intent.primary).toBe('debugging');
      if (command === 'optimize')
        expect(result.optimizedPrompt).toContain('fix auth');
      if (command === 'eval') expect(result.kind).toBe('heuristic diagnostics');
    }
  });

  it('doctor validates the installed skill, configuration and HTTP initialization', async () => {
    const { stdout } = await execFileAsync(process.execPath, [cli, 'doctor']);
    expect(JSON.parse(stdout)).toMatchObject({
      version: packageVersion,
      nodeSupported: true,
      skillAvailable: true,
      configurationValid: true,
      httpInitialization: true,
    });
  });

  it('installs the packaged skill and all linked references into a fresh project', async () => {
    const project = join(tempDir, 'project');
    await mkdir(project);
    await execFileAsync(process.execPath, [
      join(packageRoot, 'scripts', 'install-skill.mjs'),
      '--agent',
      'codex',
      '--scope',
      'project',
      '--project',
      project,
    ]);
    const installed = join(project, '.agents', 'skills', 'prompt-optimizer');
    const text = await readFile(join(installed, 'SKILL.md'), 'utf8');
    expect(text).toBe(
      await readFile(
        join(packageRoot, 'skills', 'prompt-optimizer', 'SKILL.md'),
        'utf8',
      ),
    );
    for (const [, link] of text.matchAll(/\]\((references\/[^)]+)\)/g)) {
      expect(await readFile(join(installed, link!), 'utf8')).toBeTruthy();
    }
  });

  for (const kind of ['stdio', 'http']) {
    for (const mode of ['legacy', 'auto'] as const) {
      it(`${kind} ${mode}: initializes, discovers, calls and validates the installed server`, async () => {
        const child =
          kind === 'http'
            ? spawn(process.execPath, [cli, 'http', '--port', '0'], {
                stdio: ['ignore', 'ignore', 'pipe'],
              })
            : undefined;
        const exited = child ? once(child, 'exit') : undefined;
        const client = new Client(
          { name: 'tarball-test', version: packageVersion },
          { versionNegotiation: { mode } },
        );
        try {
          let url = '';
          if (child) {
            let timer: ReturnType<typeof setTimeout>;
            try {
              url = await new Promise<string>((resolveUrl, reject) => {
                timer = setTimeout(
                  () => reject(new Error('Packed HTTP server did not start')),
                  10000,
                );
                let output = '';
                child.stderr!.on('data', (chunk) => {
                  output += chunk.toString();
                  const match = output.match(/listening at (http:\/\/[^\s]+)/);
                  if (match) resolveUrl(match[1]!);
                });
                child.once('error', reject);
                child.once('exit', () =>
                  reject(new Error('Packed HTTP server exited before startup')),
                );
              });
            } finally {
              clearTimeout(timer!);
            }
          }
          await client.connect(
            child
              ? new StreamableHTTPClientTransport(new URL(url))
              : new StdioClientTransport({
                  command: process.execPath,
                  args: [cli],
                  stderr: 'pipe',
                }),
          );
          expect((await client.listTools()).tools).toHaveLength(9);
          expect((await client.listResources()).resources).toHaveLength(5);
          expect((await client.listPrompts()).prompts).toHaveLength(5);
          const result = await client.callTool({
            name: 'optimize_prompt',
            arguments: { prompt: 'fix auth' },
          });
          expect(result.isError).not.toBe(true);
          expect(result.structuredContent).toMatchObject({
            optimizedPrompt: expect.stringContaining('fix auth'),
          });
          const invalid = await client.callTool({
            name: 'optimize_prompt',
            arguments: { prompt: '' },
          });
          expect(invalid.isError).toBe(true);
        } finally {
          await client.close();
          if (child) {
            child.kill();
            await exited;
          }
        }
      });
    }
  }
});
