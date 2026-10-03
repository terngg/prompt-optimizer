# Contributing

Use Node.js 22+ and the pnpm version pinned in package.json. Run `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm examples` from the repository root. Format changes with `pnpm format`. Build before running transport tests; they execute the compiled server.

Keep the core independent of MCP. A pass needs a clear domain, concrete expected benefit, a small instruction, an explanation, coverage/blocking cues, and tests that prove scope preservation or another user-visible invariant. Test a relevant positive example and an unrelated negative example. Prefer fewer useful words over additional rules.

Never claim heuristic improvements as benchmark gains. Host support based on documentation is distinct from a live host test. Record version, transport and evidence when adding an integration claim. Remote fixtures must remain local and deterministic in CI; paid provider tests require an explicit separate opt-in and budget.

Submit a focused change with the problem, resulting behavior and validation evidence. All contributions are MIT licensed unless clearly documented otherwise. Do not copy substantial code or skill text from reference projects without reviewing licensing and attribution. Report security concerns via SECURITY.md rather than public exploit reports.
