# Troubleshooting

| Symptom                            | Check / fix                                                                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Host cannot start server           | Run `pnpm build`, then `pnpm run doctor`; generate absolute executable and entrypoint paths with `node scripts/config.mjs AGENT` |
| Server looks idle in a terminal    | Stdio waits for MCP messages; use `pnpm smoke` or connect a host                                                                 |
| No automatic optimization          | Confirm skill discovery, task suitability, project trust and tool permissions; request explicit use once                         |
| Trivial question is unchanged      | Intended behavior; the optimizer should stay out of the way                                                                      |
| Guidance ignores a restriction     | Keep the original authoritative; discard the recommendation and report a sanitized regression case                               |
| Unknown field error                | Use the advertised tool schema; provider URL/key fields belong in server configuration                                           |
| HTTP 403                           | Host/Origin must use the loopback endpoint and its actual port; do not route browser requests from another origin                |
| HTTP 404                           | Connect to `/mcp` exactly                                                                                                        |
| HTTP 405 on GET/DELETE             | Legacy HTTP is stateless; session operations are not implemented                                                                 |
| HTTP 413 or stdio disconnect       | Input exceeded the 2 MB transport cap; reduce context                                                                            |
| Context exceeds token budget       | Essential items were kept; review `budgetExceeded` and critical flags                                                            |
| Context is absent from text        | It did not fit; use structured `context.items` without promoting it into instructions                                            |
| AI unavailable                     | Enable remote access in trusted config and supply provider/model; local guidance still works                                     |
| Provider request failed            | Check model ID, API base, credentials, quota and HTTPS; provider body is intentionally not logged                                |
| Skill already exists               | Review the existing installation; installer will not overwrite it                                                                |
| Repeated optimization adds nothing | Pass matching `previousOptimization` only for an unchanged result; do not reuse it after changing the task                       |
| GUI host has a different PATH      | Use the generated absolute Node executable path                                                                                  |
| Package cannot be found on npm     | Check the requested version in npm; for an unpublished version, build and install its local tarball                              |

`promptopt doctor` checks Node, skill availability, trusted provider configuration presence/validity and an ephemeral loopback MCP initialization. It does not call a provider, reveal keys, or prove a particular host can launch stdio. `pnpm smoke` exercises both transports and discovery eras. Use `pnpm run doctor`, because pnpm has its own unrelated built-in `doctor` command.

For reports include version, OS, Node version, transport, host version and a minimal sanitized fixture. Do not include actual credentials or private context. No debug mode intentionally logs prompt bodies.

## MCP visible but optimizer does not auto-trigger

MCP discovery exposes tools; installing the Agent Skill supplies activation guidance. Seeing all nine tools does not prove the host has loaded the skill.

1. Check that the complete `prompt-optimizer` directory, including `SKILL.md` and `references/`, is in the host's documented search path. Antigravity CLI global skills use `~/.gemini/antigravity-cli/skills`; IDE global skills use `~/.gemini/config/skills`; project skills use `.agents/skills`. See the [host guide](install/antigravity.md) and the corresponding guide for other hosts.
2. Check the installed skill's metadata version and description. Updating npm does not update a previously copied skill. Review duplicate project/user copies and any host precedence rules. Back up and replace the old copy after review; the installer refuses overwrite.
3. Restart the host into a fresh session, then confirm skill discovery in its available skills/context. Some hosts inject skill text rather than showing an explicit `Read(.../SKILL.md)` event.
4. Confirm MCP is enabled, the server connects, `optimize_prompt` is available, and project trust/tool permissions allow its use.
5. Test explicitly: “Use prompt-optimizer to optimize this instruction without executing it: Buat dashboard AI modern pakai Next.js.” If this works but automatic use does not, inspect host skill selection and discovery rather than reinstalling a working MCP server.
6. Replay a qualifying task in another fresh session without naming the skill. Expect skill activation and one primary `optimize_prompt` call before implementation, with only necessary read-only repository lookup first. Do not expect every MCP tool to run. Trivial edits, factual questions and exact one-step commands should intentionally skip it.
7. Inspect execution after the call. The validated result is the contract: reject an independently expanded “Structured & Actionable” specification. A token/cost/model-status/request-history dashboard does not imply a prompt studio, webhooks or other unrequested products.

Use the examples in the [portable skill](../skills/prompt-optimizer/SKILL.md) for repeatable cases; the source checkout also carries `tests/fixtures/skill-activation.json`. Record host version, installed skill version, request, whether the skill loaded, tool call order, and any scope additions. The corpus and instruction lint are not an LLM host simulation and do not measure activation reliability. Host-specific routing, context limits, workspace policies and model choices can still prevent automatic activation. Explicit invocation remains the reliable fallback; a description cannot install an interception hook or override host policy.
