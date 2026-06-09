'use client';
import { useEffect, useState } from 'react';
import { PageHeader, AccentButton, GhostButton, Surface, Spinner, EmptyState } from '@/components/ai-act/ui';
import { SystemRegistryTable } from '@/components/ai-act/SystemRegistryTable';

const inputCls = 'ai-field';
const labelCls = 'font-accent mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]';

const empty = { name: '', description: '', provider: '', role: 'provider', isGPAI: false };

export default function RegistryPage() {
  const [systems, setSystems] = useState<any[] | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const res = await fetch('/api/ai-act/systems');
    setSystems(res.ok ? await res.json() : []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch('/api/ai-act/systems', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { setShowNew(false); setForm({ ...empty }); load(); }
  };

  const remove = async (id: string) => {
    await fetch(`/api/ai-act/systems/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <>
      <PageHeader
        title="AI system registry"
        subtitle="Your inventory of AI systems and their EU AI Act compliance status."
        action={<AccentButton onClick={() => setShowNew((s) => !s)}><span aria-hidden>+</span> New system</AccentButton>}
      />

      {showNew && (
        <Surface className="mb-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. TalentRank CV screening" />
            </div>
            <div>
              <label className={labelCls}>Provider</label>
              <input className={inputCls} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Organisation name" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does the system do?" />
            </div>
            <div>
              <label className={labelCls}>Your role</label>
              <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="provider">Provider</option>
                <option value="deployer">Deployer</option>
                <option value="importer">Importer</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-[var(--ink-muted)]">
              <input type="checkbox" checked={form.isGPAI} onChange={(e) => setForm({ ...form, isGPAI: e.target.checked })} className="h-4 w-4 border-[var(--line-strong)] text-[var(--acc)] focus:ring-[var(--acc)]" />
              General-purpose AI model (GPAI)
            </label>
          </div>
          <div className="mt-5 flex items-center gap-2">
            <AccentButton onClick={create} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : null} Create</AccentButton>
            <GhostButton onClick={() => { setShowNew(false); setForm({ ...empty }); }}>Cancel</GhostButton>
          </div>
        </Surface>
      )}

      {systems === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>
      ) : systems.length === 0 ? (
        <EmptyState
          title="No AI systems yet"
          hint="Register your first AI system to start classifying and documenting it."
          action={<AccentButton onClick={() => setShowNew(true)}><span aria-hidden>+</span> New system</AccentButton>}
        />
      ) : (
        <SystemRegistryTable systems={systems} onDelete={remove} />
      )}
    </>
  );
}
