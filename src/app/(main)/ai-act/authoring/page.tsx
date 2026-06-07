'use client';
import { useEffect, useState } from 'react';
import { Sparkles, FolderOpen } from 'lucide-react';
import { PageHeader, Surface, AccentButton, GhostButton, Spinner, EmptyState } from '@/components/ai-act/ui';
import { FormAuthoringEditor } from '@/components/ai-act/FormAuthoringEditor';

export default function AuthoringPage() {
  const [regs, setRegs] = useState<any[]>([]);
  const [regCode, setRegCode] = useState('');
  const [form, setForm] = useState<any>(null);
  const [formCode, setFormCode] = useState('');
  const [loading, setLoading] = useState<'' | 'gen' | 'load'>('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/ai-act/regulations').then(async (r) => {
      if (r.ok) { const d = await r.json(); setRegs(d); if (d[0]) setRegCode(d[0].RegCode); }
    });
  }, []);

  const selected = regs.find((r) => r.RegCode === regCode);

  const generate = async () => {
    if (!selected) return;
    setLoading('gen'); setError('');
    const res = await fetch('/api/ai-act/generate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articleCode: selected.RegCode, articleText: selected.RegText, formCode: selected.FormCode, regenerate: true }),
    });
    setLoading('');
    if (res.ok) { const d = await res.json(); setForm(d.form); setFormCode(d.formCode); }
    else setError(`Generation failed (${res.status}). The Azure model may be unavailable — try loading the seeded form instead.`);
  };

  const loadExisting = async () => {
    if (!selected) return;
    setLoading('load'); setError('');
    const res = await fetch(`/api/ai-act/forms?code=${selected.FormCode}`);
    setLoading('');
    if (res.ok) { const d = await res.json(); setForm(JSON.parse(d.FormText)); setFormCode(d.FormCode); }
    else setError('No existing form for this provision yet — generate one with AI.');
  };

  return (
    <>
      <PageHeader title="Rule authoring" subtitle="Generate a validation form for any provision with AI, then refine the questions, Prolog facts, rules and queries by hand." />
      <Surface className="mb-6 p-5">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Provision</label>
        <select value={regCode} onChange={(e) => { setRegCode(e.target.value); setForm(null); setError(''); }}
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[var(--acc)] focus:outline-none">
          {regs.map((r) => <option key={r.RegCode} value={r.RegCode}>{r.RegCode} — {r.category}</option>)}
        </select>
        <div className="mt-4 flex flex-wrap gap-2">
          <AccentButton onClick={generate} disabled={loading !== '' || !selected}>{loading === 'gen' ? <Spinner /> : <Sparkles className="h-4 w-4" />} Generate with AI</AccentButton>
          <GhostButton onClick={loadExisting} disabled={loading !== '' || !selected}>{loading === 'load' ? <Spinner /> : <FolderOpen className="h-4 w-4" />} Load existing form</GhostButton>
        </div>
        {error && <p className="mt-3 text-sm text-amber-600">{error}</p>}
        {selected && <p className="mt-3 text-xs text-neutral-400">Form code: <span className="font-mono">{selected.FormCode}</span></p>}
      </Surface>

      {form ? (
        <FormAuthoringEditor initialForm={form} formCode={formCode} regCode={regCode} />
      ) : (
        <EmptyState title="No form loaded" hint="Generate a form with AI or load the seeded one to start editing." />
      )}
    </>
  );
}
