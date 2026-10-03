# References and independent design

Research performed 2026-10-03 using official specifications, vendor guides, repository READMEs, GitHub repository license metadata and license files for ambiguous metadata. No source implementation or substantial skill text was copied. These projects are not runtime dependencies, affiliations or endorsements. License labels describe inspected snapshots, not every file or future version.

## Standards and host sources

- [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28): protocol capabilities and transport model.
- [Official TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/): stable server/client packages, current discovery and legacy fallback.
- [Agent Skills specification](https://agentskills.io/specification): portable frontmatter, naming, relative references and progressive disclosure.
- [Agent Plugins 1.0.0](https://agent-plugins.org/specification) and [OpenAI packaging](https://developers.openai.com/plugins/build/plugins): fixed root manifest, skills and MCP configuration.
- [Codex MCP](https://developers.openai.com/codex/mcp) and [skills](https://developers.openai.com/codex/skills): configuration and task-local skill use.
- [Claude Code MCP](https://code.claude.com/docs/en/mcp) and [skills](https://code.claude.com/docs/en/skills): CLI syntax and scope.
- [Antigravity MCP](https://www.antigravity.google/docs/mcp) and [skills](https://www.antigravity.google/docs/skills): verified current IDE and CLI locations.
- [Cursor MCP](https://cursor.com/docs/mcp) and [skills](https://prod.cursor.com/docs/skills): local/remote configuration and discovery.
- [OpenCode MCP](https://opencode.ai/docs/mcp-servers/) and [skills](https://opencode.ai/docs/skills/): its distinct command-array format.

## Project study

| Project / inspected repository                                       | License observed                                              | Concept considered                                           | Our distinction                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| [DSPy](https://github.com/stanfordnlp/dspy)                          | MIT                                                           | Modular optimization and measurable objectives               | Deterministic per-task guidance; no training or dataset-driven optimizer claim      |
| [Promptfoo](https://github.com/promptfoo/promptfoo)                  | MIT                                                           | Reproducible regressions and adversarial fixtures            | Local invariants and protocol tests, not a hosted evaluation platform               |
| [Langfuse](https://github.com/langfuse/langfuse)                     | MIT outside enterprise directories; separate enterprise terms | Explainable execution traces                                 | In-memory pass reports without prompt telemetry or persistence                      |
| [OpenAI Evals](https://github.com/openai/evals)                      | MIT code; datasets have separate licenses                     | Task-specific evaluation evidence                            | Heuristic diagnostics explicitly distinguished from benchmark results               |
| [Outlines](https://github.com/dottxt-ai/outlines)                    | Apache-2.0                                                    | Typed output contracts                                       | Validate provider JSON and MCP results; no constrained decoder                      |
| [Guardrails AI](https://github.com/guardrails-ai/guardrails)         | Apache-2.0                                                    | Validation as a separate boundary                            | Small deterministic checks, no claim of complete model safety                       |
| [Mem0](https://github.com/mem0ai/mem0)                               | Apache-2.0                                                    | Relevance and memory selection                               | Caller-provided memory only; no persistent memory service                           |
| [LiteLLM](https://github.com/BerriAI/litellm)                        | MIT outside enterprise directory; separate enterprise terms   | Provider-neutral interfaces                                  | Three small wire adapters, no model gateway or cost-routing service                 |
| [Haystack](https://github.com/deepset-ai/haystack)                   | Apache-2.0                                                    | Explicit composable pipelines                                | Small in-process instruction pipeline without retrieval infrastructure              |
| [LangGraph](https://github.com/langchain-ai/langgraph)               | MIT                                                           | Bounded workflow state and failure handling                  | Host executes; optimizer does not become an agent runtime                           |
| [Agent-Reach](https://github.com/Panniantong/Agent-Reach)            | MIT                                                           | Installable capability plus onboarding diagnostics           | Instruction capability rather than internet/search access                           |
| [caveman](https://github.com/JuliusBrussee/caveman)                  | Apache-2.0                                                    | Token cost as an explicit concern                            | Preserve fluent source wording; limit additions and remove safe duplicates          |
| [superpowers](https://github.com/obra/superpowers)                   | MIT                                                           | Skills that guide an existing agent                          | Selective activation rather than imposing an entire methodology                     |
| [ponytail](https://github.com/DietrichGebert/ponytail)               | MIT                                                           | Proportional implementation and avoiding excess architecture | Domain-gated recommendations rather than a global personality                       |
| [impeccable](https://github.com/pbakaus/impeccable)                  | Apache-2.0                                                    | Context-sensitive UI quality                                 | Focused UI passes without adopting its skill text or visual ruleset                 |
| [context-mode](https://github.com/mksglu/context-mode)               | Elastic License 2.0; source-available with restrictions       | Context budgets and output containment                       | No code incorporated; independent in-memory ranking/extraction, no sandbox or hooks |
| [OpenShell](https://github.com/NVIDIA/OpenShell)                     | Apache-2.0                                                    | Explicit trust/egress boundaries                             | No shell or agent execution; transport and provider boundaries only                 |
| [Anthropic skills](https://github.com/anthropics/skills)             | Per-skill licensing; repository has mixed examples            | Progressive discovery and references                         | Original instruction-only portable skill; no sample skill copied                    |
| [Marketing Skills](https://github.com/coreyhaines31/marketingskills) | MIT                                                           | Audience, brand facts, SEO intent                            | Small domain passes, not an imported marketing playbook                             |

The root LICENSE files of Langfuse, LiteLLM and OpenAI Evals were read because API license metadata alone reported “Other.” context-mode's ELv2 restrictions rule out treating it as a permissively licensed dependency. No training datasets, assets, benchmarks, logos, proprietary integrations or source code from these projects are incorporated.
