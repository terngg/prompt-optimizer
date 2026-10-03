import { z } from 'zod';

export const VERSION = '0.1.0';
export const LIMITS = {
  prompt: 64_000,
  contextItem: 32_000,
  contextTotal: 256_000,
  contextCount: 128,
  wireBytes: 2_000_000,
} as const;
export const intents = [
  'general',
  'coding',
  'debugging',
  'frontend',
  'backend',
  'devops',
  'security',
  'research',
  'writing',
  'data_analysis',
  'agent',
  'ui_ux',
  'marketing',
  'seo',
  'image_generation',
  'video_generation',
  'planning',
  'education',
  'documentation',
  'testing',
  'refactoring',
  'code_review',
] as const;
export const targets = [
  'auto',
  'universal',
  'codex',
  'claude-code',
  'antigravity',
  'cursor',
  'opencode',
  'generic-agent',
] as const;
export const priorities = [
  'system',
  'developer',
  'workspace/project',
  'user explicit',
  'user inferred',
  'optimizer recommendation',
  'optional enhancement',
] as const;
export const PromptSchema = z
  .string()
  .min(1)
  .max(LIMITS.prompt)
  .refine((s) => s.trim().length > 0, 'Prompt must contain text.');
export const TargetSchema = z.enum(targets);
export const ProfileSchema = z.enum(['minimal', 'balanced', 'thorough']);
export const ModeSchema = z.enum(['local', 'fast', 'balanced', 'high', 'max']);
export const IntentSchema = z
  .object({
    primary: z.enum(intents),
    secondary: z.array(z.enum(intents)),
    confidence: z.number().min(0).max(1),
  })
  .strict();
export const DiagnosticSchema = z
  .object({
    code: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
    message: z.string(),
    source: z.enum(['prompt', 'context', 'optimizer', 'provider']),
  })
  .strict();
export const ContextItemSchema = z
  .object({
    id: z.string().min(1).max(128),
    text: z.string().min(1).max(LIMITS.contextItem),
    kind: z
      .enum([
        'repository',
        'conversation',
        'requirement',
        'documentation',
        'error',
        'code',
        'preference',
        'memory',
      ])
      .default('documentation'),
    critical: z.boolean().default(false),
  })
  .strict();
export const ContextSchema = z
  .array(ContextItemSchema)
  .max(LIMITS.contextCount)
  .superRefine((items, ctx) => {
    if (items.reduce((n, x) => n + x.text.length, 0) > LIMITS.contextTotal)
      ctx.addIssue({
        code: 'custom',
        message: 'Total context exceeds 256000 characters.',
      });
    if (new Set(items.map((x) => x.id)).size !== items.length)
      ctx.addIssue({ code: 'custom', message: 'Context IDs must be unique.' });
  });
export const StatementSchema = z
  .object({
    text: z.string(),
    priority: z.enum(priorities),
    provenance: z.enum(['user', 'optimizer']),
  })
  .strict();
export const AssumptionSchema = z
  .object({
    text: z.string(),
    confidence: z.number().min(0).max(1),
    requiresConfirmation: z.boolean(),
  })
  .strict();
export const TaskIRSchema = z
  .object({
    source: z.string(),
    intent: IntentSchema,
    goal: z.string(),
    context: z.array(ContextItemSchema),
    requirements: z.array(StatementSchema),
    constraints: z.array(StatementSchema),
    assumptions: z.array(AssumptionSchema),
    tools: z.array(
      z.object({ name: z.string(), required: z.boolean() }).strict(),
    ),
    skills: z.array(
      z.object({ name: z.string(), required: z.boolean() }).strict(),
    ),
    acceptanceCriteria: z.array(StatementSchema),
    outputContract: z
      .object({
        format: z.enum(['json', 'markdown', 'xml', 'code', 'text']),
        explicit: z.boolean(),
      })
      .strict()
      .optional(),
    diagnostics: z.array(DiagnosticSchema),
    metadata: z
      .object({
        schemaVersion: z.literal(1),
        optimizerVersion: z.string(),
        language: z.enum(['en', 'id', 'unknown']),
        exactWording: z.boolean(),
        trivial: z.boolean(),
        complexity: z.enum(['simple', 'moderate', 'complex']),
      })
      .strict(),
  })
  .strict();
export const PassReportSchema = z
  .object({
    id: z.string(),
    reason: z.string(),
    confidence: z.number().min(0).max(1),
    change: z.string(),
    estimatedTokenImpact: z.number().int(),
  })
  .strict();
export const ContextResultSchema = z
  .object({
    items: z.array(
      ContextItemSchema.extend({
        relevance: z.number(),
        compressed: z.boolean(),
      }),
    ),
    droppedIds: z.array(z.string()),
    duplicatesRemoved: z.number().int(),
    beforeEstimated: z.number().int(),
    afterEstimated: z.number().int(),
    budgetExceeded: z.boolean(),
    diagnostics: z.array(DiagnosticSchema),
  })
  .strict();
export const OptimizeInputSchema = z
  .object({
    prompt: PromptSchema,
    targetAgent: TargetSchema.default('auto'),
    profile: ProfileSchema.default('balanced'),
    context: ContextSchema.default([]),
    maxTokens: z.number().int().min(1).max(100_000).nullable().default(null),
    explain: z.boolean().default(true),
    mode: ModeSchema.default('local'),
    disabledPasses: z.array(z.string().max(80)).max(64).default([]),
    audience: z
      .enum([
        'auto',
        'chat',
        'coding-agent',
        'research-agent',
        'autonomous-agent',
        'image-agent',
      ])
      .default('auto'),
    previousOptimization: z
      .object({
        version: z.literal(1),
        outputHash: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict()
      .optional(),
  })
  .strict();
export const OptimizeResultSchema = z
  .object({
    optimizedPrompt: z.string(),
    detectedIntent: IntentSchema,
    selectedPasses: z.array(PassReportSchema),
    skippedPasses: z.array(PassReportSchema),
    diagnostics: z.array(DiagnosticSchema),
    assumptions: z.array(AssumptionSchema),
    tokenEstimate: z
      .object({
        beforeEstimated: z.number().int(),
        afterEstimated: z.number().int(),
        budget: z.number().nullable(),
        budgetExceeded: z.boolean(),
        method: z.literal('ceil(UTF-8 bytes / 4); not a model tokenizer'),
      })
      .strict(),
    changes: z
      .object({
        instructionsAdded: z.number().int(),
        instructionsRemoved: z.number().int(),
        duplicatesRemoved: z.number().int(),
        sourceRedacted: z.boolean(),
      })
      .strict(),
    confidence: z.number().min(0).max(1),
    ir: TaskIRSchema,
    context: ContextResultSchema,
    metadata: z
      .object({
        version: z.literal(1),
        outputHash: z.string(),
        alreadyOptimized: z.boolean(),
        mode: ModeSchema,
        provider: z.string().nullable(),
        remoteUsed: z.boolean(),
        providerCalls: z.number().int(),
        latencyMs: z.number(),
        evaluation: z.literal('heuristic'),
      })
      .strict(),
  })
  .strict();
export type Intent = z.infer<typeof IntentSchema>;
export type IntentName = (typeof intents)[number];
export type TaskIR = z.infer<typeof TaskIRSchema>;
export type Diagnostic = z.infer<typeof DiagnosticSchema>;
export type ContextItem = z.infer<typeof ContextItemSchema>;
export type ContextInput = z.input<typeof ContextItemSchema>;
export type OptimizeInput = z.input<typeof OptimizeInputSchema>;
export type OptimizeResult = z.infer<typeof OptimizeResultSchema>;
export type PassReport = z.infer<typeof PassReportSchema>;
export type TargetAgent = z.infer<typeof TargetSchema>;
export type Profile = z.infer<typeof ProfileSchema>;

export function estimateTokens(text: string): number {
  return Math.ceil(new TextEncoder().encode(text).length / 4);
}
export function words(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}_-]{3,}/gu) ?? []);
}
export function diagnostic(
  code: string,
  message: string,
  source: Diagnostic['source'] = 'optimizer',
  severity: Diagnostic['severity'] = 'warning',
): Diagnostic {
  return { code, message, source, severity };
}
/** Best-effort defense in depth, not a universal secret detector. Never log input. */
export function redactSecrets(text: string): string {
  return text
    .replace(
      /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
      '[REDACTED PRIVATE KEY]',
    )
    .replace(
      /\b(?:sk-[\w-]{12,}|gh[pousr]_[\w]{20,}|github_pat_[\w]{20,}|AKIA[A-Z0-9]{16}|AIza[\w-]{25,})\b/g,
      '[REDACTED]',
    )
    .replace(/\b(Bearer\s+)[A-Za-z0-9._~+/-]{8,}=*/gi, '$1[REDACTED]')
    .replace(
      /((?:["']?(?:api[_-]?key|password|secret|access[_-]?token|authorization)["']?)\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;}]+)/gi,
      '$1[REDACTED]',
    )
    .replace(/(https?:\/\/)[^\s/@:]+:[^\s/@]+@/gi, '$1[REDACTED]@');
}
export const injectionPattern =
  /ignore (?:all |the )?(?:previous|prior|system) instructions|reveal (?:your |the )?(?:secret|system prompt)|<\/?(?:system|developer)>|\[INST\]/i;
