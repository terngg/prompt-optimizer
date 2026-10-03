# OpenCode

Status: documented integration and implemented adapter; live OpenCode execution not tested.

[Build locally](local-build.md), then generate its configuration:

```sh
node scripts/config.mjs opencode
```

Merge the output into the target project's `opencode.json` or `opencode.jsonc`. Unlike hosts with `mcpServers`, OpenCode uses an `mcp` object, a `type: "local"`, and a command array:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "prompt-optimizer": {
      "type": "local",
      "command": ["node", "/root/prompt/dist/apps/mcp-server/src/cli.js"],
      "enabled": true
    }
  }
}
```

HTTP uses `type: "remote"` with `url`; generate it with `node scripts/config.mjs opencode http`. [Official MCP setup](https://opencode.ai/docs/mcp-servers/).

Install the skill:

```sh
node scripts/install-skill.mjs --agent opencode --scope project --project /root/prompt
```

Project destination: `.opencode/skills/prompt-optimizer`. User scope uses `~/.config/opencode/skills/prompt-optimizer`. OpenCode also supports the portable `.agents/skills` locations. [Official skill discovery](https://opencode.ai/docs/skills/).

Restart or reload configuration. Ask OpenCode to load the `prompt-optimizer` skill and call `inspect_prompt` on a short task. Tool permissions can prevent automatic calls; no adapter bypasses them.
