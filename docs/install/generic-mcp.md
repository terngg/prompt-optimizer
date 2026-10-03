# Any MCP-compatible host

[Build locally](local-build.md). Configure a stdio server whose executable is Node.js and whose single argument is the absolute path to `dist/apps/mcp-server/src/cli.js`. There is no required environment variable. Use the host's own configuration format; `mcpServers` is common but not universal.

```sh
node scripts/config.mjs generic
```

For Streamable HTTP:

```sh
node dist/apps/mcp-server/src/cli.js http --port 3000
```

Connect the host to `http://127.0.0.1:3000/mcp`. The process must run on the same machine/network namespace as the host. This endpoint is loopback-only and uses no authentication; it is not an internet service. Legacy SSE endpoints are not included.

Verify discovery: nine tools, five resources, five prompts. Call `inspect_prompt` with `{"prompt":"fix auth"}`. Then call `optimize_prompt` and check both `structuredContent` and its text content. A host may expose only tools; resources/prompts are optional conveniences. Without Agent Skills, request optimization explicitly before execution.

## VS Code-compatible environments

VS Code's native MCP config uses `servers` in `.vscode/mcp.json`, not `mcpServers`. Run `node scripts/config.mjs vscode` and merge the generated entry. Its configuration UI can also add a stdio or HTTP server. [Official VS Code MCP guide](https://code.visualstudio.com/docs/agent-customization/mcp-servers). Extensions can use different formats; follow the extension's documentation.

## Gemini-compatible environments

Gemini CLI documents MCP entries in `settings.json` under `mcpServers`, including stdio commands; the generic stdio entry can be merged into the appropriate Gemini settings scope. [Official Gemini MCP guide](https://geminicli.com/docs/tools/mcp-server/). Do not assume Gemini CLI and Antigravity CLI share configuration paths. Gemini/VS Code are documented standard-compatibility routes, not live-tested integrations here.
