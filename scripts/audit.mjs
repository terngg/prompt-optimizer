import { execSync } from 'node:child_process';

let stdout;
try {
  stdout = execSync('npm audit --omit=dev --json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'ignore'],
  });
} catch (err) {
  stdout = err.stdout;
}

if (!stdout) {
  console.error('Failed to run npm audit or empty output.');
  process.exit(1);
}

const audit = JSON.parse(stdout);
const vulns = audit.metadata?.vulnerabilities || {
  info: 0,
  low: 0,
  moderate: 0,
  high: 0,
  critical: 0,
};
const { info, low, moderate, high, critical } = vulns;

console.log(
  `Audit Summary: ${info} info, ${low} low, ${moderate} moderate, ${high} high, ${critical} critical`,
);

if (high > 0 || critical > 0) {
  console.error('High/critical vulnerabilities found.');
  process.exit(1);
}

process.exit(0);
