import { execSync } from 'node:child_process';

let stdout;
try {
  stdout = execSync('npm pack --dry-run --json --ignore-scripts', {
    encoding: 'utf8',
  });
} catch (err) {
  console.error('npm pack failed:', err.message);
  process.exit(1);
}

const packData = JSON.parse(stdout);
const files = packData[0].files.map((f) => f.path);
const size = packData[0].size;

const required = [
  'dist',
  'skills',
  'integrations',
  'docs',
  'CHANGELOG.md',
  'plugin.json',
  'mcp.json',
];
const forbidden = ['tests', '.env', 'node_modules', '.git'];

let failed = false;

for (const req of required) {
  if (!files.some((f) => f.startsWith(req + '/') || f === req)) {
    console.error(`Missing required file/directory: ${req}`);
    failed = true;
  }
}

for (const forb of forbidden) {
  if (files.some((f) => f.startsWith(forb + '/') || f === forb)) {
    console.error(`Included forbidden file/directory: ${forb}`);
    failed = true;
  }
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
if (size > MAX_SIZE) {
  console.error(
    `Tarball size ${size} bytes exceeds limit of ${MAX_SIZE} bytes`,
  );
  failed = true;
} else {
  console.log(`Tarball size: ${size} bytes`);
}

if (failed) {
  process.exit(1);
}

console.log('Pack verification passed.');
