import { it, expect } from 'vitest';
import { readFile, mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
it('validates skill frontmatter and links', async () => {
  const { parse } = await import('yaml');
  const text = await readFile('skills/prompt-optimizer/SKILL.md', 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  expect(match).not.toBeNull();
  const meta = parse(match![1]!);
  expect(meta.name).toBe('prompt-optimizer');
  expect(meta.description.length).toBeLessThan(1024);
  expect(text.split('\n').length).toBeLessThan(100);
  for (const [, link] of text.matchAll(/\]\((references\/[^)]+)\)/g)) {
    expect(
      await readFile(join('skills/prompt-optimizer', link!), 'utf8'),
    ).toBeTruthy();
  }
});
it('installs a standalone copy with references intact', async () => {
  const root = await mkdtemp(join(tmpdir(), 'promptopt-skill-'));
  try {
    const target = join(root, '.agents', 'skills', 'prompt-optimizer');
    await cp('skills/prompt-optimizer', target, { recursive: true });
    const text = await readFile(join(target, 'SKILL.md'), 'utf8');
    for (const [, link] of text.matchAll(/\]\((references\/[^)]+)\)/g))
      expect(await readFile(join(target, link!), 'utf8')).toBeTruthy();
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
