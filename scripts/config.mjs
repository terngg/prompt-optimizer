import { fileURLToPath } from 'node:url';
const [agent = 'generic', mode = 'stdio'] = process.argv.slice(2);
if (
  ![
    'codex',
    'claude-code',
    'antigravity',
    'cursor',
    'opencode',
    'generic',
    'vscode',
  ].includes(agent) ||
  !['stdio', 'http'].includes(mode)
) {
  console.error(
    'Usage: node scripts/config.mjs codex|claude-code|antigravity|cursor|opencode|generic|vscode [stdio|http]',
  );
  process.exitCode = 1;
} else {
  const command = process.execPath,
    args = [
      fileURLToPath(
        new URL('../dist/apps/mcp-server/src/cli.js', import.meta.url),
      ),
    ],
    url = 'http://127.0.0.1:3000/mcp';
  if (agent === 'codex')
    console.log(
      `[mcp_servers.prompt-optimizer]\n` +
        (mode === 'http'
          ? `url = ${JSON.stringify(url)}`
          : `command = ${JSON.stringify(command)}\nargs = ${JSON.stringify(args)}`),
    );
  else if (agent === 'opencode')
    console.log(
      JSON.stringify(
        {
          $schema: 'https://opencode.ai/config.json',
          mcp: {
            'prompt-optimizer':
              mode === 'http'
                ? { type: 'remote', url, enabled: true }
                : { type: 'local', command: [command, ...args], enabled: true },
          },
        },
        null,
        2,
      ),
    );
  else if (agent === 'vscode')
    console.log(
      JSON.stringify(
        {
          servers: {
            'prompt-optimizer':
              mode === 'http'
                ? { type: 'http', url }
                : { type: 'stdio', command, args },
          },
        },
        null,
        2,
      ),
    );
  else
    console.log(
      JSON.stringify(
        {
          mcpServers: {
            'prompt-optimizer':
              mode === 'http'
                ? agent === 'antigravity'
                  ? { serverUrl: url }
                  : agent === 'claude-code'
                    ? { type: 'http', url }
                    : { url }
                : { command, args },
          },
        },
        null,
        2,
      ),
    );
}
