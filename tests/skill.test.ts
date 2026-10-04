import { it, expect } from 'vitest';
import { readFile, mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
it('validates skill frontmatter and links', async () => {
  const { parse } = await import('yaml');
  const text = await readFile('skills/prompt-optimizer/SKILL.md', 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  expect(match).not.toBeNull();
  const meta = parse(match![1]!);
  expect(meta.name).toBe('prompt-optimizer');
  expect(meta.description.length).toBeLessThan(1024);
  expect(text.split('\n').length).toBeLessThan(100);
  for (const [, link] of text.matchAll(/\]\((references\/[^)]+)\)/g)) {
    expect(
      await readFile(join('skills/prompt-optimizer', link!), 'utf8'),
    ).toBeTruthy();
  }
});
it('installs a standalone copy with references intact', async () => {
  const root = await mkdtemp(join(tmpdir(), 'promptopt-skill-'));
  try {
    const target = join(root, '.agents', 'skills', 'prompt-optimizer');
    await cp('skills/prompt-optimizer', target, { recursive: true });
    const text = await readFile(join(target, 'SKILL.md'), 'utf8');
    for (const [, link] of text.matchAll(/\]\((references\/[^)]+)\)/g))
      expect(await readFile(join(target, link!), 'utf8')).toBeTruthy();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// Instruction-contract lint, not a simulated LLM or proof of host activation.
// Fixed user prompts are regression inputs; surrounding prose can be reworded.
const skillText = await readFile('skills/prompt-optimizer/SKILL.md', 'utf8');
const { parse } = await import('yaml');
const skillMeta = parse(skillText.match(/^---\n([\s\S]*?)\n---\n/)![1]!);
const corpus: { case: string; prompt: string; decision: string }[] = JSON.parse(
  await readFile('tests/fixtures/skill-activation.json', 'utf8'),
);
const examples = new Map(
  [...skillText.matchAll(/^- (Optimize|Skip): `([^`]+)`/gm)].map((match) => [
    match[2]!.toLocaleLowerCase(),
    match[1]!.toLocaleLowerCase(),
  ]),
);
const paragraphs = skillText.split(/\n\s*\n/);
function clauseWith(...concepts: RegExp[]) {
  return paragraphs.find((paragraph) =>
    concepts.every((concept) => concept.test(paragraph)),
  );
}

it.each(corpus)(
  'documents the activation decision for $case',
  ({ prompt, decision }) => {
    expect(examples.get(prompt.toLocaleLowerCase())).toBe(decision);
  },
);

it('exposes material trigger categories at discovery time, with selective exclusions', () => {
  const description = skillMeta.description;
  for (const concept of [
    /before.*(?:implementation|execution)/i,
    /vague|ambigu/i,
    /underspecified|missing requirements/i,
    /complex|multi-step/i,
    /multi-feature/i,
    /repository-aware/i,
    /coding/i,
    /debugging/i,
    /UI\/UX/i,
    /architectur/i,
    /refactor/i,
    /research|heavy context/i,
    /conflict/i,
    /assumptions|scope drift/i,
    /skip.*trivial/i,
    /factual/i,
    /one-step command/i,
  ])
    expect(description).toMatch(concept);
  expect(description.length).toBeLessThan(1024);
  expect(skillText.length).toBeLessThan(7500);
});

it('gives explicit prompt optimization precedence over trivial-task exclusions', () => {
  expect(skillMeta.description).toMatch(
    /explicit requests.*(?:always|must) activate/i,
  );
  expect(skillMeta.description).toMatch(/skip.*unless.*explicitly requested/i);
  expect(
    clauseWith(/explicit.*always activate/i, /without executing/i),
  ).toBeDefined();
});

it('orders bounded context lookup, optimization, validation, execution and verification', () => {
  const steps = [...skillText.matchAll(/^\d+\. (.+)$/gm)].map(
    (match) => match[1]!,
  );
  expect(steps).toHaveLength(4);
  expect(steps[0]).toMatch(/read.only.*(?:minimum|necessary)/i);
  expect(steps[0]).toMatch(/do not begin.*before optimizing/i);
  expect(steps[1]).toMatch(/optimize_prompt.*original request/i);
  expect(steps[2]).toMatch(/validat.*original request/i);
  expect(steps[3]).toMatch(/execute.*contract.*verify/i);
});

it('makes the validated optimizer result the execution contract below higher-priority instructions', () => {
  expect(
    clauseWith(
      /validation passes/i,
      /treat `optimizedPrompt` as the execution contract/i,
      /subject to.*user.*project.*developer.*system/i,
      /never override/i,
    ),
  ).toBeDefined();
});

it('forbids independent specification expansion and restricts additions to necessary work', () => {
  const contract = clauseWith(/do not.*rewrite.*broader specification/i);
  expect(contract).toBeDefined();
  for (const concept of [
    /do not invent/i,
    /features/i,
    /architecture/i,
    /dependencies/i,
    /pages/i,
    /services/i,
    /requirements/i,
    /unless required by.*user.*project.*validated optimizer result/i,
    /repository-specific.*only when necessary/i,
    /smallest implementation/i,
    /references.*do not expand/i,
  ])
    expect(contract).toMatch(concept);
});

it('prevents recursive output optimization with bounded, task-local exceptions', async () => {
  expect(
    clauseWith(
      /at most one primary optimization/i,
      /do not run.*optimize_prompt.*recursively on its own output/i,
      /task-local.*metadata\.version.*metadata\.outputHash/i,
      /materially changed user requirements.*explicit user request/i,
      /evaluation.*not an automatic rewrite loop/i,
    ),
  ).toBeDefined();
  const { resourceData } = await import('../apps/mcp-server/src/server.js');
  expect(resourceData.skills.activation).toMatch(/before execution/i);
  expect(resourceData.skills.activation).toMatch(
    /never recursively optimize output/i,
  );
});

it('keeps optional tools selective instead of requiring a full tool chain', () => {
  expect(
    clauseWith(
      /optimize_prompt.*usual primary tool/i,
      /inspect_prompt.*analysis without rewriting/i,
      /compress_context.*noisy context/i,
      /evaluate_prompt.*only.*validation concern/i,
      /do not chain all tools/i,
    ),
  ).toBeDefined();
});

it('keeps the MCP-unavailable fallback inside the same scope and recursion limits', () => {
  expect(clauseWith(/MCP is unavailable/i)).toBeDefined();
  expect(
    clauseWith(
      /lightweight internal check/i,
      /same scope limits and recursion rule/i,
      /do not install tools/i,
    ),
  ).toBeDefined();
});

it('keeps package, engine, plugin and installed skill versions synchronized', async () => {
  const { VERSION } = await import('../packages/shared/src/index.js');
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const plugin = JSON.parse(await readFile('plugin.json', 'utf8'));
  expect(VERSION).toBe(pkg.version);
  expect(plugin.version).toBe(pkg.version);
  expect(skillMeta.metadata.version).toBe(pkg.version);
});

it('preserves the reported dashboard request without adding the observed unrelated features', async () => {
  const { PromptOptimizer } = await import('../packages/core/src/index.js');
  const prompt = corpus.find((entry) =>
    entry.case.includes('Antigravity'),
  )!.prompt;
  const result = await new PromptOptimizer().optimize({
    prompt,
    targetAgent: 'antigravity',
  });
  expect(result.optimizedPrompt.startsWith(prompt)).toBe(true);
  for (const unrequested of [
    'model registry',
    'prompt studio',
    'image generation studio',
    'API-key management',
    'webhooks',
    'autonomous-agent monitoring',
  ]) {
    expect(result.optimizedPrompt.toLowerCase()).not.toContain(
      unrequested.toLowerCase(),
    );
  }
  expect(result.metadata.remoteUsed).toBe(false);
});
