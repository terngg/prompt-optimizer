import { readFile, realpath } from 'node:fs/promises';
import { resolve, basename, sep } from 'node:path';
import { parse } from 'yaml';
import { fileURLToPath } from 'node:url';
export async function validateSkill(
  directory = fileURLToPath(
    new URL('../skills/prompt-optimizer', import.meta.url),
  ),
) {
  const root = await realpath(directory);
  const text = await readFile(resolve(root, 'SKILL.md'), 'utf8');
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);
  if (!match) throw new Error('SKILL.md requires YAML frontmatter and a body.');
  const meta = parse(match[1]);
  if (
    typeof meta.name !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.name) ||
    meta.name.length > 64 ||
    basename(root) !== meta.name
  )
    throw new Error('Invalid skill name.');
  if (
    typeof meta.description !== 'string' ||
    !meta.description.trim() ||
    meta.description.length > 1024
  )
    throw new Error('Invalid description.');
  if (text.split('\n').length > 500 || text.length > 20_000)
    throw new Error('Skill entrypoint is too long.');
  for (const key of Object.keys(meta))
    if (
      ![
        'name',
        'description',
        'license',
        'compatibility',
        'metadata',
        'allowed-tools',
      ].includes(key)
    )
      throw new Error('Unsupported frontmatter.');
  if (
    meta.compatibility &&
    (typeof meta.compatibility !== 'string' || meta.compatibility.length > 500)
  )
    throw new Error('Invalid compatibility.');
  if (
    meta.metadata &&
    Object.values(meta.metadata).some((x) => typeof x !== 'string')
  )
    throw new Error('Metadata values must be strings.');
  const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map((x) => x[1]);
  for (const link of links) {
    if (/^https?:/.test(link)) continue;
    const target = await realpath(resolve(root, link));
    if (!target.startsWith(root + sep))
      throw new Error('Reference leaves skill directory.');
    await readFile(target);
  }
  return {
    name: meta.name,
    lines: text.split('\n').length,
    references: links.length,
    valid: true,
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    console.log(JSON.stringify(await validateSkill(process.argv[2]), null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
