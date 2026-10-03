import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtemp, rm, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

const execAsync = promisify(exec);

describe('Production Tarball Installation', () => {
  let tempDir: string;
  let tarballPath: string;

  beforeAll(async () => {
    // 1. Pack the project
    const { stdout: packOut } = await execAsync('pnpm pack', {
      cwd: resolve(__dirname, '..'),
    });
    const tarballName = packOut.trim().split('\n').pop()?.trim() || '';
    tarballPath = resolve(__dirname, '..', tarballName);

    // 2. Create a temporary directory
    tempDir = await mkdtemp(join(tmpdir(), 'promptopt-tarball-'));

    // 3. Initialize minimal node project
    await execAsync('npm init -y', { cwd: tempDir });

    // 4. Install the tarball with production dependencies
    await execAsync(`npm install "${tarballPath}"`, { cwd: tempDir });
  }, 120000); // Generous timeout for pack/install (120s)

  afterAll(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
    if (tarballPath) {
      await rm(tarballPath, { force: true });
    }
  });

  it('SDK can be imported and PromptOptimizer can be instantiated', async () => {
    const scriptPath = join(tempDir, 'test-sdk.mjs');
    await writeFile(
      scriptPath,
      `
import { PromptOptimizer } from 'prompt-optimizer-mcp-engine';
const optimizer = new PromptOptimizer();
if (!optimizer) throw new Error('Failed to instantiate PromptOptimizer');
console.log('OK');
      `.trim(),
    );

    const { stdout } = await execAsync(`node "${scriptPath}"`, {
      cwd: tempDir,
    });
    expect(stdout.trim()).toBe('OK');
  });

  it('CLI binary exists and runs --version', async () => {
    const { stdout } = await execAsync('npx promptopt --version', {
      cwd: tempDir,
    });
    expect(stdout.trim()).toMatch(/^[0-9]+\.[0-9]+\.[0-9]+$/);
  });

  it('Skill files are present in the package', async () => {
    const skillsDir = join(
      tempDir,
      'node_modules',
      'prompt-optimizer-mcp-engine',
      'skills',
      'prompt-optimizer',
    );
    const files = await readdir(skillsDir);
    expect(files).toContain('SKILL.md');
  });

  it('A stdio MCP session can be started and returns tools', async () => {
    const binPath = join(tempDir, 'node_modules', '.bin', 'promptopt');
    const client = new Client(
      { name: 'tarball-test', version: '0.1.0' },
      { versionNegotiation: { mode: 'auto' } },
    );

    await client.connect(
      new StdioClientTransport({
        command: binPath,
        args: [],
        stderr: 'pipe',
      }),
    );

    try {
      const r = await client.listTools();
      expect(r.tools.length).toBeGreaterThan(0);
      const toolNames = r.tools.map((t: { name: string }) => t.name);
      expect(toolNames).toContain('optimize_prompt');
    } finally {
      await client.close();
    }
  });
});
