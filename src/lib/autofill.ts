//@ts-nocheck
// Canonicalize an LLM-deduced answer against the question's actual shape, so
// autofill can only ever assert values the form (and therefore the Prolog
// substitution) accepts. Returns null when the value can't be grounded in the
// field's options — better to leave a question open than to store an atom no
// rule can match (e.g. "female" against a yes/no SELECT).
export function canonicalizeAnswer(raw: any, field: { type?: string; options?: string[] }): string | null {
  const v = String(raw ?? '').trim();
  if (!v) return null;
  const t = (field.type || '').toUpperCase();

  if (t === 'NUMERIC') {
    const m = v.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
    return m ? m[0] : null;
  }

  const opts = field.options || [];
  if (!opts.length) return v; // TEXT / DATE / TIME pass through as-is

  const exact = (s: string) => opts.find((o) => o.toLowerCase() === s.toLowerCase());

  if (t === 'CHECKBOX') {
    const picked: string[] = [];
    for (const part of v.split(',').map((p) => p.trim()).filter(Boolean)) {
      const o = exact(part);
      if (o && !picked.includes(o)) picked.push(o);
    }
    return picked.length ? picked.join(',') : null;
  }

  // SELECT / segmented boolean
  const direct = exact(v);
  if (direct) return direct;
  const yes = opts.find((o) => /^(yes|true)$/i.test(o));
  const no = opts.find((o) => /^(no|false)$/i.test(o));
  if (yes && /^(y|yes|true|affirmative|correct)\b/i.test(v)) return yes;
  if (no && /^(n|no|false|negative|incorrect)\b/i.test(v)) return no;
  const contained = opts.find((o) => v.toLowerCase().includes(o.toLowerCase()));
  return contained ?? null;
}
