#!/usr/bin/env node
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PromptOptimizer,
  inspectPrompt,
  evaluatePrompt,
  LIMITS,
  VERSION,
} from '../../../packages/core/src/index.js';
import { optionsFromEnvironment } from './config.js';
import { startStdio, startHttp } from './transports.js';

async function main() {
  const [command = 'mcp', ...args] = process.argv.slice(2);
  if (command === '--version') {
    console.log(VERSION);
    return;
  }
  if (command === '--help') {
    console.log(
      'promptopt [mcp | http [--port 3000] | inspect FILE | optimize FILE | eval FILE | doctor]\nDefaults to MCP stdio. Debug commands are local-only.',
    );
    return;
  }
  if (command === 'doctor') {
    const skill = fileURLToPath(
      new URL('../../../../skills/prompt-optimizer/SKILL.md', import.meta.url),
    );
    const repoSkill = fileURLToPath(
      new URL(
        '../../../../../skills/prompt-optimizer/SKILL.md',
        import.meta.url,
      ),
    );
    let skillAvailable = false;
    for (const candidate of [skill, repoSkill]) {
      try {
        await stat(candidate);
        skillAvailable = true;
        break;
      } catch {
        /* Try source/compiled layouts. */
      }
    }
    let providerConfigured = false,
      configurationValid = true;
    try {
      providerConfigured = !!optionsFromEnvironment().provider;
    } catch {
      configurationValid = false;
    }
    const http = await startHttp({ port: 0 });
    const response = await fetch(http.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'doctor', version: VERSION },
        },
      }),
    });
    const protocolHealthy = response.ok;
    await response.text();
    await http.close();
    const result = {
      version: VERSION,
      node: process.versions.node,
      nodeSupported: Number(process.versions.node.split('.')[0]) >= 22,
      skillAvailable,
      configurationValid,
      providerConfigured,
      httpInitialization: protocolHealthy,
      privacy: 'No prompts or credentials logged. No provider called.',
    };
    console.log(JSON.stringify(result, null, 2));
    if (
      !result.nodeSupported ||
      !skillAvailable ||
      !configurationValid ||
      !protocolHealthy
    )
      process.exitCode = 1;
    return;
  }
  if (['inspect', 'optimize', 'eval'].includes(command)) {
    if (args.length !== 1 || !args[0] || args[0].includes('\0'))
      throw new Error('Provide exactly one prompt file path.');
    const path = resolve(args[0]);
    const info = await stat(path);
    if (!info.isFile() || info.size > LIMITS.prompt)
      throw new Error('Prompt file must be a regular file up to 64000 bytes.');
    const prompt = await readFile(path, 'utf8');
    const result =
      command === 'inspect'
        ? inspectPrompt({ prompt })
        : command === 'eval'
          ? evaluatePrompt(prompt)
          : await new PromptOptimizer().optimize({ prompt });
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  let options;
  try {
    options = optionsFromEnvironment();
  } catch {
    process.stderr.write(
      'Prompt Optimizer: provider configuration invalid; local optimization remains available.\n',
    );
    options = {};
  }
  if (command === 'mcp') {
    if (args.length) throw new Error('mcp takes no arguments.');
    const handle = startStdio(options);
    process.once('SIGINT', () => void handle.close());
    process.once('SIGTERM', () => void handle.close());
    return;
  }
  if (command === 'http') {
    if (
      args.length &&
      !(
        args.length === 2 &&
        args[0] === '--port' &&
        /^\d+$/.test(args[1] ?? '')
      )
    )
      throw new Error('Use http --port 3000.');
    const handle = await startHttp({
      ...options,
      port: args.length ? Number(args[1]) : 3000,
    });
    process.stderr.write(`Prompt Optimizer listening at ${handle.url}\n`);
    process.once('SIGINT', () => void handle.close());
    process.once('SIGTERM', () => void handle.close());
    return;
  }
  throw new Error('Unknown command. Use --help.');
}
main().catch(() => {
  process.stderr.write(
    'Prompt Optimizer failed. Check command arguments, file limits, or port availability; run --help or doctor.\n',
  );
  process.exitCode = 1;
});
