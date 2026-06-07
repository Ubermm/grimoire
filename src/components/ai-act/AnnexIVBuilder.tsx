'use client';
import { useState } from 'react';
import { Save, CheckCircle2, Circle } from 'lucide-react';
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
            <p className="text-sm font-medium text-neutral-900">Technical documentation completeness</p>
            <p className="text-xs text-neutral-400">Annex IV (Article 11) · {system.name}</p>
          </div>
          <span className="text-2xl font-semibold tabular-nums text-neutral-900">{pct}%</span>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-[#10A37F] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </Surface>

      {ANNEX_IV_SECTIONS.map((s) => {
        const doc = docs.find((d) => d.key === s.key)!;
        const complete = doc.status === 'completed';
        return (
          <Surface key={s.key} className="p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">{s.title}</p>
                <p className="mt-1 text-xs text-neutral-400">{s.prompt}</p>
              </div>
              <button
                onClick={() => update(s.key, { status: complete ? 'in_progress' : 'completed' })}
                className={cn('flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors',
                  complete ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-neutral-200 bg-white text-neutral-400 hover:text-neutral-600')}
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
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-[#10A37F] focus:outline-none focus:ring-1 focus:ring-[#10A37F]"
            />
          </Surface>
        );
      })}

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-xl border border-neutral-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
        <AccentButton onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />} Save documentation</AccentButton>
      </div>
    </div>
  );
}
