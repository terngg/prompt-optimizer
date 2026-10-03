import { execSync } from 'node:child_process';

let stdout;
let status = 0;
try {
  stdout = execSync('pnpm audit --prod --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 60000,
  });
} catch (error) {
  stdout = error.stdout;
  status = error.status ?? 1;
}

try {
  const audit = JSON.parse(stdout);
  const counts = audit.metadata?.vulnerabilities;
  const levels = ['info', 'low', 'moderate', 'high', 'critical'];
  if (
    audit.error ||
    !counts ||
    levels.some(
      (level) => !Number.isInteger(counts[level]) || counts[level] < 0,
    )
  )
    throw new Error('Incomplete audit response');
  console.log(
    `Production audit: ${levels.map((level) => `${counts[level]} ${level}`).join(', ')}`,
  );
  if (status !== 0 || levels.some((level) => counts[level] > 0)) {
    console.error(
      'Production audit failed. Review pnpm audit --prod before releasing.',
    );
    process.exitCode = 1;
  }
} catch {
  console.error(
    'Production audit could not be completed. Check registry access and rerun pnpm run audit.',
  );
  process.exitCode = 1;
}
