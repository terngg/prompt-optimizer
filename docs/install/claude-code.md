# Claude Code

Status: documented integration, implemented adapter/configuration, protocol-tested; live Claude Code execution not tested.

After [building locally](local-build.md), run from the target project:

```sh
claude mcp add --transport stdio --scope project prompt-optimizer -- node /root/prompt/dist/apps/mcp-server/src/cli.js
claude mcp list
claude mcp get prompt-optimizer
```

Replace `/root/prompt` with your build location. Use `--scope user` instead for all projects. Project MCP entries are stored in `.mcp.json`; the host may request project trust. The `--` separator is required before server arguments. [Official MCP guide](https://code.claude.com/docs/en/mcp).

For Streamable HTTP, keep this process running:

```sh
node /root/prompt/dist/apps/mcp-server/src/cli.js http --port 3000
```

Then add it with:

```sh
claude mcp add --transport http --scope project prompt-optimizer http://127.0.0.1:3000/mcp
```

Choose one transport for the server name. To generate JSON instead, run `node scripts/config.mjs claude-code` or `node scripts/config.mjs claude-code http` from the checkout and merge the entry into your host configuration.

Install the skill from the checkout:

```sh
node scripts/install-skill.mjs --agent claude-code --scope project --project /root/prompt
```

This writes `.claude/skills/prompt-optimizer` in the target project. Use `--scope user` for `~/.claude/skills/prompt-optimizer`. [Official skill locations and invocation](https://code.claude.com/docs/en/skills).

Restart/refresh the host, inspect `/mcp`, then use `/prompt-optimizer` or ask: “Use Prompt Optimizer to inspect ‘fix auth’ without executing it.” Expect a structured intent and diagnostics. Normal automatic use stays selective: the skill improves a substantial instruction once and the same Claude Code session continues the task. No extra model key is required.
