# Google Antigravity

Status: user-reported v0.1.x Antigravity CLI testing confirmed global MCP and Agent Skill installation, discovery, all nine tools, explicit optimization, domain reference loading, repository awareness and public npm use. A subsequent v0.1.1 fresh-session replay confirmed automatic activation for the complex dashboard task and execution-contract scope control. The exact host version was not supplied. IDE execution remains untested; automatic selection is still host-controlled.

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

## Upgrade and verify the v0.1.1 skill

Updating the MCP npm package alone does not replace a skill directory previously copied into the host. Review and back up the old `prompt-optimizer` skill before replacing it with this checkout's complete `skills/prompt-optimizer` directory. The installer intentionally refuses overwrite. Use `--agent antigravity-cli --scope user` for CLI global installation; the IDE global path is different.

Restart into a fresh session. A materially multi-feature or repository-aware task should load the skill and call `optimize_prompt` before implementation, allowing only necessary read-only context lookup first. A successful result is the execution contract, not a starting point for an expanded product specification. Trivial requests should bypass optimization. Follow the [activation troubleshooting and replay checks](../troubleshooting.md#mcp-visible-but-optimizer-does-not-auto-trigger); automatic selection remains host-controlled.
