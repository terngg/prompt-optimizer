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
| Package cannot be found on npm     | This repository has not yet been published; install the local tarball                                                            |

`promptopt doctor` checks Node, skill availability, trusted provider configuration presence/validity and an ephemeral loopback MCP initialization. It does not call a provider, reveal keys, or prove a particular host can launch stdio. `pnpm smoke` exercises both transports and discovery eras. Use `pnpm run doctor`, because pnpm has its own unrelated built-in `doctor` command.

For reports include version, OS, Node version, transport, host version and a minimal sanitized fixture. Do not include actual credentials or private context. No debug mode intentionally logs prompt bodies.
