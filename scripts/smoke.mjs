import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { startHttp } from '../dist/apps/mcp-server/src/transports.js';
import { OptimizeResultSchema } from '../dist/packages/shared/src/index.js';
const cli = resolve(process.argv[2] ?? 'dist/apps/mcp-server/src/cli.js');
for (const kind of ['stdio', 'http'])
  for (const mode of ['legacy', 'auto']) {
    const http = kind === 'http' ? await startHttp({ port: 0 }) : undefined;
    const client = new Client(
      { name: 'promptopt-smoke', version: '0.1.0' },
      { versionNegotiation: { mode } },
    );
    try {
      await client.connect(
        http
          ? new StreamableHTTPClientTransport(new URL(http.url))
          : new StdioClientTransport({
              command: process.execPath,
              args: [cli],
              stderr: 'pipe',
            }),
      );
      assert.equal((await client.listTools()).tools.length, 9);
      assert.equal((await client.listResources()).resources.length, 5);
      assert.equal((await client.listPrompts()).prompts.length, 5);
      const result = await client.callTool({
        name: 'optimize_prompt',
        arguments: { prompt: 'buat dashboard ai keren pake nextjs' },
      });
      assert.notEqual(result.isError, true);
      const parsed = OptimizeResultSchema.parse(result.structuredContent);
      assert.equal(parsed.detectedIntent.primary, 'coding');
      const invalid = await client.callTool({
        name: 'optimize_prompt',
        arguments: { prompt: '' },
      });
      assert.equal(invalid.isError, true);
      console.log(
        `${kind} ${mode}: ${client.getNegotiatedProtocolVersion()}, discovery + structured call + validation OK`,
      );
    } finally {
      await client.close();
      await http?.close();
    }
  }
