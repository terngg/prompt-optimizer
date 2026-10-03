import {
  VERSION,
  TaskIRSchema,
  diagnostic,
  redactSecrets,
  type ContextItem,
  type Diagnostic,
  type Intent,
  type IntentName,
  type TaskIR,
} from '../../shared/src/index.js';

const signals: [IntentName, RegExp][] = [
  [
    'debugging',
    /\b(fix|debug|bug|broken|crash|failure|error|perbaiki|benerin|auth)\b/i,
  ],
  [
    'code_review',
    /\b(code review|review (?:the |this )?(?:code|pr|pull request))\b/i,
  ],
  ['refactoring', /\b(refactor|restructure|rapihin)\b/i],
  [
    'frontend',
    /\b(frontend|front.end|dashboard|next\.?js|react|vue|svelte|css|html|website|web app)\b/i,
  ],
  [
    'ui_ux',
    /\b(ui|ux|dashboard|button|layout|design system|responsive|accessibility|tombol)\b/i,
  ],
  ['backend', /\b(backend|back.end|api|endpoint|server|database|sql)\b/i],
  [
    'devops',
    /\b(deploy|docker|kubernetes|terraform|ci\/cd|devops|pipeline)\b/i,
  ],
  [
    'security',
    /\b(security|vulnerabilit\w*|threat|penetration|xss|csrf|injection)\b/i,
  ],
  [
    'research',
    /\b(research|investigate|compare|comparison|cari|terbaik|best database|sources|citations)\b/i,
  ],
  ['writing', /\b(write|draft|essay|article|story|tulis|copywriting)\b/i],
  [
    'data_analysis',
    /\b(data analysis|analy[sz]e (?:the )?data|csv|dataset|statistics|pandas)\b/i,
  ],
  ['agent', /\b(agent|autonomous|workflow|mcp|fix everything|fix semuanya)\b/i],
  [
    'marketing',
    /\b(marketing|campaign|audience|conversion|brand|copywriting|landing page)\b/i,
  ],
  ['seo', /\b(seo|search engine|organic traffic|discoverability)\b/i],
  [
    'image_generation',
    /\b(generate|create|draw|buat)\b.*\b(image|illustration|photo|gambar)\b/i,
  ],
  [
    'video_generation',
    /\b(generate|create|buat)\b.*\b(video|animation|film)\b/i,
  ],
  ['planning', /\b(plan|roadmap|schedule|milestone|rencana)\b/i],
  ['education', /\b(teach|explain|lesson|learn|jelaskan|belajar)\b/i],
  [
    'documentation',
    /\b(documentation|readme|document the|api docs|dokumentasi)\b/i,
  ],
  ['testing', /\b(test|tests|testing|regression|vitest|pytest)\b/i],
  [
    'coding',
    /\b(code|coding|implement|build|function|project|application|app|buat|pake)\b/i,
  ],
];
export function classify(prompt: string): Intent {
  const matched = signals
    .filter(([, re]) => re.test(prompt))
    .map(([name]) => name);
  let primary: IntentName = matched[0] ?? 'general';
  if (/^(?:explain|teach|jelaskan|belajar)\b/i.test(prompt.trim()))
    primary = 'education';
  else if (matched.includes('research')) primary = 'research';
  else if (matched.includes('image_generation')) primary = 'image_generation';
  else if (matched.includes('video_generation')) primary = 'video_generation';
  else if (matched.includes('frontend') && !matched.includes('debugging'))
    primary = 'coding';
  else if (matched.includes('seo')) primary = 'seo';
  const secondary = [...new Set(matched)].filter((x) => x !== primary);
  // Evidence strength, not a calibrated probability.
  return {
    primary,
    secondary,
    confidence:
      primary === 'general'
        ? 0.35
        : Math.min(0.9, 0.6 + secondary.length * 0.05),
  };
}
export function detectConflicts(
  text: string,
  source: Diagnostic['source'] = 'prompt',
): Diagnostic[] {
  const out: Diagnostic[] = [];
  const pairs: [RegExp, RegExp, string][] = [
    [
      /\b(one|1|single) sentence\b/i,
      /\b(20.page|twenty.page|detailed.{0,20}report|comprehensive.{0,20}report)\b/i,
      'One-sentence output conflicts with a detailed report. Clarify the required length.',
    ],
    [
      /\b(?:no|without|do not (?:add|install)|jangan tambah) (?:new )?dependenc(?:y|ies)\b/i,
      /\b(?:install|add) (?:a |new )?(?:package|dependency|library|lodash|axios)\b/i,
      'A dependency restriction conflicts with installing a dependency. Clarify which requirement takes priority.',
    ],
    [
      /\b(?:do not|never|jangan) (?:edit|change|modify|ubah) (?:any |the )?(?:files|code|kode)\b/i,
      /\b(?:edit|modify) (?:the |a )?file\b/i,
      'Editing conflicts with a no-edit restriction. Clarify the permitted scope.',
    ],
    [
      /\b(?:offline only|no network|without network)\b/i,
      /\b(?:fetch|download|browse|search the web)\b/i,
      'Network access conflicts with offline-only execution. Clarify the data source.',
    ],
  ];
  for (const [a, b, message] of pairs)
    if (a.test(text) && b.test(text))
      out.push(diagnostic('instruction-conflict', message, source, 'error'));
  return out;
}
export function analyze(prompt: string, context: ContextItem[] = []): TaskIR {
  const source = redactSecrets(prompt);
  const intent = classify(source);
  const exactWording =
    /\b(verbatim|exact wording|do not (?:rewrite|modify|rephrase)|without (?:rewriting|modification)|return exactly|output exactly|repeat exactly)\b/i.test(
      source,
    );
  const trivial =
    source.length < 180 &&
    /^(?:what (?:is|are)|who |when |where |how many|berapa |apa itu|hello\b|hi\b|thanks\b|\d+\s*[+*/-]\s*\d+)/i.test(
      source.trim(),
    );
  const language =
    /\b(buat|pake|keren|cari|terbaik|gw|rapihin|semuanya|jangan|tombol)\b/i.test(
      source,
    )
      ? 'id'
      : /[a-z]/i.test(source)
        ? 'en'
        : 'unknown';
  const diagnostics = detectConflicts(source);
  if (source !== prompt)
    diagnostics.push(
      diagnostic(
        'secrets-redacted',
        'Recognized secret patterns were redacted. Supply credential references instead of values.',
        'prompt',
      ),
    );
  if (
    /\b(fix everything|fix semuanya|rapihin|keren|best|terbaik|nice|better|production.ready)\b/i.test(
      source,
    )
  )
    diagnostics.push(
      diagnostic(
        'ambiguous-success',
        'The desired outcome is subjective or broad; establish a bounded success criterion.',
        'prompt',
      ),
    );
  if (source.length < 100 && !trivial && !exactWording)
    diagnostics.push(
      diagnostic(
        'missing-detail',
        'A short request may omit scope or acceptance criteria; infer from existing context before asking.',
        'prompt',
        'info',
      ),
    );
  const lines = source.split(/\n+/).filter((x) => x.trim());
  const statement = (text: string) => ({
    text,
    priority: 'user explicit' as const,
    provenance: 'user' as const,
  });
  const format = /\bjson\b/i.test(source)
    ? 'json'
    : /\bxml\b/i.test(source)
      ? 'xml'
      : /\bmarkdown\b/i.test(source)
        ? 'markdown'
        : undefined;
  return TaskIRSchema.parse({
    source,
    intent,
    goal: source,
    context: context.map((x) => ({
      ...x,
      text: redactSecrets(x.text),
      id: redactSecrets(x.id),
    })),
    requirements: [statement(source)],
    constraints: lines
      .filter((x) =>
        /\b(must|only|never|without|do not|don't|no |jangan|harus|exactly)\b/i.test(
          x,
        ),
      )
      .map(statement),
    assumptions: [],
    tools: [],
    skills: [],
    acceptanceCriteria: lines
      .filter((x) =>
        /\b(acceptance|success|passes|expected|should return)\b/i.test(x),
      )
      .map(statement),
    ...(format ? { outputContract: { format, explicit: true } } : {}),
    diagnostics,
    metadata: {
      schemaVersion: 1,
      optimizerVersion: VERSION,
      language,
      exactWording,
      trivial,
      complexity:
        source.length > 1200 || lines.length > 10
          ? 'complex'
          : source.length > 200
            ? 'moderate'
            : 'simple',
    },
  });
}
