'use client';
// FDA audits dashboard — lists the user's audits, supports rename + delete, and
// links into the run flow. Talks to the existing /api/audit (GET/PATCH/DELETE).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { PageHeader, AccentButton, Surface, Spinner, EmptyState, Badge } from '@/components/module/ui';
import { cn } from '@/lib/utils';

type Audit = {
  _id: string;
  name: string;
  status: string;
  subsections: { status: string }[];
  metadata?: { facility?: string };
  updatedAt?: string;
};

export function AuditList() {
  const [audits, setAudits] = useState<Audit[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const load = async () => {
    const r = await fetch('/api/audit');
    setAudits(r.ok ? await r.json() : []);
  };
  useEffect(() => { load(); }, []);

  const rename = async (id: string) => {
    const name = draftName.trim();
    setEditingId(null);
    if (!name) return;
    setAudits((a) => a!.map((x) => (x._id === id ? { ...x, name } : x)));
    await fetch('/api/audit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, name }) });
  };

  const remove = async (id: string) => {
    setAudits((a) => a!.filter((x) => x._id !== id));
    setPendingDelete(null);
    await fetch(`/api/audit?id=${id}`, { method: 'DELETE' });
  };

  return (
    <>
      <PageHeader
        eyebrow="FDA 21 CFR"
        title="Compliance audits"
        subtitle="Build a CFR audit, answer the screening questions, and prove compliance with a deterministic Prolog engine — auditable verdicts, not checklists."
        action={<Link href="/audit/new"><AccentButton><Plus className="h-4 w-4" /> New audit</AccentButton></Link>}
      />

      {audits === null ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-[var(--ink-faint)]" /></div>
      ) : audits.length === 0 ? (
        <EmptyState title="No audits yet" hint="Create your first CFR audit to get started." action={<Link href="/audit/new"><AccentButton><Plus className="h-4 w-4" /> New audit</AccentButton></Link>} />
      ) : (
        <div className="space-y-3">
          {audits.map((a) => {
            const done = a.subsections.filter((s) => s.status === 'completed' || s.status === 'flagged').length;
            const editing = editingId === a._id;
            const confirming = pendingDelete === a._id;
            return (
              <Surface key={a._id} className="flex items-center justify-between gap-4 p-5">
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <input autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') rename(a._id); if (e.key === 'Escape') setEditingId(null); }}
                        className="ai-field max-w-sm" />
                      <button onClick={() => rename(a._id)} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"><Check className="h-4 w-4" /></button>
                      <button onClick={() => setEditingId(null)} className="rounded-md p-1.5 text-[var(--ink-faint)] hover:bg-black/5"><X className="h-4 w-4" /></button>
                    </div>
                  ) : (
                    <Link href={`/audit/${a._id}`} className="group block">
                      <p className="truncate font-accent font-medium text-[var(--ink)] group-hover:underline">{a.name}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-[var(--ink-faint)]">
                        <Badge className="capitalize">{a.status.replace('_', ' ')}</Badge>
                        <span>{done}/{a.subsections.length} sections</span>
                        {a.metadata?.facility && <span className="truncate">· {a.metadata.facility}</span>}
                      </p>
                    </Link>
                  )}
                </div>

                {!editing && (
                  <div className="flex shrink-0 items-center gap-1">
                    {confirming ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => remove(a._id)} className="rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</button>
                        <button onClick={() => setPendingDelete(null)} className="rounded-md px-2 py-1 text-xs text-[var(--ink-faint)] hover:bg-black/5">Cancel</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => { setEditingId(a._id); setDraftName(a.name); }} className="rounded-md p-2 text-[var(--ink-faint)] hover:bg-black/5 hover:text-[var(--ink)]" aria-label="Rename"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setPendingDelete(a._id)} className="rounded-md p-2 text-[var(--ink-faint)] hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                        <Link href={`/audit/${a._id}`} className={cn('rounded-md p-2 text-[var(--ink-faint)] hover:bg-black/5 hover:text-[var(--ink)]')} aria-label="Open"><ChevronRight className="h-4 w-4" /></Link>
                      </>
                    )}
                  </div>
                )}
              </Surface>
            );
          })}
        </div>
      )}
    </>
  );
}
