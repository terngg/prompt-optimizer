# Optional AI providers

Local optimization is the default and needs no key. Provider mode is an optional enhancement; the host still performs the task.

## Server configuration

Set only the variables you need in the MCP server's environment (through your host's supported secret configuration). Do not commit credentials:

| Variable                       | Meaning                                                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| `PROMPTOPT_ALLOW_REMOTE`       | Must be exactly `true` to enable remote assistance                                 |
| `PROMPTOPT_PROVIDER`           | `openai-compatible`, `anthropic`, or `gemini`                                      |
| `PROMPTOPT_MODEL`              | Required provider model ID; choose one available to your account                   |
| `PROMPTOPT_API_KEY`            | Optional only when the endpoint permits unauthenticated use                        |
| `PROMPTOPT_BASE_URL`           | Optional API base URL, such as an OpenAI-compatible HTTPS gateway ending in `/v1/` |
| `PROMPTOPT_EVALUATOR_PROVIDER` | Optional separate evaluator kind                                                   |
| `PROMPTOPT_EVALUATOR_MODEL`    | Evaluator model ID                                                                 |
| `PROMPTOPT_EVALUATOR_API_KEY`  | Evaluator key                                                                      |
| `PROMPTOPT_EVALUATOR_BASE_URL` | Evaluator API base URL                                                             |

Default bases: OpenAI `https://api.openai.com/v1/`, Anthropic `https://api.anthropic.com/v1/`, Gemini `https://generativelanguage.googleapis.com/v1beta/`. Supply a base, not the final endpoint. Models are never guessed. Generic `OPENAI_API_KEY` and unrelated environment variables are not automatically read.

Then explicitly call `optimize_prompt` with `mode: "fast"`, `"balanced"`, `"high"`, or `"max"`. A configured key alone does not trigger network use. Source and selected context may leave the machine; see [security](security.md). Invalid startup config disables AI with a safe stderr notice while local tools remain usable.

| Mode     | Maximum calls | Behavior                                            |
| -------- | ------------: | --------------------------------------------------- |
| local    |             0 | Deterministic passes                                |
| fast     |             1 | One candidate plus bounded validation               |
| balanced |             1 | Same validated one-candidate path in v0.1           |
| high     |             3 | Candidate, critique, revision                       |
| max      |             5 | Two candidates, critique, synthesis, final critique |

All modes use the original redacted task and enforce addition budgets. Heuristics cannot certify semantic fidelity. A separate evaluator reduces shared-model bias but does not make the result scientific evidence. Rejection can finish early. Timeouts and malformed output retain local guidance.

## SDK

```ts
import { PromptOptimizer, HttpProvider } from 'prompt-optimizer-mcp-engine';

const optimizer = new PromptOptimizer({
  allowRemote: true,
  provider: new HttpProvider({
    kind: 'openai-compatible',
    model: process.env.PROMPTOPT_MODEL!,
    apiKey: process.env.PROMPTOPT_API_KEY,
    baseUrl: process.env.PROMPTOPT_BASE_URL,
  }),
});
const result = await optimizer.optimize({ prompt: 'fix auth', mode: 'fast' });
```

Use this import after installing the release tarball or published package. In this checkout, the built SDK is `dist/packages/sdk/src/index.js`. A custom `OptimizationProvider` can implement `complete({system,prompt,signal})`. It must honor cancellation and avoid logging; the engine also bounds its wait.

The adapters use documented [Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create), [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create), and [Gemini generateContent](https://ai.google.dev/gemini-api/docs/text-generation) formats. OpenAI-compatible gateways must support `max_completion_tokens`. These wire formats are tested against local HTTP fixtures; no paid provider/model execution was performed.

MCP sampling is deprecated as of the current protocol. No sampling request is sent, including when a host advertises the older capability. [Official lifecycle notice](https://modelcontextprotocol.io/specification/2026-07-28/client/sampling).
