import {
  ContextSchema,
  PromptSchema,
  ContextResultSchema,
  diagnostic,
  estimateTokens,
  injectionPattern,
  redactSecrets,
  words,
  type ContextInput,
} from '../../shared/src/index.js';
import { detectConflicts } from '../../core/src/analyze.js';

export function compressContext(input: {
  context: ContextInput[];
  query?: string;
  maxTokens?: number;
}) {
  const context = ContextSchema.parse(input.context);
  const query =
    input.query === undefined || input.query === ''
      ? ''
      : PromptSchema.parse(input.query);
  const budget = input.maxTokens ?? 2000;
  if (!Number.isInteger(budget) || budget < 1 || budget > 100_000)
    throw new Error('Context budget must be an integer between 1 and 100000.');
  const q = words(query);
  const diagnostics = [];
  const seen = new Map<string, number>();
  const unique: ((typeof context)[number] & {
    relevance: number;
    compressed: boolean;
  })[] = [];
  const droppedIds: string[] = [];
  let duplicatesRemoved = 0;
  for (const raw of context) {
    const item = {
      ...raw,
      text: redactSecrets(raw.text),
      id: redactSecrets(raw.id),
    };
    if (item.text !== raw.text || item.id !== raw.id)
      diagnostics.push(
        diagnostic(
          'secrets-redacted',
          'Recognized secret patterns in context were redacted.',
          'context',
        ),
      );
    if (injectionPattern.test(item.text))
      diagnostics.push(
        diagnostic(
          'untrusted-instruction',
          'Context contains instruction-like content; it remains untrusted data.',
          'context',
        ),
      );
    // Exact text only: whitespace/case changes can change code or identifiers.
    const key = item.kind + '\0' + item.text;
    const prior = seen.get(key);
    if (prior !== undefined) {
      unique[prior]!.critical ||= item.critical;
      droppedIds.push(item.id);
      duplicatesRemoved++;
      continue;
    }
    seen.set(key, unique.length);
    const w = words(item.text);
    const overlap = [...q].filter((x) => w.has(x)).length / Math.max(1, q.size);
    unique.push({
      ...item,
      relevance: Math.min(1, overlap + (item.kind === 'requirement' ? 0.3 : 0)),
      compressed: false,
    });
  }
  diagnostics.push(
    ...detectConflicts(unique.map((x) => x.text).join('\n'), 'context'),
  );
  unique.sort(
    (a, b) =>
      Number(b.critical) - Number(a.critical) || b.relevance - a.relevance,
  );
  const items: typeof unique = [];
  let used = 0;
  for (const item of unique) {
    const cost = estimateTokens(JSON.stringify(item));
    if (item.critical || used + cost <= budget) {
      items.push(item);
      used += cost;
      continue;
    }
    // Extract complete relevant lines only; never cut code, errors, or explicit requirements.
    const remaining = budget - used;
    if (
      remaining > 80 &&
      !['code', 'error', 'requirement'].includes(item.kind)
    ) {
      const lines = item.text.split('\n');
      const kept: string[] = [];
      for (const line of lines) {
        if (![...words(line)].some((w) => q.has(w))) continue;
        const candidate = {
          ...item,
          text: [...kept, line].join('\n'),
          compressed: true,
        };
        if (estimateTokens(JSON.stringify(candidate)) <= remaining)
          kept.push(line);
      }
      if (kept.length) {
        const entry = { ...item, text: kept.join('\n'), compressed: true };
        items.push(entry);
        used += estimateTokens(JSON.stringify(entry));
        continue;
      }
    }
    droppedIds.push(item.id);
  }
  const afterEstimated = estimateTokens(JSON.stringify(items));
  const budgetExceeded = afterEstimated > budget;
  if (budgetExceeded)
    diagnostics.push(
      diagnostic(
        'critical-context-over-budget',
        'Critical context was retained despite the budget. Increase the budget or explicitly revise critical items.',
        'context',
      ),
    );
  if (droppedIds.length)
    diagnostics.push(
      diagnostic(
        'context-omitted',
        'Some context was omitted or deduplicated; inspect droppedIds before relying on completeness.',
        'context',
        'info',
      ),
    );
  return ContextResultSchema.parse({
    items,
    droppedIds,
    duplicatesRemoved,
    beforeEstimated: estimateTokens(JSON.stringify(context)),
    afterEstimated,
    budgetExceeded,
    diagnostics,
  });
}
