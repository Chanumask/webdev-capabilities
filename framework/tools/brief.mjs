// Helpers for the YAML-ish front matter at the top of brief/BRIEF.md.
import fs from 'node:fs';

const FM = /^---\n([\s\S]*?)\n---\n?/;

export function parseFrontMatter(text) {
  const m = FM.exec(text.replace(/\r\n/g, '\n'));
  const out = {};
  if (!m) return out;
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const value = line
      .slice(i + 1)
      .replace(/\s+#.*$/, '')
      .trim();
    if (key) out[key] = value;
  }
  return out;
}

/** Set or add keys in the front matter, keeping the rest of the file and trailing comments of other keys. */
export function setFrontMatterText(text, updates) {
  const t = text.replace(/\r\n/g, '\n');
  const m = FM.exec(t);
  if (!m)
    return `---\n${Object.entries(updates)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')}\n---\n\n${t}`;
  let block = m[1];
  for (const [k, v] of Object.entries(updates)) {
    const re = new RegExp(`^${k}:.*$`, 'm');
    block = re.test(block) ? block.replace(re, `${k}: ${v}`) : `${block}\n${k}: ${v}`;
  }
  return `---\n${block}\n---\n${t.slice(m[0].length)}`;
}

export function setFrontMatter(file, updates) {
  fs.writeFileSync(file, setFrontMatterText(fs.readFileSync(file, 'utf8'), updates));
}
