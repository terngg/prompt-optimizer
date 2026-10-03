# Codex

Status: documented integration, implemented adapter/configuration, protocol-tested; actual Codex execution not tested.

First [build and verify](local-build.md). From this checkout, install the user-scoped MCP server using Codex's CLI:

```sh
codex mcp add prompt-optimizer -- node /root/prompt/dist/apps/mcp-server/src/cli.js
codex mcp list
```

Replace the checkout path if needed. For project scope, generate the TOML entry:

```sh
node scripts/config.mjs codex
```

Merge it into the target project's `.codex/config.toml`. User configuration lives in `~/.codex/config.toml`. Codex applies project trust rules before reading project config. For HTTP, run `node dist/apps/mcp-server/src/cli.js http --port 3000` in another terminal, then use `codex mcp add prompt-optimizer --url http://127.0.0.1:3000/mcp`. [Official MCP configuration](https://developers.openai.com/codex/mcp).

Install the portable skill into the project where you launch Codex:

```sh
node scripts/install-skill.mjs --agent codex --scope project --project /root/prompt
```

For all local projects instead:

```sh
node scripts/install-skill.mjs --agent codex --scope user
```

The destinations are `.agents/skills/prompt-optimizer` and `~/.agents/skills/prompt-optimizer`. The installer refuses to overwrite an existing skill. [Official skill discovery](https://developers.openai.com/codex/skills).

Restart if discovery has not refreshed. In Codex, inspect `/mcp`, then ask:

```text
Use $prompt-optimizer to improve this instruction, then execute it: fix auth.
```

For a safe initial check, ask it to call `inspect_prompt` on `fix auth` without executing the task. Expect a debugging intent and recommendations. Automatic activation is the host's decision from the skill description, not a hook that intercepts every request. Simple questions and exact-wording instructions should be skipped.

Optional minimal AGENTS.md addition:

```markdown
For substantial or materially ambiguous tasks, use the available prompt-optimizer
skill once when useful, then continue the task. Preserve explicit requirements
and skip trivial or already precise requests.
```

The repository also includes a [portable plugin manifest](../../plugin.json) and MCP bundle. It uses the current [official plugin format](https://developers.openai.com/plugins/build/plugins), requires built files and installed runtime dependencies, and has not been installed into a live Codex host. Standalone MCP plus skill remains the primary installation.
