# Any Agent Skills-compatible host

Copy the complete `skills/prompt-optimizer/` directory into a skill search directory documented by your host. Keep its name and references together. No executable script is required by the skill. The format follows the [Agent Skills specification](https://agentskills.io/specification).

For hosts discovering `.agents/skills`, from this checkout:

```sh
node scripts/install-skill.mjs --agent generic --scope project --project /root/prompt
```

Change `--project` to the workspace in which your agent works. To install for a user when that host documents `~/.agents/skills`:

```sh
node scripts/install-skill.mjs --agent generic --scope user
```

The installer is cross-platform, refuses overwrite, and rejects symlink parents. It does not edit MCP config or access credentials. For updates, review the existing directory before replacing it. For removal, remove only that installed skill directory using your file manager.

Restart/refresh the host and ask: “Use the prompt-optimizer skill to improve this task before executing it.” Automatic activation depends on host skill selection, not a universal interception mechanism. The skill calls the MCP engine when available and uses a short reasoning fallback otherwise. It never requires a remote provider. The fallback has no deterministic schema, token accounting, or classification guarantees.

The source repository is `terngg/prompt-optimizer`. The installer is included in the npm package as well as the source checkout. Refresh any previously copied skill directory after reviewing the changes; updating the MCP package alone does not update that copy.
