# Prompt Optimizer v0.1.0

Give every AI agent better instructions.

This first release adds an instruction capability to existing agents through a portable Agent Skill and an MCP server. Local optimization needs no key and includes intent analysis, bounded domain passes, context selection, conflict diagnostics and transparent explanations. The same engine is available through a TypeScript SDK.

Nine tools, five read-only resources and five optional prompts run over stdio and loopback Streamable HTTP. The official v2 SDK serves current 2026-07-28 discovery and legacy 2025-11-25 initialization. Installation guides cover Codex, Claude Code, Antigravity IDE/CLI, Cursor, OpenCode and generic hosts. Optional provider adapters add bounded model assistance with deterministic fallback.

See the repository's verification report for executed checks. Host integration guides are documentation-based; no live vendor-host or paid-model certification is claimed. Scores and estimates are heuristic. MCP sampling is intentionally omitted following its deprecation. HTTP is local-only, and redaction does not guarantee removal of arbitrary secrets.

Source: https://github.com/terngg/prompt-optimizer. Package: `prompt-optimizer-mcp-engine@0.1.0`.
