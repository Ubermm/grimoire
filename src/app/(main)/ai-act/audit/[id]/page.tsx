'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Surface, Spinner, PageHeader } from '@/components/ai-act/ui';
import { LeanValidateFlow } from '@/components/ai-act/LeanValidateFlow';
import { AuditContextPanel } from '@/components/audit-shared/AuditContextPanel';
import { cn } from '@/lib/utils';

const LABELS: Record<string, string> = {
  AIACT_ART_5: 'Article 5 — Prohibited practices',
  AIACT_ART_50: 'Article 50 — Transparency',
  AIACT_GPAI_CH1: 'Article 53 — GPAI obligations',
  AIACT_ANNEX_IV: 'Annex IV — Technical documentation',
};

export default function AuditRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<any>(null);
  const [missing, setMissing] = useState(false);
  const [active, setActive] = useState(0);
  const [autofillMeta, setAutofillMeta] = useState<any[]>([]);
  const [fillNonce, setFillNonce] = useState(0);

  useEffect(() => {
    fetch(`/api/ai-act/audits/${id}`).then(async (r) => { if (r.ok) setAudit(await r.json()); else setMissing(true); });
  }, [id]);

  const saveSubsection = async (idx: number, responses: Record<string, string>, data: any) => {
    const subs = audit.subsections.map((s: any, i: number) =>
      i === idx
        ? {
            ...s,
            responses: Object.entries(responses).map(([questionId, answer]) => ({ questionId, answer: String(answer) })),
            validationResults: {
              passed: data.passed.map((b: boolean) => (b ? 'true' : 'false')),
              description: data.description,
              status: data.status || data.passed.map((b: boolean) => (b ? 'pass' : 'fail')),
              reason: data.reason || [],
            },
            status: data.passed.every(Boolean) ? 'completed' : 'flagged',
          }
        : s
    );
    const allDone = subs.every((s: any) => s.status === 'completed' || s.status === 'flagged');
    const status = allDone ? 'completed' : 'in_progress';
    setAudit({ ...audit, subsections: subs, status });
    await fetch(`/api/ai-act/audits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subsections: subs, status }) });
  };

  // Persist auditor-edited rules to this audit's per-subsection snapshot only.
  const saveForm = (idx: number, formObj: any) => {
    const subs = audit.subsections.map((s: any, i: number) => (i === idx ? { ...s, form: JSON.stringify(formObj) } : s));
    setAudit({ ...audit, subsections: subs });
    fetch(`/api/ai-act/audits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subsections: subs }) });
  };

  const saveDossier = (d: any) => {
    setAudit((a: any) => ({ ...a, contextDossier: d }));
    fetch(`/api/ai-act/audits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contextDossier: d }) });
  };

  const onFilled = (perSub: any[]) => {
    const subs = audit.subsections.map((s: any, i: number) => {
      const f = perSub[i];
      if (!f || !Object.keys(f.responses).length) return s;
      const merged = { ...Object.fromEntries((s.responses || []).map((r: any) => [r.questionId, r.answer])), ...f.responses };
      return { ...s, responses: Object.entries(merged).map(([questionId, answer]) => ({ questionId, answer: String(answer) })) };
    });
    setAudit({ ...audit, subsections: subs });
    setAutofillMeta(perSub.map((f: any) => f.meta));
    setFillNonce((n) => n + 1);
    fetch(`/api/ai-act/audits/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subsections: subs }) });
  };

  if (missing) return <p className="text-sm text-[var(--ink-muted)]">Audit not found.</p>;
  if (!audit) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>;

  const sub = audit.subsections[active];
  const initialResponses = Object.fromEntries((sub.responses || []).map((r: any) => [r.questionId, r.answer]));
  const statusIcon = (st: string) =>
    st === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : st === 'flagged' ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <Circle className="h-4 w-4 text-[var(--ink-faint)]" />;

  return (
    <>
      <Link href="/ai-act/audit" className="font-accent mb-6 inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.1em] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"><span aria-hidden>←</span> Audits</Link>
      <PageHeader title={audit.name} subtitle={`${audit.subsections.length} provisions · ${audit.status.replace('_', ' ')}`} />

      <div className="mb-6">
        <AuditContextPanel subsections={audit.subsections} dossier={audit.contextDossier} onDossierChange={saveDossier} onFilled={onFilled} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* subsection nav */}
        <Surface className="h-fit overflow-hidden p-1.5">
          {audit.subsections.map((s: any, i: number) => (
            <button key={s.id} onClick={() => setActive(i)}
              className={cn('flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                i === active ? 'bg-[var(--acc-soft)] font-medium text-[var(--ink)]' : 'text-[var(--ink-muted)] hover:bg-black/[0.02]')}>
              {statusIcon(s.status)}
              <span className="truncate">{LABELS[s.code] || s.code}</span>
            </button>
          ))}
        </Surface>

        {/* active provision form */}
        <div>
          <h2 className="mb-4 text-lg text-[var(--ink)]">{LABELS[sub.code] || sub.code}</h2>
          <LeanValidateFlow
            key={`${sub.id}:${fillNonce}`}
            formCode={sub.code}
            initialForm={sub.form}
            initialResponses={initialResponses}
            autofillMeta={autofillMeta[active]}
            onValidated={(data, responses) => saveSubsection(active, responses, data)}
            onFormChange={(f) => saveForm(active, f)}
          />
        </div>
      </div>
    </>
  );
}
