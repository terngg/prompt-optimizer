import { PromptOptimizer } from '../dist/packages/sdk/src/index.js';
const engine = new PromptOptimizer();
for (const prompt of [
  'fix auth',
  'buat dashboard ai keren pake nextjs',
  'cari database terbaik buat saas gw',
  'rapihin project ini dan fix semuanya',
  'What is 2 + 2?',
]) {
  const result = await engine.optimize({ prompt });
  console.log(
    JSON.stringify(
      {
        before: prompt,
        after: result.optimizedPrompt,
        intent: result.detectedIntent,
        passes: result.selectedPasses.map((p) => p.id),
        tokens: result.tokenEstimate,
      },
      null,
      2,
    ),
  );
}
