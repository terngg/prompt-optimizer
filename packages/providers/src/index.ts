import { request as httpsRequest } from 'node:https';
import { request as httpRequest } from 'node:http';
import { lookup } from 'node:dns';
import { isIP } from 'node:net';
import { z } from 'zod';
import { redactSecrets } from '../../shared/src/index.js';

export interface ProviderRequest {
  system: string;
  prompt: string;
  signal?: AbortSignal;
}
export interface OptimizationProvider {
  readonly name: string;
  complete(request: ProviderRequest): Promise<string>;
}
export interface ProviderConfig {
  kind: 'openai-compatible' | 'anthropic' | 'gemini';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  allowLocalEndpoint?: boolean;
}
const ConfigSchema = z
  .object({
    kind: z.enum(['openai-compatible', 'anthropic', 'gemini']),
    model: z.string().regex(/^[a-zA-Z0-9._:/-]{1,160}$/),
    apiKey: z.string().max(4096).optional(),
    baseUrl: z.string().url().optional(),
    timeoutMs: z.number().int().min(100).max(60_000).default(15_000),
    allowLocalEndpoint: z.boolean().default(false),
  })
  .strict();
const defaults = {
  'openai-compatible': 'https://api.openai.com/v1/',
  anthropic: 'https://api.anthropic.com/v1/',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/',
};
export function publicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split('.').map(Number);
    return !(
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b! >= 16 && b! <= 31) ||
      (a === 192 &&
        (b === 168 ||
          (b === 0 && (c === 0 || c === 2)) ||
          (b === 88 && c === 99))) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      (a === 100 && b! >= 64 && b! <= 127) ||
      a! >= 224 ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  // Permit global unicast IPv6 only, excluding mapped IPv4 and special networks.
  const [first, second] = address.toLowerCase().split(':');
  const specialV6 =
    first === '2001' &&
    (parseInt(second || '0', 16) <= 0x1ff || second === 'db8');
  return (
    isIP(address) === 6 &&
    /^[23]/.test(address) &&
    !specialV6 &&
    first !== '2002' &&
    first !== '3fff'
  );
}
export function validateProviderUrl(value: string, allowLocal = false): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Provider URL is invalid. Use an HTTPS API base URL.');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const loopback = ['localhost', '127.0.0.1', '::1'].includes(host);
  if (url.username || url.password || url.hash || url.search)
    throw new Error(
      'Provider URL must not contain credentials, query parameters, or fragments.',
    );
  if (
    url.protocol !== 'https:' &&
    !(allowLocal && loopback && url.protocol === 'http:')
  )
    throw new Error(
      'Provider requires HTTPS; explicit local endpoint opt-in permits loopback HTTP.',
    );
  if (
    ((isIP(host) && !publicAddress(host)) ||
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local')) &&
    !(allowLocal && loopback)
  )
    throw new Error('Private provider addresses are blocked.');
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url;
}
function postJson(
  url: URL,
  body: unknown,
  headers: Record<string, string>,
  timeoutMs: number,
  allowLocal: boolean,
  signal?: AbortSignal,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const localAllowed =
      allowLocal && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(
      url,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        signal,
        lookup: (hostname, options, callback) =>
          lookup(hostname, { ...options, all: true }, (error, addresses) => {
            if (error) {
              callback(error, '', 4);
              return;
            }
            if (
              addresses.some((x) =>
                localAllowed
                  ? !['127.0.0.1', '::1'].includes(x.address)
                  : !publicAddress(x.address),
              )
            ) {
              callback(new Error('Blocked provider address.'), '', 4);
              return;
            }
            if (options.all) callback(null, addresses);
            else {
              const a = addresses[0];
              if (a) callback(null, a.address, a.family);
              else callback(new Error('No provider address.'), '', 4);
            }
          }),
      },
      (res) => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          reject(
            new Error(
              'Provider request failed. Check endpoint, model, credentials, and quota. Local optimization remains available.',
            ),
          );
          return;
        }
        const chunks: Buffer[] = [];
        let size = 0;
        res.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size > 65_536) {
            res.destroy();
            reject(new Error('Provider response exceeded 64 KiB.'));
          } else chunks.push(chunk);
        });
        res.on('error', () =>
          reject(new Error('Provider response could not be read.')),
        );
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          } catch {
            reject(new Error('Provider returned invalid JSON.'));
          }
        });
      },
    );
    const timer = setTimeout(
      () => req.destroy(new Error('Provider timed out.')),
      timeoutMs,
    );
    req.on('close', () => clearTimeout(timer));
    req.on('error', () =>
      reject(
        new Error(
          'Provider connection failed or timed out. Local optimization remains available.',
        ),
      ),
    );
    req.end(JSON.stringify(body));
  });
}
export class HttpProvider implements OptimizationProvider {
  readonly name: string;
  private readonly config: z.output<typeof ConfigSchema>;
  private readonly base: URL;
  constructor(config: ProviderConfig) {
    this.config = ConfigSchema.parse(config);
    this.name = this.config.kind;
    this.base = validateProviderUrl(
      this.config.baseUrl ?? defaults[this.config.kind],
      this.config.allowLocalEndpoint,
    );
  }
  async complete(input: ProviderRequest): Promise<string> {
    const c = this.config;
    const prompt = redactSecrets(input.prompt),
      system = redactSecrets(input.system);
    if (prompt.length + system.length > 40_000)
      throw new Error('Provider input exceeds the analyzed-context limit.');
    let path: string,
      body: unknown,
      headers: Record<string, string> = {};
    if (c.kind === 'openai-compatible') {
      path = 'chat/completions';
      body = {
        model: c.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_completion_tokens: 1200,
      };
      if (c.apiKey) headers = { authorization: `Bearer ${c.apiKey}` };
    } else if (c.kind === 'anthropic') {
      path = 'messages';
      body = {
        model: c.model,
        system,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1200,
      };
      headers = {
        'anthropic-version': '2023-06-01',
        ...(c.apiKey ? { 'x-api-key': c.apiKey } : {}),
      };
    } else {
      path = `models/${encodeURIComponent(c.model)}:generateContent`;
      body = {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1200 },
      };
      if (c.apiKey) headers = { 'x-goog-api-key': c.apiKey };
    }
    const raw = await postJson(
      new URL(path, this.base),
      body,
      headers,
      c.timeoutMs,
      c.allowLocalEndpoint,
      input.signal,
    );
    const response = z
      .object({
        choices: z
          .array(z.object({ message: z.object({ content: z.string() }) }))
          .optional(),
        content: z
          .array(z.object({ type: z.string(), text: z.string().optional() }))
          .optional(),
        candidates: z
          .array(
            z.object({
              content: z.object({
                parts: z.array(z.object({ text: z.string().optional() })),
              }),
            }),
          )
          .optional(),
      })
      .parse(raw);
    const text =
      c.kind === 'openai-compatible'
        ? response.choices?.[0]?.message.content
        : c.kind === 'anthropic'
          ? response.content
              ?.filter((x) => x.type === 'text')
              .map((x) => x.text ?? '')
              .join('\n')
          : response.candidates?.[0]?.content.parts
              .map((x) => x.text ?? '')
              .join('\n');
    if (!text || text.length > 8000)
      throw new Error('Provider returned no usable bounded text.');
    return redactSecrets(text);
  }
}
export const CandidateSchema = z
  .object({ recommendations: z.array(z.string().min(1).max(400)).max(4) })
  .strict();
export const CritiqueSchema = z
  .object({
    approved: z.array(z.number().int().min(0).max(7)).max(8),
    concerns: z.array(z.string().max(300)).max(8),
  })
  .strict();
