import { describe, it, expect } from 'vitest';
import {
  PromptOptimizer,
  classify,
  compressContext,
  evaluatePrompt,
  comparePrompts,
} from '../packages/core/src/index.js';

const engine = new PromptOptimizer();

describe('Deduplication edge cases', () => {
  it('handles multiple paragraphs where only some are duplicated', async () => {
    const prompt =
      'Fix auth.\n\nRun the relevant tests.\n\nRun the relevant tests.\n\nDeploy to AWS.';
    const r = await engine.optimize({
      prompt,
      disabledPasses: [
        'debugging',
        'minimal-change',
        'repository-awareness',
        'regression-testing',
        'verification',
        'devops',
      ],
    });
    expect(r.optimizedPrompt.match(/Run the relevant tests\./g)).toHaveLength(
      1,
    );
    expect(r.optimizedPrompt).toContain('Fix auth');
    expect(r.optimizedPrompt).toContain('Deploy to AWS');
  });

  it('handles Indonesian instruction deduplication', async () => {
    const prompt = 'Gunakan TypeScript.\n\nGunakan TypeScript.';
    const r = await engine.optimize({
      prompt,
      disabledPasses: [
        'debugging',
        'minimal-change',
        'repository-awareness',
        'regression-testing',
        'verification',
      ],
    });
    expect(r.optimizedPrompt.match(/Gunakan TypeScript/g)).toHaveLength(1);
  });

  it('skips dedup when disabled via disabledPasses', async () => {
    const prompt = 'Run the relevant tests.\n\nRun the relevant tests.';
    const r = await engine.optimize({
      prompt,
      disabledPasses: ['instruction-deduplication'],
    });
    expect(r.optimizedPrompt.match(/Run the relevant tests\./g)).toHaveLength(
      2,
    );
  });

  it('handles very long single-paragraph inputs (no dedup expected)', async () => {
    const longText =
      'This is a long text ' + 'word '.repeat(100) + ' and more.';
    const r = await engine.optimize({ prompt: longText });
    expect(r.optimizedPrompt.startsWith('This is a long text')).toBe(true);
  });

  it('preserves code in mixed code and prose', async () => {
    const prompt =
      'Please review this:\n```\nx = 1;\nx = 1;\n```\nPlease review this:';
    const r = await engine.optimize({
      prompt,
      disabledPasses: [
        'debugging',
        'minimal-change',
        'repository-awareness',
        'regression-testing',
        'verification',
      ],
    });
    expect(r.optimizedPrompt.match(/x = 1/g)).toHaveLength(2);
  });
});

describe('Classification edge cases', () => {
  it('handles multi-language prompts (Indonesian + English mixed)', () => {
    const result = classify(
      'buatkan aku sebuah function in typescript to fetch data',
    );
    expect(result.primary).toBe('coding');
  });

  it('prompts that match multiple strong signals', () => {
    const result = classify('testing with vitest for the button layout');
    expect(result.primary).toBe('ui_ux');
    expect(result.secondary).toContain('testing');
  });

  it('handles edge-length prompts (near trivial boundary of 180 chars)', () => {
    const prompt = 'a'.repeat(179);
    const result = classify(prompt);
    expect(result.primary).toBe('general');
  });

  it('detects format (json, xml, markdown, code)', () => {
    const result = classify('analyze data in a csv dataset and output in JSON');
    expect(result.primary).toBe('data_analysis');
  });

  it('handles empty-like prompts that still pass validation (single character)', () => {
    const result = classify('a');
    expect(result.primary).toBe('general');
  });
});

describe('Context compression edge cases', () => {
  it('All items critical with tiny budget', () => {
    const r = compressContext({
      context: [
        { id: '1', text: 'Critical 1', critical: true },
        { id: '2', text: 'Critical 2', critical: true },
      ],
      maxTokens: 1,
    });
    expect(r.items).toHaveLength(2);
    expect(r.budgetExceeded).toBe(true);
  });

  it('Empty query with context', () => {
    const r = compressContext({
      query: '',
      context: [{ id: '1', text: 'Fact' }],
    });
    expect(r.items).toHaveLength(1);
  });

  it('Very large single context item vs many small items', () => {
    const r = compressContext({
      maxTokens: 100,
      context: [
        { id: '1', text: 'A '.repeat(200) },
        { id: '2', text: 'small 1' },
        { id: '3', text: 'small 2' },
      ],
    });
    expect(r.afterEstimated).toBeLessThanOrEqual(100);
  });

  it('Context with requirement kind (boosted relevance)', () => {
    const r = compressContext({
      query: 'auth',
      context: [
        { id: '1', text: 'auth is good', kind: 'documentation' },
        { id: '2', text: 'use OAuth', kind: 'requirement' },
      ],
    });
    expect(r.items.map((i) => i.id)).toContain('2');
  });

  it('Maximum context count boundary (128 items)', () => {
    const context = Array.from({ length: 128 }, (_, i) => ({
      id: String(i),
      text: `item ${i}`,
    }));
    const r = compressContext({ context, maxTokens: 10000 });
    expect(r.items.length).toBeLessThanOrEqual(128);
  });
});

describe('Evaluator edge cases', () => {
  it('Prompt with all quality signals present', () => {
    const prompt =
      'Please implement a solution. Add regression tests. Document the changes. Follow existing patterns. Be concise and precise.';
    const r = evaluatePrompt(prompt);
    expect(r.metrics.goalPreservation.score).toBeNull();
  });

  it('Prompt with no quality signals', () => {
    const r = evaluatePrompt('do stuff');
    expect(r.metrics.goalPreservation.score).toBeNull();
  });

  it('Original prompt identical to evaluated prompt', () => {
    const r = evaluatePrompt('fix auth', 'fix auth');
    expect(r.metrics.goalPreservation.score).toBe(100);
  });

  it('Very long prompt evaluation', () => {
    const prompt = 'x'.repeat(10000);
    const r = evaluatePrompt(prompt);
    expect(r.kind).toBe('heuristic diagnostics');
  });

  it('Comparison with task context that improves one prompt', () => {
    const r = comparePrompts(
      'fix auth',
      'fix auth with vitest tests',
      'use vitest for testing',
    );
    expect(r.taskContextUsed).toBe(true);
  });
});

describe('Optimizer flow edge cases', () => {
  it('All passes disabled', async () => {
    const r = await engine.optimize({
      prompt: 'fix auth',
      disabledPasses: [
        'debugging',
        'minimal-change',
        'regression-testing',
        'verification',
        'repository-awareness',
      ],
    });
    expect(r.selectedPasses).toHaveLength(0);
  });

  it('Profile thorough with complex multi-domain prompt', async () => {
    const r = await engine.optimize({
      prompt:
        'Design the ui, write the backend api in rust, setup ci cd pipelines and deploy to aws.',
      profile: 'thorough',
    });
    expect(r.selectedPasses.length).toBeGreaterThan(0);
  });

  it('Audience-specific adaptations (each audience type)', async () => {
    const r1 = await engine.optimize({
      prompt: 'hello',
      targetAgent: 'cursor',
    });
    const r2 = await engine.optimize({
      prompt: 'hello',
      targetAgent: 'claude-code',
    });
    const r3 = await engine.optimize({
      prompt: 'hello',
      targetAgent: 'antigravity',
    });
    expect(r1).toBeDefined();
    expect(r2).toBeDefined();
    expect(r3).toBeDefined();
  });

  it('Indonesian prompt with targetAgent=codex', async () => {
    const r = await engine.optimize({
      prompt: 'buat fungsi',
      targetAgent: 'codex',
    });
    expect(r.optimizedPrompt.startsWith('buat')).toBe(true);
  });

  it('Mode fast without provider (should fallback)', async () => {
    const r = await engine.optimize({ prompt: 'test', mode: 'fast' });
    expect(r.metadata.remoteUsed).toBe(false);
  });
});
