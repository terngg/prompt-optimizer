# Build and verify a local installation

Requires Node.js 22 or newer and pnpm 10.32.1. From this checkout:

```sh
npm install --global pnpm@10.32.1
pnpm install --frozen-lockfile
pnpm build
pnpm run doctor
pnpm smoke
```

The default MCP command is:

```sh
node /root/prompt/dist/apps/mcp-server/src/cli.js
```

`/root/prompt` is this checkout's path. For another checkout, generate configuration with `node scripts/config.mjs AGENT`; it emits actual absolute paths for your machine. Keep the checkout in place after adding it to a host. No key is required.

The helper does not modify your host configuration. Merge its named server entry into the appropriate config rather than replacing other entries. JSON backslash escaping is handled for Windows. `node` must be visible to your agent; the generated config uses the absolute Node executable path to avoid GUI PATH issues.

To test a relocatable npm artifact before publication:

```sh
pnpm pack
npm install --global ./prompt-optimizer-mcp-engine-0.1.1.tgz
promptopt doctor
```

Then use command `promptopt` with no arguments as a stdio server. On Windows, the generated absolute `node` configuration avoids `.cmd` launch differences.

For the registry package, use a pinned version (check [npm](https://www.npmjs.com/package/prompt-optimizer-mcp-engine) for availability):

```sh
npx -y prompt-optimizer-mcp-engine@0.1.1
```

The source repository is [terngg/prompt-optimizer](https://github.com/terngg/prompt-optimizer). Use its documented local skill installer to copy the skill into your chosen host and scope.

## Use the published package helpers without cloning

Install the package and locate its included scripts. In a POSIX shell, from your target project:

```sh
npm install --global prompt-optimizer-mcp-engine@0.1.1
PROMPTOPT_ROOT="$(npm root -g)/prompt-optimizer-mcp-engine"
node "$PROMPTOPT_ROOT/scripts/config.mjs" antigravity
node "$PROMPTOPT_ROOT/scripts/install-skill.mjs" --agent antigravity --scope project --project "$PWD"
```

The first helper prints MCP configuration; merge it into the path documented by your host. Replace `antigravity` with `codex`, `claude-code`, `cursor`, `opencode` or `generic`. For Antigravity CLI global skill installation, use `--agent antigravity-cli --scope user` instead. These helpers do not automatically edit MCP configuration.

PowerShell equivalent:

```powershell
npm install --global prompt-optimizer-mcp-engine@0.1.1
$PromptOptRoot = Join-Path (npm root -g) 'prompt-optimizer-mcp-engine'
node (Join-Path $PromptOptRoot 'scripts/config.mjs') antigravity
node (Join-Path $PromptOptRoot 'scripts/install-skill.mjs') --agent antigravity --scope project --project (Get-Location).Path
```

The generated absolute Node command avoids GUI PATH and Windows `.cmd` launch differences. Keep the global package installed after configuring a host.
