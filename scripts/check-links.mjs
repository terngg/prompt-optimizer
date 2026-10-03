import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'dist', '.agents'].includes(entry.name))
      continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (path.endsWith('.md')) out.push(path);
  }
  return out;
}
let links = 0;
for (const path of await walk('.')) {
  const text = await readFile(path, 'utf8');
  for (const [, link] of text.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(?:https?:|#)/.test(link)) continue;
    const target = link.split('#')[0];
    if (!target) continue;
    await stat(resolve(dirname(path), target));
    links++;
  }
}
console.log(`Checked ${links} local Markdown links.`);
