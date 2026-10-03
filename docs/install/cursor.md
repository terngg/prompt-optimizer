# Cursor

Status: documented integration and implemented adapter; actual Cursor execution not tested.

[Build locally](local-build.md), then run:

```sh
node scripts/config.mjs cursor
node scripts/install-skill.mjs --agent cursor --scope project --project /root/prompt
```

Merge the generated entry into your target project's `.cursor/mcp.json`. User-wide MCP configuration is `~/.cursor/mcp.json`. HTTP uses a `url` entry; generate it with `node scripts/config.mjs cursor http` after starting the HTTP server. [Official MCP documentation](https://cursor.com/docs/mcp).

The project skill goes to `.cursor/skills/prompt-optimizer`; `--scope user` installs into `~/.cursor/skills/prompt-optimizer`. Cursor also documents `.agents/skills` discovery. [Official skill documentation](https://prod.cursor.com/docs/skills).

Refresh the host, inspect MCP tools in settings, and invoke `/prompt-optimizer` or ask to inspect a task. Local user skills are not automatically available to every cloud or remote workspace: install project-scoped skills there as needed. The host decides automatic activation; the skill skips trivial tasks and prevents recursive calls.
