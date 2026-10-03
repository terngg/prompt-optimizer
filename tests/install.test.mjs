import { it, expect } from 'vitest';
import { mkdtemp, readFile, rm, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { installSkill } from '../scripts/install-skill.mjs';
import { validateSkill } from '../scripts/validate-skill.mjs';
it.each([
  'codex',
  'claude-code',
  'antigravity',
  'antigravity-cli',
  'cursor',
  'opencode',
  'generic',
])('installs %s in both scopes', async (agent) => {
  const root = await mkdtemp(join(tmpdir(), 'promptopt-install-'));
  try {
    await mkdir(join(root, 'project'));
    await mkdir(join(root, 'user'));
    for (const scope of ['project', 'user']) {
      const target = await installSkill({
        agent,
        scope,
        project: join(root, 'project'),
        userDirectory: join(root, 'user'),
      });
      expect((await validateSkill(target)).valid).toBe(true);
      await expect(
        installSkill({
          agent,
          scope,
          project: join(root, 'project'),
          userDirectory: join(root, 'user'),
        }),
      ).rejects.toThrow('already exists');
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
it('rejects invalid agent and symlink parents', async () => {
  await expect(installSkill({ agent: '../../escape' })).rejects.toThrow();
  const root = await mkdtemp(join(tmpdir(), 'promptopt-link-'));
  try {
    await mkdir(join(root, 'outside'));
    await mkdir(join(root, 'project'));
    await symlink(
      join(root, 'outside'),
      join(root, 'project', '.agents'),
      'junction',
    );
    await expect(
      installSkill({ agent: 'codex', project: join(root, 'project') }),
    ).rejects.toThrow('real directory');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
it('validates plugin linkage and portable fixed locations', async () => {
  const manifest = JSON.parse(await readFile('plugin.json', 'utf8'));
  const mcp = JSON.parse(await readFile('mcp.json', 'utf8'));
  expect(manifest.$schema).toBe(
    'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
  );
  expect(manifest.version).toBe(
    JSON.parse(await readFile('package.json', 'utf8')).version,
  );
  expect(mcp.mcpServers['prompt-optimizer'].args[0]).toBe(
    '${PLUGIN_ROOT}/dist/apps/mcp-server/src/cli.js',
  );
  expect((await validateSkill()).valid).toBe(true);
});
