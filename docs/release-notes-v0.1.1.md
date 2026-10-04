# Prompt Optimizer v0.1.1

**Better instructions before your agent starts working.**

This focused patch makes the portable Agent Skill easier to discover for substantial tasks and clearer about what happens after optimization. The MCP tools, transports and core architecture remain unchanged.

## Highlights

- **Earlier, selective activation.** Stronger discovery guidance for vague, complex, multi-feature, repository-aware coding/UI, debugging/refactoring and research/context tasks. Optimize before implementation, with only necessary read-only context lookup first.
- **Direct tasks stay direct.** Trivial edits, factual questions and precise commands bypass optimization unless explicitly requested. Additional tools are used only when justified.
- **One execution contract.** Use the validated optimizer result below explicit user and higher-priority instructions. Do not turn it into a broader specification or invent major features, pages, services, dependencies or architecture.
- **No recursive rewriting.** Normally make one primary optimization call; do not optimize its own output. Explicit iterative requests and material task changes remain supported.
- **A clearer public project.** New preview artwork, architecture diagram, concise onboarding, supported-agent evidence and activation troubleshooting.

These are host-agent instructions reinforced by regressions, not a mechanism that can force every model to comply.

## Validation

The local suite has **221 tests across seven files**, including nineteen new skill regressions for activation/skip examples, execution ordering, scope, recursion, selective tools and version consistency. Tests cover both MCP transports and fresh production tarball installs, SDK exports, CLI, doctor and skill copying. See the [verification report](https://github.com/terngg/prompt-optimizer/blob/v0.1.1/docs/verification.md) for checks and evidence boundaries.

**Antigravity CLI field validation:** the user confirmed global MCP and skill installation, discovery of all nine tools, explicit invocation, references, repository awareness and public npm use in v0.1.x. The subsequent v0.1.1 fresh-session replay confirmed automatic activation for a complex Next.js dashboard task and use of the optimized instruction as the execution contract. This is user-reported live evidence for that workflow, not a benchmark or a guarantee for all tasks. Other hosts retain documented integrations and automated protocol coverage without a live-host claim.

## Upgrade

```sh
npx -y prompt-optimizer-mcp-engine@0.1.1 --version
```

Pin your MCP configuration to `0.1.1`. **Updating the npm MCP package alone does not replace an already-installed Agent Skill copy.** Review and refresh the complete `prompt-optimizer` skill directory, including its references, then restart the host. The installer intentionally refuses overwrite; preserve any local customization before replacing a previous copy.

[Installation guides](https://github.com/terngg/prompt-optimizer#install-guides) · [Activation troubleshooting](https://github.com/terngg/prompt-optimizer/blob/v0.1.1/docs/troubleshooting.md#mcp-visible-but-optimizer-does-not-auto-trigger)
