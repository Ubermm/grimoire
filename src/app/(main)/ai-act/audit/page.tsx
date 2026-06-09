'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { PageHeader, AccentButton, GhostButton, Surface, Spinner, EmptyState } from '@/components/ai-act/ui';
import { cn } from '@/lib/utils';

const PROVISIONS = [
  { code: 'AIACT_ART_5', label: 'Article 5 — Prohibited practices' },
  { code: 'AIACT_ART_50', label: 'Article 50 — Transparency' },
  { code: 'AIACT_GPAI_CH1', label: 'Article 53 — GPAI obligations' },
  { code: 'AIACT_ANNEX_IV', label: 'Annex IV — Technical documentation' },
];

function Inner() {
  const router = useRouter();
  const preSystem = useSearchParams().get('system') || '';
  const [audits, setAudits] = useState<any[] | null>(null);
  const [systems, setSystems] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>(['AIACT_ART_5']);
  const [systemId, setSystemId] = useState(preSystem);
  const [creating, setCreating] = useState(false);

  const load = async () => { const r = await fetch('/api/ai-act/audits'); setAudits(r.ok ? await r.json() : []); };
  useEffect(() => { load(); fetch('/api/ai-act/systems').then(async (r) => { if (r.ok) setSystems(await r.json()); }); }, []);

  const toggle = (c: string) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  const create = async () => {
    if (!name.trim() || selected.length === 0) return;
    setCreating(true);
    const r = await fetch('/api/ai-act/audits', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, provisions: selected, systemId: systemId || undefined }),
    });
    setCreating(false);
    if (r.ok) { const a = await r.json(); router.push(`/ai-act/audit/${a._id}`); }
  };

  return (
    <>
      <PageHeader title="AI Act audits" subtitle="Article-by-article audits with formal Prolog validation per requirement."
        action={<AccentButton onClick={() => setShowNew((s) => !s)}><span aria-hidden>+</span> New audit</AccentButton>} />

      {showNew && (
        <Surface className="mb-6 p-5">
          <label className="font-accent mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Audit name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Q3 EU AI Act review"
            className="ai-field mb-4" />

          {systems.length > 0 && (
            <div className="mb-4">
              <label className="font-accent mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Linked system (optional)</label>
              <select value={systemId} onChange={(e) => setSystemId(e.target.value)} className="ai-field cursor-pointer">
                <option value="">— none —</option>
                {systems.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}

          <label className="font-accent mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Provisions to audit</label>
          <div className="flex flex-wrap gap-2">
            {PROVISIONS.map((p) => (
              <button key={p.code} type="button" onClick={() => toggle(p.code)}
                className={cn('font-accent border px-3 py-1.5 text-xs font-medium transition-colors',
                  selected.includes(p.code) ? 'border-[var(--acc)] bg-[var(--acc)] text-[var(--acc-contrast)]' : 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink)]')}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <AccentButton onClick={create} disabled={creating || !name.trim() || selected.length === 0}>{creating ? <Spinner /> : null} Create audit</AccentButton>
            <GhostButton onClick={() => setShowNew(false)}>Cancel</GhostButton>
          </div>
        </Surface>
      )}

      {audits === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>
      ) : audits.length === 0 ? (
        <EmptyState title="No audits yet" hint="Start an article-by-article AI Act audit." action={<AccentButton onClick={() => setShowNew(true)}><span aria-hidden>+</span> New audit</AccentButton>} />
      ) : (
        <div className="space-y-3">
          {audits.map((a) => {
            const done = a.subsections.filter((s: any) => s.status === 'completed' || s.status === 'flagged').length;
            return (
              <Link key={a._id} href={`/ai-act/audit/${a._id}`}>
                <Surface className="flex items-center justify-between p-5 transition-colors hover:border-[var(--ink)]">
                  <div>
                    <p className="font-medium text-[var(--ink)]">{a.name}</p>
                    <p className="font-accent mt-0.5 text-xs capitalize text-[var(--ink-faint)]">{a.status.replace('_', ' ')} · {done}/{a.subsections.length} provisions</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--ink-faint)]" />
                </Surface>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>}><Inner /></Suspense>;
}
