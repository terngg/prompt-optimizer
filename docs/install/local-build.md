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
npm install --global ./prompt-optimizer-mcp-engine-0.1.0.tgz
promptopt doctor
```

Then use command `promptopt` with no arguments as a stdio server. On Windows, the generated absolute `node` configuration avoids `.cmd` launch differences.

Registry name `prompt-optimizer-mcp-engine` returned 404 on 2026-10-03. This is an availability check, not a reservation. No release has been published. Only after publication will this work:

```sh
npx -y prompt-optimizer-mcp-engine@0.1.0
```

A final GitHub owner has not been assigned. Until then, use the local skill installer rather than an invented `npx skills add OWNER/REPO` command.
