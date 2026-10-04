# Compatibility and evidence

Research date: **2026-10-03**. Compatibility is a protocol/configuration claim, not vendor endorsement.

## Protocol and toolchain actually exercised

| Component             | Tested version / scope                                         | Status                                          |
| --------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| Node.js               | 22.23.3, Linux x64                                             | Executed locally                                |
| pnpm                  | 10.32.1                                                        | Executed locally                                |
| MCP server/client SDK | `@modelcontextprotocol/server` and `client` 2.3.0              | Executed locally                                |
| Node HTTP wrapper     | `@modelcontextprotocol/node` 2.1.1                             | Executed locally                                |
| MCP modern            | 2026-07-28, stdio and Streamable HTTP discovery                | Automated tests + smoke passed                  |
| MCP legacy            | 2025-11-25 initialization, stdio and stateless Streamable HTTP | Automated tests + smoke passed                  |
| Agent Skills          | Current unversioned specification retrieved 2026-10-03         | Frontmatter, paths, copy installation validated |
| Agent Plugins         | 1.0.0 root manifest and MCP configuration                      | Prepared; live host installation not tested     |
| Windows / macOS       | CI matrix configured                                           | Not executed locally                            |
| Node 24               | CI matrix configured                                           | Not executed locally                            |

The latest stable SDK was verified through npm's registry. v2 is the current stable line, with separate server/client/Node packages. [Official SDK](https://ts.sdk.modelcontextprotocol.io/v2/) · [Current MCP specification](https://modelcontextprotocol.io/specification/2026-07-28). Sampling is deprecated; new implementations should not adopt it. This project uses direct optional provider APIs. [Sampling lifecycle](https://modelcontextprotocol.io/specification/2026-07-28/client/sampling).

## Host matrix

“Documented” means official documentation was inspected. “Implemented” means this repository contains the adapter/configuration/skill support. “Manually tested” means actual host execution, not an SDK-client simulation. Antigravity CLI has user-reported v0.1.x live testing, including a fresh-session v0.1.1 automatic-activation replay. The exact host version was not supplied.

| Agent                | MCP support                      | Skill support                                | Installation            | Documented    | Implemented      | Tested host version | Manually tested     |
| -------------------- | -------------------------------- | -------------------------------------------- | ----------------------- | ------------- | ---------------- | ------------------- | ------------------- |
| Codex                | stdio / Streamable HTTP          | `.agents/skills`                             | CLI or TOML + copy      | Yes           | Yes              | —                   | Not tested          |
| Claude Code          | stdio / HTTP                     | `.claude/skills`                             | `claude mcp add` + copy | Yes           | Yes              | —                   | Not tested          |
| Antigravity IDE      | stdio / HTTP (`serverUrl`)       | `.agents/skills`                             | MCP JSON + copy         | Yes           | Yes              | —                   | Not tested          |
| Antigravity CLI      | stdio / HTTP (`serverUrl`)       | `.agents/skills`; different global directory | MCP JSON + copy         | Yes           | Yes              | Not supplied        | User report: v0.1.x |
| Cursor               | stdio / Streamable HTTP          | `.cursor/skills`, `.agents/skills`           | MCP JSON + copy         | Yes           | Yes              | —                   | Not tested          |
| OpenCode             | local command array / remote URL | `.opencode/skills`, `.agents/skills`         | OpenCode JSON + copy    | Yes           | Yes              | —                   | Not tested          |
| VS Code native agent | stdio / HTTP                     | Host-specific                                | `servers` config        | Yes (MCP)     | Config generator | —                   | Not tested          |
| Gemini CLI           | stdio / HTTP                     | Host-specific                                | Generic MCP entry       | Yes (MCP)     | Generic guide    | —                   | Not tested          |
| Other hosts          | Standard MCP                     | Standard Agent Skills where implemented      | Host-specific           | Standard only | Generic guides   | —                   | Not tested          |

Sources and exact commands: [Codex](install/codex.md), [Claude Code](install/claude-code.md), [Antigravity](install/antigravity.md), [Cursor](install/cursor.md), [OpenCode](install/opencode.md), [generic](install/generic-mcp.md).

Automatic skill selection is a host behavior and cannot be guaranteed. Per-tool approvals and project trust settings remain in force. Tools-only clients work explicitly; skill-only hosts use a lightweight fallback. Provider adapters have local wire-format tests but no paid model/account compatibility certification. All output scores are heuristic.

## Antigravity CLI field report

The user confirmed v0.1.0 global MCP installation, Agent Skill installation, MCP discovery, all nine tools, explicit `optimize_prompt`, domain references, repository awareness and the public npm package. The exact Antigravity CLI version was not supplied.

Initial v0.1.0 testing exposed missed automatic activation for a multi-feature Next.js dashboard and unrelated scope expansion after explicit optimization. After the v0.1.1 skill update, the user reported that a fresh Antigravity CLI session automatically loaded the skill and invoked `optimize_prompt` for the complex repository-aware dashboard request, then treated the optimized instruction as the execution contract. The user also confirmed selective optimization and recursion prevention.

This is user-reported field evidence for the tested workflow, not an automated host benchmark or a guarantee for every request. Local structural/corpus tests independently check the documented trigger/skip policy, scope limits and recursion instructions; they do not measure model compliance or activation rates.
