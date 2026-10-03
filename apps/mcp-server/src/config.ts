import { HttpProvider } from '../../../packages/providers/src/index.js';
import type { OptimizerOptions } from '../../../packages/core/src/index.js';
/** Only these named variables are read. Nothing is serialized or logged. */
export function optionsFromEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): OptimizerOptions {
  if (env.PROMPTOPT_ALLOW_REMOTE !== 'true') return {};
  const make = (prefix: string) => {
    const kind = env[prefix + 'PROVIDER'];
    const model = env[prefix + 'MODEL'];
    if (!kind || !model) return undefined;
    if (!['openai-compatible', 'anthropic', 'gemini'].includes(kind))
      throw new Error('Invalid provider kind.');
    return new HttpProvider({
      kind: kind as 'openai-compatible' | 'anthropic' | 'gemini',
      model,
      apiKey: env[prefix + 'API_KEY'],
      baseUrl: env[prefix + 'BASE_URL'],
    });
  };
  return {
    allowRemote: true,
    provider: make('PROMPTOPT_'),
    evaluator: make('PROMPTOPT_EVALUATOR_'),
  };
}
