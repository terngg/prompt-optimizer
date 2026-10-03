# Release preparation

The v0.1.0 source repository is [terngg/prompt-optimizer](https://github.com/terngg/prompt-optimizer). The package is `prompt-optimizer-mcp-engine`. Inspect GitHub and npm before publishing to avoid duplicate releases or immutable npm versions.

## Final maintainer choices

The package metadata identifies the GitHub repository. SECURITY.md and CODE_OF_CONDUCT.md identify reporting channels. Verify private vulnerability reporting is enabled on GitHub. Recheck npm availability and account permission: a registry 404 is not a reservation or a guarantee that npm will accept a name. `prompt-optimizer-mcp-engine` was available by that check on 2026-10-03.

The project uses semantic versioning. Keep package.json, shared VERSION, plugin.json, skill metadata, changelog and install examples synchronized. For 0.x, document breaking changes explicitly and bump the minor version.

## Verify and inspect

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm run doctor
pnpm examples
npm pack
pnpm verify:pack
pnpm run audit
# POSIX shell: use this exact archive for the final fresh-install checks.
PROMPTOPT_TEST_TARBALL="$PWD/prompt-optimizer-mcp-engine-0.1.0.tgz" pnpm test:tarball
npm view prompt-optimizer-mcp-engine name version
```

The final command should report not found before first publication. Inspect the tarball file list for generated runtime files, declarations, skill references, license, metadata and absence of credentials. The artifact tests perform a fresh production install, exercise the SDK, CLI, doctor, skill installer and both transports, and audit the installed dependencies; [verification evidence](verification.md) records the local test. Repack and rerun these checks after changing publication metadata or reporting contacts. On PowerShell, set `$env:PROMPTOPT_TEST_TARBALL` to the archive's absolute path before running `pnpm test:tarball`.

## Publish to GitHub — authorized maintainer action

The following commands describe first publication. Inspect `git remote -v`, `git tag --list` and `gh release view v0.1.0` first; reuse an existing repository, correct tag or release instead of recreating it:

```sh
git add .
git commit -m "Prepare Prompt Optimizer v0.1.0"
gh repo create prompt-optimizer --public --source=. --remote=origin --push --description "Give every AI agent better instructions. Local-first MCP server, portable Agent Skill, and optimization SDK."
gh repo edit --add-topic mcp --add-topic agent-skills --add-topic prompt-optimization --add-topic typescript
git tag v0.1.0
git push origin v0.1.0
gh release create v0.1.0 prompt-optimizer-mcp-engine-0.1.0.tgz --title "Prompt Optimizer v0.1.0" --notes-file docs/release-notes-v0.1.0.md
```

`gh` requires installation and authentication. If the repository already exists, use its existing remote instead of creating another. The metadata file under `.github/` supplies the full suggested topic list. Git author identity is the maintainer's choice; setup does not invent one.

## Publish to npm — authorized maintainer action

```sh
npm login
npm publish ./prompt-optimizer-mcp-engine-0.1.0.tgz --access public
```

Use your account's required 2FA/trusted-publishing flow. Check `npm whoami` and package ownership before publishing. After success, verify `npm view prompt-optimizer-mcp-engine@0.1.0 version` and run `npx -y prompt-optimizer-mcp-engine@0.1.0 --version`. Do not mark it published merely because packing succeeded.

## Optional plugin distribution

The root `plugin.json`, `mcp.json` and `skills/` follow Agent Plugins 1.0.0, the current [OpenAI-supported portable format](https://developers.openai.com/plugins/build/plugins). `mcp.json` uses `${PLUGIN_ROOT}` to locate the built entrypoint. A plugin checkout must have `dist/` and runtime dependencies installed; the manifest does not silently run package installation. Do not ship an unbuilt source-only plugin zip as a working server. The prepared npm tarball carries the bundle files and receives dependencies through npm installation.

The manifest has been checked structurally; no live Codex/plugin marketplace installation or publication has been performed. Submit a plugin only after actual host loading tests. Standalone MCP and skill installation work independently.

## Next release priorities

1. Live host matrix runs with exact host versions and automatic skill activation evidence.
2. A public multilingual task dataset measuring scope preservation and execution outcomes.
3. Model-aware token estimates and stronger conflict detection.
4. Optional authenticated remote HTTP deployment with tenant quotas.
5. Provider/model live tests with explicit budgets and evaluation of independent critique.
6. Semantic compression with provenance and stronger constraint-retention tests.
