'use client';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { PageHeader, AccentButton, GhostButton, Surface, Spinner, EmptyState } from '@/components/ai-act/ui';
import { SystemRegistryTable } from '@/components/ai-act/SystemRegistryTable';

const inputCls =
  'w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#10A37F] focus:outline-none focus:ring-1 focus:ring-[#10A37F]';

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
        action={<AccentButton onClick={() => setShowNew((s) => !s)}><Plus className="h-4 w-4" /> New system</AccentButton>}
      />

      {showNew && (
        <Surface className="mb-6 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Name</label>
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. TalentRank CV screening" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Provider</label>
              <input className={inputCls} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Organisation name" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Description</label>
              <textarea className={inputCls} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does the system do?" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">Your role</label>
              <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="provider">Provider</option>
                <option value="deployer">Deployer</option>
                <option value="importer">Importer</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-neutral-600">
              <input type="checkbox" checked={form.isGPAI} onChange={(e) => setForm({ ...form, isGPAI: e.target.checked })} className="h-4 w-4 rounded border-neutral-300 text-[#10A37F] focus:ring-[#10A37F]" />
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
          action={<AccentButton onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New system</AccentButton>}
        />
      ) : (
        <SystemRegistryTable systems={systems} onDelete={remove} />
      )}
    </>
  );
}
