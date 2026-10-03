# Verification report

Local verification date: 2026-10-03. Environment: Linux x64, Node 22.23.3, pnpm 10.32.1. These local checks involved no paid model calls, live vendor-host execution or telemetry.

## Executed checks

Formatting, lint, typecheck, build, all 202 tests, skill validation, transport smoke, doctor, example calls and local-link checks passed. A fresh production-only tarball install passed SDK, binary, CLI, doctor, skill-copy, stdio and HTTP checks. Production dependency audits reported zero known vulnerabilities for both the pnpm lockfile and the freshly installed npm dependency tree. These are registry advisory checks, not security certification.

The release verification runs the following commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm run doctor
pnpm examples
npm pack
pnpm verify:pack
pnpm run audit
# POSIX shell: verify this exact artifact in another fresh production install.
PROMPTOPT_TEST_TARBALL="$PWD/prompt-optimizer-mcp-engine-0.1.0.tgz" pnpm test:tarball
```

`pnpm check` covers formatting, ESLint, strict TypeScript, build, Vitest, skill validation, MCP smoke and local Markdown links. The test suite covers all supported intent categories, selective passes, source preservation, code preservation, restrictions, explicit conflicts, impossible budgets, recursion metadata, large/duplicate/malicious context, redaction, provider boundaries, timeouts, bounded orchestration and skill copying.

The 202 tests comprise 161 unit/edge/skill tests, 31 MCP integration tests and 10 production artifact tests. `pnpm test:unit`, `pnpm test:integration` and `pnpm test:tarball` select these groups. Adjacent duplicates are removed; repeated instructions separated by either ordinary prose or another recognized instruction remain in order. The disabled-dedup regression uses an instruction that would otherwise be eligible for removal.

MCP tests run the official client against stdio and loopback HTTP in both legacy and modern modes. They verify initialization/discovery, nine tools with strict input/output schemas, five resources (including reads), five prompts (including rendering), all tool calls, structured output and invalid input. Additional tests exercise stdio EOF, oversized frames, HTTP Host/Origin/path/body checks. `pnpm smoke` repeats the essential discovery/call checks against compiled JavaScript.

Provider tests use local HTTP fixtures and deterministic DNS mocking. They check all three request/response formats, credential placement, source redaction, redirect rejection, response limits, private-address rejection, deadline handling and deterministic fallback. These are adapter tests, not real model quality results.

The skill passed the included Node validator and the Codex skill-authoring `quick_validate.py` validator. Skill copy tests exercise each supported agent's project and user path using temporary directories, plus overwrite refusal and symlink rejection. The optional plugin and MCP manifests were validated against the fetched official Agent Plugins 1.0.0 JSON Schemas using Ajv 8.20.0.

A release tarball is packed with `npm pack` and installed using `npm install --ignore-scripts --omit=dev --no-audit --no-fund` into an isolated temporary project. Public SDK exports, offline optimization, the installed binary, all three file CLI commands, doctor, skill copying and its linked references are verified there. Both stdio and HTTP launch the installed CLI and verify discovery, structured tool calls and invalid input in legacy and modern modes. No transport server is imported from the source checkout for these artifact tests. The packed file list is checked for required runtime/distribution files and excluded tests, node_modules and environment files.

Final review found that the old audit wrapper treated npm's missing-lockfile error as zero vulnerabilities. It now uses the pnpm production lockfile audit and fails on missing results, failed commands or advisories at any severity. A manual check with an unreachable registry returned exit status 1 and a safe error message, confirming that unavailable audit results cannot pass the release gate. The artifact tests independently audit their npm lockfile.

## Evidence boundaries

- No actual Codex, Claude Code, Antigravity, Cursor, OpenCode, VS Code or Gemini host was launched. Installation instructions come from official documentation.
- CI is configured for Linux, Windows and macOS on Node 22/24, but remote CI has not run until the repository is published.
- No paid provider/account/model was called. No measured execution-quality gain is claimed.
- These checks do not establish publication. Check [GitHub releases](https://github.com/terngg/prompt-optimizer/releases) and the [npm registry](https://www.npmjs.com/package/prompt-optimizer-mcp-engine) separately. No plugin marketplace listing is claimed.
- `doctor` verifies local startup, not host-specific trust, permissions or automatic skill selection.

See [compatibility](compatibility.md), [security](security.md) and [release preparation](releasing.md) for remaining external release steps.
