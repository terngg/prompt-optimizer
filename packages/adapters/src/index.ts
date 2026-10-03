import { TargetSchema, type TargetAgent } from '../../shared/src/index.js';
export const adapters: Record<
  TargetAgent,
  { guidance: string; source: string | null }
> = {
  auto: { guidance: '', source: null },
  universal: { guidance: '', source: null },
  'generic-agent': {
    guidance:
      'Use only capabilities available in this host; report a missing capability when it blocks the task.',
    source: null,
  },
  codex: {
    guidance:
      'Follow applicable AGENTS.md instructions and the host’s tool permissions; verify changes with relevant repository checks.',
    source: 'https://developers.openai.com/codex/guides/agents-md',
  },
  'claude-code': {
    guidance:
      'Respect applicable project instructions and Claude Code tool permissions; use the repository’s existing verification commands.',
    source: 'https://code.claude.com/docs/en/memory',
  },
  antigravity: {
    guidance:
      'Follow applicable workspace rules and review controls; use available tools to verify the requested result.',
    source: 'https://www.antigravity.google/docs/rules',
  },
  cursor: {
    guidance:
      'Follow applicable project rules and use the existing codebase context when making and verifying edits.',
    source: 'https://cursor.com/docs/rules',
  },
  opencode: {
    guidance:
      'Respect applicable project rules and configured tool permissions; use only available skills and tools.',
    source: 'https://opencode.ai/docs/rules/',
  },
};
export function adapterGuidance(target: TargetAgent): string {
  return adapters[TargetSchema.parse(target)].guidance;
}
