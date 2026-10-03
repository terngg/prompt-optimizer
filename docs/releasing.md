# Release preparation

This repository is prepared for v0.1.0. It has no assigned GitHub remote or npm owner and has not been published. Source, package structure and local checks can be completed without choosing an account; publication cannot.

## Final maintainer choices

Choose the GitHub owner/repository and add the real `repository`, `homepage`, and `bugs` metadata to package.json. Set a private vulnerability reporting channel in SECURITY.md and a community contact in CODE_OF_CONDUCT.md. Enable private vulnerability reporting on GitHub. Recheck npm availability and account permission: a registry 404 is not a reservation or a guarantee that npm will accept a name. `prompt-optimizer-mcp-engine` was available by that check on 2026-10-03.

The project uses semantic versioning. Keep package.json, shared VERSION, plugin.json, skill metadata, changelog and install examples synchronized. For 0.x, document breaking changes explicitly and bump the minor version.

## Verify and inspect

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm run doctor
pnpm examples
pnpm pack
npm pack --dry-run
npm view prompt-optimizer-mcp-engine name version
```

The final command should report not found before first publication. Inspect the tarball file list for generated runtime files, declarations, skill references, license, metadata and absence of credentials. Install it in a fresh temporary project and exercise the SDK and stdio server; [verification evidence](verification.md) records the local test.

## Publish to GitHub — authorized maintainer action

The following commands publish remotely and were **not executed**. Run them only after choosing your account and reviewing the content:

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

These commands were not executed. Use your account's required 2FA/trusted-publishing flow. After success, verify the registry version, update the unreleased status and enable the documented `npx -y prompt-optimizer-mcp-engine@0.1.0` install experience. Do not mark it published merely because packing succeeded.

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
