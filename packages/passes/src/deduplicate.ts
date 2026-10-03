/** Only repeated standalone prose instructions, never code, quotes, or creative repetition. */
export function deduplicateInstructions(source: string): {
  text: string;
  removed: number;
} {
  if (
    /[`"{}<>]|\b(verbatim|exact|repeat|poem|story|lyrics|example|sample|quote)\b/i.test(
      source,
    )
  )
    return { text: source, removed: 0 };
  const parts = source.split(/(\n\s*\n)/);
  let previous = '';
  let removed = 0;
  const kept: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const part = parts[i] ?? '';
    const key = part.trim();
    const instruction =
      key.length >= 12 &&
      /^(?:Use|Keep|Avoid|Run|Do not|Must|Only|Never|Follow|Return|Include|Exclude|Jangan|Gunakan|Hindari|Jalankan)\b/.test(
        key,
      ) &&
      /[.!]$/.test(key);
    if (instruction && previous === key) {
      removed++;
      continue;
    }
    previous = instruction ? key : '';
    if (kept.length) kept.push(parts[i - 1] ?? '\n\n');
    kept.push(part);
  }
  return { text: kept.join(''), removed };
}
