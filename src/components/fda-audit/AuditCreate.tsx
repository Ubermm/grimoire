'use client';
// FDA audit creation wizard — step 1: name + CFR code selection; step 2: metadata.
// Creates the audit via the existing POST /api/audit (one subsection per code),
// then routes into the run flow.
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, Search } from 'lucide-react';
import { PageHeader, AccentButton, GhostButton, Surface, Spinner, Field, Input } from '@/components/module/ui';
import { generateUUID } from '@/lib/utils';

const META_FIELDS = [
  { key: 'facility', label: 'Facility name', placeholder: 'Enter facility name' },
  { key: 'auditType', label: 'Audit type', placeholder: 'e.g. Annual, Quarterly, Special' },
  { key: 'department', label: 'Department', placeholder: 'Enter department name' },
  { key: 'reviewer', label: 'Lead reviewer', placeholder: "Enter lead reviewer's name" },
] as const;

export function AuditCreate() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ facility: '', auditType: '', department: '', reviewer: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch('/api/serveReg').then(async (r) => {
      if (r.ok) { const d = await r.json(); setCodes(d?.content?.Keys || []); }
    });
  }, []);

  const matches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return codes.filter((c) => c.toLowerCase().includes(term) && !selected.includes(c)).slice(0, 12);
  }, [search, codes, selected]);

  const add = (c: string) => { setSelected((s) => [...s, c]); setSearch(''); };
  const remove = (c: string) => setSelected((s) => s.filter((x) => x !== c));

  const step1Valid = name.trim() && selected.length > 0;
  const step2Valid = META_FIELDS.every((f) => meta[f.key].trim());

  const create = async () => {
    setCreating(true);
    const body = {
      name: name.trim(),
      status: 'in_progress',
      checkpoint: 0,
      subsections: selected.map((code, i) => ({ id: generateUUID(), pos: String(i + 1), code, status: 'pending', responses: [] })),
      metadata: meta,
    };
    const r = await fetch('/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setCreating(false);
    if (r.ok) { const a = await r.json(); router.push(`/audit/${a._id}`); }
  };

  return (
    <>
      <Link href="/audit" className="font-accent mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"><span aria-hidden>←</span> Audits</Link>
      <PageHeader eyebrow={`Step ${step} of 2`} title="New audit" subtitle={step === 1 ? 'Name the audit and pick the CFR codes to validate against.' : 'Add a little context for the record.'} />

      {step === 1 ? (
        <div className="space-y-6">
          <Surface className="p-6">
            <Field label="Audit name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 sterile manufacturing audit" />
            </Field>
          </Surface>

          <Surface className="p-6">
            <label className="font-accent mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">CFR codes</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]" />
              {/* .ai-field uses a `padding` shorthand that beats Tailwind's pl-*, so
                  override the left padding inline to clear the icon. */}
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search CFR codes — e.g. 211.22" className="ai-field" style={{ paddingLeft: '2.25rem' }} />
            </div>

            {matches.length > 0 && (
              <div className="mt-2 overflow-hidden border border-[var(--line)]">
                {matches.map((c) => (
                  <button key={c} onClick={() => add(c)} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-[var(--ink)] transition-colors hover:bg-black/[0.03]">
                    <span className="font-accent">{c}</span>
                    <Plus className="h-4 w-4 text-[var(--ink-faint)]" />
                  </button>
                ))}
              </div>
            )}

            {selected.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.map((c) => (
                  <span key={c} className="font-accent inline-flex items-center gap-1.5 rounded-[2px] bg-[var(--acc)] px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--acc-contrast)]">
                    {c}
                    <button onClick={() => remove(c)} className="opacity-70 hover:opacity-100"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
            {selected.length === 0 && <p className="mt-3 text-xs text-[var(--ink-faint)]">No codes selected yet. Search above and click to add.</p>}
          </Surface>

          <div className="flex justify-end">
            <AccentButton onClick={() => setStep(2)} disabled={!step1Valid}>Next <span aria-hidden>→</span></AccentButton>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Surface className="p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              {META_FIELDS.map((f) => (
                <Field key={f.key} label={f.label}>
                  <Input value={meta[f.key]} onChange={(e) => setMeta({ ...meta, [f.key]: e.target.value })} placeholder={f.placeholder} />
                </Field>
              ))}
            </div>
          </Surface>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep(1)}><span aria-hidden>←</span> Back</GhostButton>
            <AccentButton onClick={create} disabled={!step2Valid || creating}>{creating ? <Spinner /> : null} Create audit</AccentButton>
          </div>
        </div>
      )}
    </>
  );
}
