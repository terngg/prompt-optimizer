import { cp, lstat, mkdir, realpath } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const paths = {
  codex: ['.agents/skills', '.agents/skills'],
  'claude-code': ['.claude/skills', '.claude/skills'],
  antigravity: ['.agents/skills', '.gemini/config/skills'],
  'antigravity-cli': ['.agents/skills', '.gemini/antigravity-cli/skills'],
  cursor: ['.cursor/skills', '.cursor/skills'],
  opencode: ['.opencode/skills', '.config/opencode/skills'],
  generic: ['.agents/skills', '.agents/skills'],
};
export async function installSkill({
  agent,
  scope = 'project',
  project = process.cwd(),
  userDirectory = homedir(),
}) {
  if (!Object.hasOwn(paths, agent) || !['project', 'user'].includes(scope))
    throw new Error('Choose a documented agent and project or user scope.');
  const base = await realpath(
    scope === 'user' ? userDirectory : resolve(project),
  );
  const target = join(
    base,
    paths[agent][scope === 'user' ? 1 : 0],
    'prompt-optimizer',
  );
  try {
    await lstat(target);
    throw new Error(
      'Skill already exists; review or remove that installation before replacing it.',
    );
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  // Reject symlinks along the installation path, so a project cannot redirect a copy elsewhere.
  let current = base;
  for (const segment of paths[agent][scope === 'user' ? 1 : 0].split('/')) {
    current = join(current, segment);
    try {
      const entry = await lstat(current);
      if (entry.isSymbolicLink() || !entry.isDirectory())
        throw new Error('Skill parent must be a real directory.');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      await mkdir(current);
    }
  }
  const source = fileURLToPath(
    new URL('../skills/prompt-optimizer', import.meta.url),
  );
  await cp(source, target, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  return target;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const options = {};
  try {
    const args = process.argv.slice(2);
    if (args.length % 2) throw new Error('Arguments require values.');
    for (let i = 0; i < args.length; i += 2) {
      if (!['--agent', '--scope', '--project'].includes(args[i]))
        throw new Error('Unknown argument.');
      options[args[i].slice(2)] = args[i + 1];
    }
    console.log(`Installed skill: ${await installSkill(options)}`);
  } catch (error) {
    console.error(
      error.message +
        ' Usage: node scripts/install-skill.mjs --agent codex --scope project --project /path/to/project',
    );
    process.exitCode = 1;
  }
}
