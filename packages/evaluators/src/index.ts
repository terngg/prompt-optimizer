import { z } from 'zod';
import { analyze } from '../../core/src/analyze.js';
import {
  estimateTokens,
  PromptSchema,
  redactSecrets,
  words,
} from '../../shared/src/index.js';
export const MetricSchema = z
  .object({
    score: z.number().min(0).max(100).nullable(),
    rationale: z.string(),
  })
  .strict();
export const EvaluationSchema = z
  .object({
    kind: z.literal('heuristic diagnostics'),
    metrics: z
      .object({
        clarity: MetricSchema,
        specificity: MetricSchema,
        goalPreservation: MetricSchema,
        constraintCoverage: MetricSchema,
        contextQuality: MetricSchema,
        ambiguity: MetricSchema,
        consistency: MetricSchema,
        agentReadiness: MetricSchema,
        tokenEfficiency: MetricSchema,
        outputContractQuality: MetricSchema,
      })
      .strict(),
    estimatedTokens: z.number().int(),
    limitations: z.array(z.string()),
  })
  .strict();
export function evaluatePrompt(promptInput: string, originalInput?: string) {
  const prompt = redactSecrets(PromptSchema.parse(promptInput));
  const original =
    originalInput === undefined
      ? undefined
      : redactSecrets(PromptSchema.parse(originalInput));
  const ir = analyze(prompt);
  const metric = (score: number | null, rationale: string) => ({
    score,
    rationale,
  });
  const actionable =
    /\b(fix|build|write|create|compare|explain|inspect|implement|buat|cari|rapihin)\b/i.test(
      prompt,
    );
  const criteria =
    /\b(test|verify|expected|acceptance|criteria|success|verifikasi|kriteria)\b/i.test(
      prompt,
    );
  const boundaries =
    /\b(only|must|avoid|without|do not|jangan|hanya|batas)\b/i.test(prompt);
  const ambiguous = ir.diagnostics.some((x) => x.code === 'ambiguous-success');
  const terms = words(prompt);
  const originalTerms = original ? words(original) : undefined;
  const coverage = originalTerms
    ? [...originalTerms].filter((x) => terms.has(x)).length /
      Math.max(1, originalTerms.size)
    : null;
  const lines = prompt
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
  const duplicateRatio =
    (lines.length - new Set(lines).size) / Math.max(1, lines.length);
  return EvaluationSchema.parse({
    kind: 'heuristic diagnostics',
    metrics: {
      clarity: metric(
        actionable ? 80 : 45,
        actionable
          ? 'An action verb is present.'
          : 'No recognized action verb; a factual question may still be perfectly clear.',
      ),
      specificity: metric(
        Math.min(90, 30 + (boundaries ? 30 : 0) + (criteria ? 30 : 0)),
        'Based on explicit boundaries and observable success cues, not length.',
      ),
      goalPreservation: metric(
        coverage === null ? null : Math.round(coverage * 100),
        coverage === null
          ? 'Requires an original prompt.'
          : 'Lexical coverage of the original; does not establish semantic equivalence.',
      ),
      constraintCoverage: metric(
        boundaries ? 80 : 40,
        'Recognized restriction cues; absence can be appropriate.',
      ),
      contextQuality: metric(
        null,
        'Cannot assess context quality from instruction text alone.',
      ),
      ambiguity: metric(
        ambiguous ? 35 : 80,
        'Higher means fewer recognized vague outcome terms; ambiguity may remain.',
      ),
      consistency: metric(
        ir.diagnostics.some((x) => x.code === 'instruction-conflict') ? 20 : 80,
        'Checks a small set of explicit contradiction patterns.',
      ),
      agentReadiness: metric(
        (actionable ? 45 : 20) + (criteria ? 40 : 0),
        'Action and verification cues; task dependent.',
      ),
      tokenEfficiency: metric(
        Math.round(100 * (1 - duplicateRatio)),
        'Exact repeated nonempty lines only; not a usefulness or cost benchmark.',
      ),
      outputContractQuality: metric(
        ir.outputContract ? 80 : null,
        ir.outputContract
          ? 'An explicit format was recognized.'
          : 'No explicit format; one may not be necessary.',
      ),
    },
    estimatedTokens: estimateTokens(prompt),
    limitations: [
      'Scores are transparent rule-based diagnostics, not calibrated probabilities or benchmark results.',
      'No score proves intent preservation, factual accuracy, or execution success.',
    ],
  });
}
export const ComparisonSchema = z
  .object({
    kind: z.literal('heuristic comparison'),
    promptA: EvaluationSchema,
    promptB: EvaluationSchema,
    dimensions: z.array(
      z
        .object({
          dimension: z.string(),
          deltaBMinusA: z.number().nullable(),
          explanation: z.string(),
        })
        .strict(),
    ),
    taskContextUsed: z.boolean(),
    conclusion: z.string(),
  })
  .strict();
export function comparePrompts(a: string, b: string, taskContext?: string) {
  const aa = evaluatePrompt(a, taskContext);
  const bb = evaluatePrompt(b, taskContext);
  return ComparisonSchema.parse({
    kind: 'heuristic comparison',
    promptA: aa,
    promptB: bb,
    dimensions: Object.keys(aa.metrics).map((k) => {
      const key = k as keyof typeof aa.metrics;
      const av = aa.metrics[key],
        bv = bb.metrics[key];
      return {
        dimension: k,
        deltaBMinusA:
          av.score === null || bv.score === null ? null : bv.score - av.score,
        explanation: `A: ${av.rationale} B: ${bv.rationale}`,
      };
    }),
    taskContextUsed: taskContext !== undefined,
    conclusion:
      'Compare dimensions against the actual task. No overall winner is inferred from these heuristics.',
  });
}
