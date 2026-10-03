import { createServer as createHttpServer } from 'node:http';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import {
  serveStdio,
  StdioServerTransport,
} from '@modelcontextprotocol/server/stdio';
import { createServer } from './server.js';
import { LIMITS } from '../../../packages/shared/src/index.js';
import type { OptimizerOptions } from '../../../packages/core/src/index.js';
const safeError = () => {
  process.stderr.write(
    'Prompt Optimizer: transport request failed; check client configuration.\n',
  );
};
export function startStdio(options: OptimizerOptions = {}) {
  return serveStdio(() => createServer(options), {
    transport: new StdioServerTransport(process.stdin, process.stdout, {
      maxBufferSize: LIMITS.wireBytes,
    }),
    onerror: safeError,
    maxSubscriptions: 8,
  });
}
export async function startHttp(
  options: OptimizerOptions & { port?: number } = {},
) {
  const port = options.port ?? 3000;
  if (!Number.isInteger(port) || port < 0 || port > 65535)
    throw new Error('Port must be an integer from 0 to 65535.');
  const handler = createMcpHandler(() => createServer(options), {
    maxRequestBodySize: LIMITS.wireBytes,
    maxSubscriptions: 8,
    onerror: safeError,
  });
  const route = toNodeHandler(handler, {
    maxRequestBodySize: LIMITS.wireBytes,
    onerror: safeError,
  });
  let active = 0;
  const server = createHttpServer(async (req, res) => {
    const authority = req.headers.host;
    const actualPort = (server.address() as { port: number }).port;
    const hosts = [`127.0.0.1:${actualPort}`, `localhost:${actualPort}`];
    if (!authority || !hosts.includes(authority)) {
      res.writeHead(403).end('Invalid Host');
      return;
    }
    const origin = req.headers.origin;
    if (origin && !hosts.map((x) => 'http://' + x).includes(origin)) {
      res.writeHead(403).end('Invalid Origin');
      return;
    }
    if (req.url !== '/mcp') {
      res.writeHead(404).end('Use /mcp');
      return;
    }
    if (active >= 8) {
      res
        .writeHead(429, { 'retry-after': '1' })
        .end('Too many active requests');
      return;
    }
    active++;
    try {
      await route(req, res);
    } catch {
      if (!res.headersSent) res.writeHead(500);
      res.end('Request failed');
    } finally {
      active--;
    }
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 10_000;
  server.timeout = 90_000;
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  const address = server.address() as { port: number };
  return {
    server,
    url: `http://127.0.0.1:${address.port}/mcp`,
    close: async () => {
      await handler.close();
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve())),
      );
    },
  };
}
