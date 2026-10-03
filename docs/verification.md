# Verification report

Local verification date: 2026-10-03. Environment: Linux x64, Node 22.23.3, pnpm 10.32.1. No paid model calls, live vendor-host execution, remote publication or telemetry occurred.

## Executed checks

Formatting, lint, typecheck, build, tests, skill validation, transport smoke, doctor, example calls and local-link checks passed. A fresh production-only tarball install passed SDK, binary, skill-copy and stdio checks. The production dependency audit reported zero known vulnerabilities across seven dependencies. This is a registry advisory check, not a security certification.

The release verification runs the following commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm run doctor
pnpm examples
pnpm pack
npm pack --dry-run
```

`pnpm check` covers formatting, ESLint, strict TypeScript, build, Vitest, skill validation, MCP smoke and local Markdown links. The test suite covers all supported intent categories, selective passes, source preservation, code preservation, restrictions, explicit conflicts, impossible budgets, recursion metadata, large/duplicate/malicious context, redaction, provider boundaries, timeouts, bounded orchestration and skill copying.

MCP tests run the official client against stdio and loopback HTTP in both legacy and modern modes. They verify initialization/discovery, nine tools with strict input/output schemas, five resources (including reads), five prompts (including rendering), all tool calls, structured output and invalid input. Additional tests exercise stdio EOF, oversized frames, HTTP Host/Origin/path/body checks. `pnpm smoke` repeats the essential discovery/call checks against compiled JavaScript.

Provider tests use local HTTP fixtures and deterministic DNS mocking. They check all three request/response formats, credential placement, source redaction, redirect rejection, response limits, private-address rejection, deadline handling and deterministic fallback. These are adapter tests, not real model quality results.

The skill passed the included Node validator and the Codex skill-authoring `quick_validate.py` validator. Skill copy tests exercise each supported agent's project and user path using temporary directories, plus overwrite refusal and symlink rejection. The optional plugin and MCP manifests were validated against the fetched official Agent Plugins 1.0.0 JSON Schemas using Ajv 8.20.0.

A release tarball is packed and installed with production dependencies into an isolated temporary project. SDK import, package binary, doctor, skill files and stdio discovery/calls are verified there. The packed file list is reviewed; it excludes source tests, node_modules, secrets and environment files.

## Evidence boundaries

- No actual Codex, Claude Code, Antigravity, Cursor, OpenCode, VS Code or Gemini host was launched. Installation instructions come from official documentation.
- CI is configured for Linux, Windows and macOS on Node 22/24, but remote CI has not run until the repository is published.
- No paid provider/account/model was called. No measured execution-quality gain is claimed.
- No npm package, GitHub repository or plugin marketplace listing was published.
- `doctor` verifies local startup, not host-specific trust, permissions or automatic skill selection.

See [compatibility](compatibility.md), [security](security.md) and [release preparation](releasing.md) for remaining external release steps.
