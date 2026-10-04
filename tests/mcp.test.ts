import { afterAll, beforeAll, describe, it, expect } from 'vitest';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { spawn } from 'node:child_process';
import { request } from 'node:http';
import { once } from 'node:events';
import { resolve } from 'node:path';
import { startHttp } from '../apps/mcp-server/src/transports.js';
import { OptimizeResultSchema, VERSION } from '../packages/shared/src/index.js';
const cli = resolve('dist/apps/mcp-server/src/cli.js');
for (const transportKind of ['stdio', 'http'] as const)
  for (const mode of ['legacy', 'auto'] as const) {
    describe(`${transportKind} ${mode}`, () => {
      let client: Client;
      let http: Awaited<ReturnType<typeof startHttp>> | undefined;
      beforeAll(async () => {
        client = new Client(
          { name: 'promptopt-tests', version: VERSION },
          { versionNegotiation: { mode } },
        );
        if (transportKind === 'http') {
          http = await startHttp({ port: 0 });
          await client.connect(
            new StreamableHTTPClientTransport(new URL(http.url)),
          );
        } else
          await client.connect(
            new StdioClientTransport({
              command: process.execPath,
              args: [cli],
              stderr: 'pipe',
            }),
          );
      });
      afterAll(async () => {
        await client?.close();
        await http?.close();
      });
      it('negotiates the intended protocol era', () =>
        expect(client.getNegotiatedProtocolVersion()).toBe(
          mode === 'auto' ? '2026-07-28' : '2025-11-25',
        ));
      it('discovers all tools with strict input and output schemas', async () => {
        const r = await client.listTools();
        expect(r.tools).toHaveLength(9);
        for (const tool of r.tools) {
          expect(tool.inputSchema.additionalProperties).toBe(false);
          expect(tool.outputSchema).toBeDefined();
        }
      });
      it('discovers and reads resources', async () => {
        const r = await client.listResources();
        expect(r.resources).toHaveLength(5);
        for (const resource of r.resources) {
          const x = await client.readResource({ uri: resource.uri });
          expect(x.contents).toHaveLength(1);
        }
      });
      it('discovers and renders prompts', async () => {
        const r = await client.listPrompts();
        expect(r.prompts).toHaveLength(5);
        const x = await client.getPrompt({
          name: 'optimize-coding-task',
          arguments: { task: 'fix auth' },
        });
        expect(x.messages).toHaveLength(1);
      });
      it('returns valid structured output and explanatory text', async () => {
        const result = await client.callTool({
          name: 'optimize_prompt',
          arguments: { prompt: 'fix auth' },
        });
        expect(result.isError).not.toBe(true);
        expect(
          OptimizeResultSchema.safeParse(result.structuredContent).success,
        ).toBe(true);
        expect(result.content.length).toBeGreaterThan(0);
      });
      it('calls all secondary tools', async () => {
        for (const [name, args] of [
          ['inspect_prompt', { prompt: 'fix auth' }],
          ['evaluate_prompt', { prompt: 'fix auth' }],
          [
            'compare_prompts',
            { promptA: 'fix auth', promptB: 'fix auth and verify' },
          ],
          ['compress_context', { context: [{ id: 'x', text: 'auth bug' }] }],
          ['adapt_prompt', { prompt: 'fix auth', targetAgent: 'codex' }],
          [
            'build_agent_instruction',
            { goal: 'fix auth', constraints: ['No new dependencies.'] },
          ],
          ['suggest_optimization_profile', { prompt: 'fix auth' }],
        ] as const) {
          const r = await client.callTool({ name, arguments: args });
          expect(r.isError, name).not.toBe(true);
          expect(r.structuredContent, name).toBeDefined();
        }
        const optimized = await client.callTool({
          name: 'optimize_prompt',
          arguments: { prompt: 'fix auth' },
        });
        const r = await client.callTool({
          name: 'explain_optimization',
          arguments: { result: optimized.structuredContent },
        });
        expect(r.isError).not.toBe(true);
      });
      it('rejects empty and unknown inputs', async () => {
        for (const args of [
          { prompt: '' },
          { prompt: 'fix auth', extra: 'bad' },
        ]) {
          const r = await client.callTool({
            name: 'optimize_prompt',
            arguments: args,
          });
          expect(r.isError).toBe(true);
        }
      });
    });
  }
describe('transport boundaries', () => {
  it('exits cleanly on stdin EOF', async () => {
    const child = spawn(process.execPath, [cli], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const exit = once(child, 'exit');
    let stdout = '';
    child.stdout.on('data', (x) => (stdout += String(x)));
    child.stdin.end();
    const [code] = await exit;
    expect(code).toBe(0);
    expect(stdout).toBe('');
  });
  it('rejects oversized stdio frames without logging them', async () => {
    const child = spawn(process.execPath, [cli], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const exit = once(child, 'exit');
    let stderr = '';
    child.stderr.on('data', (x) => (stderr += String(x)));
    child.stdin.on('error', () => {});
    child.stdin.end('x'.repeat(2_000_001));
    await exit;
    expect(stderr).not.toContain('x'.repeat(100));
  });
  it('guards HTTP Host, Origin, path and body size', async () => {
    const h = await startHttp({ port: 0 });
    try {
      const badHost = await new Promise<number | undefined>(
        (resolve, reject) => {
          const req = request(
            h.url,
            { headers: { host: 'attacker.example' } },
            (res) => {
              res.resume();
              resolve(res.statusCode);
            },
          );
          req.on('error', reject);
          req.end();
        },
      );
      expect(badHost).toBe(403);
      expect(
        (
          await fetch(h.url, {
            headers: { origin: 'https://attacker.example' },
          })
        ).status,
      ).toBe(403);
      expect((await fetch(h.url + '/bad')).status).toBe(404);
      const r = await fetch(h.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'x'.repeat(2_000_001),
      });
      expect(r.status).toBe(413);
    } finally {
      await h.close();
    }
  });
});
