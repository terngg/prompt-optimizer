# API reference

The MCP schemas returned by `tools/list` are the authoritative machine-readable contract. Every tool has a strict input and structured output schema plus text content. SDK exports are available from the package root and `/core`, `/providers`, `/server` subpaths.

## optimize_prompt

```json
{
  "prompt": "fix auth",
  "targetAgent": "auto",
  "profile": "balanced",
  "mode": "local",
  "context": [],
  "maxTokens": 400,
  "explain": true,
  "disabledPasses": [],
  "audience": "auto"
}
```

Only `prompt` is required. Targets: auto, universal, codex, claude-code, antigravity, cursor, opencode, generic-agent. Audience: auto, chat, coding-agent, research-agent, autonomous-agent, image-agent. Profiles: minimal, balanced, thorough. Modes: local, fast, balanced, high, max. A null `maxTokens` means no caller total cap; profile addition caps still apply.

Return fields: `optimizedPrompt`, `detectedIntent`, `selectedPasses`, `skippedPasses`, `diagnostics`, `assumptions`, `tokenEstimate`, `changes`, `confidence`, `ir`, `context`, `metadata`. `metadata` records version, output hash, repeated-input status, requested mode, attempted provider use/calls, latency and heuristic evaluation type. `remoteUsed` means a provider invocation was attempted; it is conservative and does not prove successful delivery. `explain: false` removes pass reasons/change text and skipped reports; other diagnostics remain.

An identical repeat can include `previousOptimization: {"version":1,"outputHash":"<64-character result hash>"}`. A changed input does not match. There is no persistent task ID or history.

## Context

```json
{
  "id": "auth-log",
  "kind": "error",
  "text": "Login returns 401 on Safari.",
  "critical": true
}
```

Kinds: repository, conversation, requirement, documentation, error, code, preference, memory. IDs must be unique. `critical` affects retention, never priority. `compress_context` takes `context`, optional `query`, and `maxTokens` (default 2000). It returns selected items with relevance/compression flags, dropped IDs, duplicate count, estimates, overflow flag and diagnostics. Exact code/error/requirement items are never partially extracted. Prose extraction keeps complete relevant lines; it is lossy and labeled.

## Other tools

| Tool                         | Input                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| inspect_prompt               | `prompt`, optional `context`                                             |
| adapt_prompt                 | `prompt`, `targetAgent`, optional `audience`                             |
| evaluate_prompt              | `prompt`, optional `originalPrompt`                                      |
| compare_prompts              | `promptA`, `promptB`, optional `taskContext`                             |
| build_agent_instruction      | `goal`, optional `requirements`, `constraints`, `context`, `targetAgent` |
| explain_optimization         | `result` containing a complete prior optimization result                 |
| suggest_optimization_profile | `prompt`                                                                 |

`adapt_prompt` disables domain additions and adds host/audience guidance; conservative prose deduplication may still apply. `build_agent_instruction` validates the final combined prompt against the same source limit. `explain_optimization` describes caller-supplied records, not authenticated server provenance. Use `explain: true` on the original call if later detail matters.

SDK: `new PromptOptimizer(options).optimize(input)` and `.inspect(input)`; standalone `inspectPrompt`, `classify`, `analyze`, `compressContext`, `evaluatePrompt`, `comparePrompts`, `suggestProfile`, `serializeTask`, `deserializeTask`; shared schemas, types and pass registry are also exported. Prefer the validated entrypoints `optimize` and `inspectPrompt` for untrusted input; `analyze`/`classify` are low-level helpers.

## Errors

Invalid tool schemas produce MCP tool errors. Combined limits or processing failures return `isError: true` with safe repair guidance. The debug CLI exits nonzero on invalid arguments or unavailable input files. Provider failures are diagnostics on a successful deterministic optimization. No stack traces or submitted bodies are logged by the application.
