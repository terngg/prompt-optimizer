# Google Antigravity

Status: official documentation researched for current IDE/CLI, adapters and configs implemented; no live Antigravity execution tested.

[Build and verify](local-build.md), then generate a ready-to-copy configuration:

```sh
node scripts/config.mjs antigravity
```

In this checkout, the entry is equivalent to:

```json
{
  "mcpServers": {
    "prompt-optimizer": {
      "command": "node",
      "args": ["/root/prompt/dist/apps/mcp-server/src/cli.js"]
    }
  }
}
```

Merge the server entry into your chosen scope:

| Surface | Project MCP               | Global MCP                         |
| ------- | ------------------------- | ---------------------------------- |
| IDE     | `.agents/mcp_config.json` | `~/.gemini/config/mcp_config.json` |
| CLI     | `.agents/mcp_config.json` | `~/.gemini/config/mcp_config.json` |

IDE: agent side panel → MCP Servers → Manage MCP Servers → View raw config. CLI: `/mcp` opens the manager for status and reload. These locations come from [Google's current MCP documentation](https://www.antigravity.google/docs/mcp), not earlier `.gemini/antigravity` assumptions.

For HTTP, start `node dist/apps/mcp-server/src/cli.js http --port 3000` and generate `node scripts/config.mjs antigravity http`. Antigravity uses `serverUrl`:

```json
{
  "mcpServers": {
    "prompt-optimizer": { "serverUrl": "http://127.0.0.1:3000/mcp" }
  }
}
```

Install the project skill:

```sh
node scripts/install-skill.mjs --agent antigravity --scope project --project /root/prompt
```

Project skills use `.agents/skills/` on both surfaces. Global locations differ:

```sh
# IDE / Antigravity 2.0
node scripts/install-skill.mjs --agent antigravity --scope user
# CLI
node scripts/install-skill.mjs --agent antigravity-cli --scope user
```

IDE global: `~/.gemini/config/skills/`; CLI global: `~/.gemini/antigravity-cli/skills/`. [Google's skill locations](https://www.antigravity.google/docs/skills).

Refresh, check the MCP manager, then invoke `/prompt-optimizer` or request an `inspect_prompt` call without execution. Confirm nine discovered tools. Automatic use depends on host selection and tool permissions. Local mode is fully useful when AI providers are absent.
