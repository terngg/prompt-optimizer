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

For a published release, use the version-pinned package command (check [npm](https://www.npmjs.com/package/prompt-optimizer-mcp-engine) for availability):

```sh
npx -y prompt-optimizer-mcp-engine@0.1.0
```

The source repository is [terngg/prompt-optimizer](https://github.com/terngg/prompt-optimizer). Use its documented local skill installer to copy the skill into your chosen host and scope.
