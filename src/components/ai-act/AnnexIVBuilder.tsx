'use client';
import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { ANNEX_IV_SECTIONS, completionPercentage } from '@/lib/ai-act/annex-iv-sections';
import { Surface, AccentButton, Spinner } from './ui';
import { cn } from '@/lib/utils';

export function AnnexIVBuilder({ system }: { system: any }) {
  const initDocs = () => {
    const existing = Object.fromEntries((system.technicalDocumentation || []).map((d: any) => [d.key, d]));
    return ANNEX_IV_SECTIONS.map((s) => existing[s.key] || { key: s.key, title: s.title, status: 'pending', content: '', responses: [] });
  };
  const [docs, setDocs] = useState<any[]>(initDocs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: string, patch: any) => setDocs((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const pct = completionPercentage(docs);

  const save = async () => {
    setSaving(true);
    await fetch(`/api/ai-act/systems/${system._id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ technicalDocumentation: docs }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <Surface className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-accent text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">Technical documentation completeness</p>
            <p className="font-accent mt-1 text-xs text-[var(--ink-faint)]">Annex IV (Article 11) · {system.name}</p>
          </div>
          <span className="font-accent text-2xl font-medium tabular-nums text-[var(--ink)]">{pct}%</span>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden bg-black/[0.06]">
          <div className="h-full bg-[var(--acc)] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Surface>

      {ANNEX_IV_SECTIONS.map((s) => {
        const doc = docs.find((d) => d.key === s.key)!;
        const complete = doc.status === 'completed';
        return (
          <Surface key={s.key} className="p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-accent text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">{s.title}</p>
                <p className="mt-1 text-xs text-[var(--ink-faint)]">{s.prompt}</p>
              </div>
              <button
                onClick={() => update(s.key, { status: complete ? 'in_progress' : 'completed' })}
                className={cn('font-accent flex shrink-0 items-center gap-1.5 border px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.1em] transition-colors',
                  complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink-faint)] hover:text-[var(--ink)]')}
              >
                {complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                {complete ? 'Complete' : 'Mark complete'}
              </button>
            </div>
            <textarea
              value={doc.content}
              onChange={(e) => update(s.key, { content: e.target.value, status: doc.status === 'pending' && e.target.value ? 'in_progress' : doc.status })}
              rows={4}
              placeholder="Document this section…"
              className="ai-field resize-y"
            />
          </Surface>
        );
      })}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 border border-[var(--line)] bg-[var(--surface)]/90 px-5 py-3 backdrop-blur">
        {saved && <span className="font-accent text-sm text-emerald-600">Saved ✓</span>}
        <AccentButton onClick={save} disabled={saving}>{saving ? <Spinner /> : null} Save documentation</AccentButton>
      </div>
    </div>
  );
}
