'use client';
// FDA audit run — subsection nav + per-CFR-code validation flow, with PDF export.
// Wired to the existing /api/audit (GET load, PATCH save). All engine APIs intact.
import { use, useState } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle, AlertCircle, FileDown, X } from 'lucide-react';
import { Surface, Spinner, PageHeader, AccentButton, GhostButton } from '@/components/module/ui';
import { AuditValidateFlow } from '@/components/fda-audit/AuditValidateFlow';
import { cn } from '@/lib/utils';

// react-pdf needs the browser; keep it out of SSR + the initial bundle.
const AuditReport = dynamic(() => import('@/components/AuditReport'), { ssr: false, loading: () => <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-[var(--ink-faint)]" /></div> });

type Result = { passed: boolean[]; description: string[] };

export default function AuditRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<any>(null);
  const [missing, setMissing] = useState(false);
  const [active, setActive] = useState(0);
  const [report, setReport] = useState(false);

  useEffect(() => {
    fetch(`/api/audit?id=${id}`).then(async (r) => { if (r.ok) setAudit(await r.json()); else setMissing(true); });
  }, [id]);

  const persist = async (subs: any[]) => {
    const done = subs.filter((s) => s.status === 'completed' || s.status === 'flagged').length;
    const status = done === subs.length ? 'completed' : 'in_progress';
    const next = { ...audit, subsections: subs, status, checkpoint: done };
    setAudit(next);
    await fetch('/api/audit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, subsections: subs, status, checkpoint: done }) });
  };

  const saveMain = (idx: number, responses: Record<string, string>, data: Result) => {
    const subs = audit.subsections.map((s: any, i: number) =>
      i === idx ? {
        ...s,
        responses: Object.entries(responses).map(([questionId, answer]) => ({ questionId, answer: String(answer), lastModified: new Date() })),
        validationResults: { passed: data.passed.map((b) => (b ? 'true' : 'false')), description: data.description },
        status: data.passed.every(Boolean) ? 'completed' : 'flagged',
      } : s
    );
    persist(subs);
  };

  const saveDeep = (idx: number, responses: Record<string, string>, data: Result) => {
    const subs = audit.subsections.map((s: any, i: number) =>
      i === idx ? {
        ...s,
        deepResponses: Object.entries(responses).map(([questionId, answer]) => ({ questionId, answer: String(answer), lastModified: new Date() })),
        deepValidationResults: { passed: data.passed.map((b) => (b ? 'true' : 'false')), description: data.description },
      } : s
    );
    persist(subs);
  };

  if (missing) return <p className="text-sm text-[var(--ink-muted)]">Audit not found.</p>;
  if (!audit) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-[var(--ink-faint)]" /></div>;

  const sub = audit.subsections[active];
  const initialResponses = Object.fromEntries((sub.responses || []).map((r: any) => [r.questionId, r.answer]));
  const initialDeepResponses = Object.fromEntries((sub.deepResponses || []).map((r: any) => [r.questionId, r.answer]));
  const statusIcon = (st: string) =>
    st === 'completed' ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : st === 'flagged' ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <Circle className="h-4 w-4 text-[var(--ink-faint)]" />;

  return (
    <>
      <Link href="/audit" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"><ArrowLeft className="h-4 w-4" /> Audits</Link>
      <PageHeader
        eyebrow={audit.metadata?.facility || 'FDA 21 CFR'}
        title={audit.name}
        subtitle={`${audit.subsections.length} CFR sections · ${String(audit.status).replace('_', ' ')}`}
        action={<GhostButton onClick={() => setReport(true)}><FileDown className="h-4 w-4" /> Report</GhostButton>}
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        {/* subsection nav — sticky so it follows the form as you scroll */}
        <div className="lg:sticky lg:top-24">
          <p className="mb-4 text-lg font-semibold text-[var(--ink)]">Sections</p>
          <Surface className="overflow-hidden p-1.5">
            {audit.subsections.map((s: any, i: number) => (
              <button key={s.id} onClick={() => setActive(i)}
                className={cn('font-accent flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  i === active ? 'bg-[var(--acc)]/10 font-medium text-[var(--acc)]' : 'text-[var(--ink-muted)] hover:bg-black/[0.03]')}>
                {statusIcon(s.status)}
                <span className="truncate">{s.code}</span>
              </button>
            ))}
          </Surface>
        </div>

        {/* active CFR section */}
        <div className="min-w-0">
          <h2 className="mb-4 text-lg font-semibold text-[var(--ink)]">{sub.code}</h2>
          <AuditValidateFlow
            key={sub.id}
            cfrCode={sub.code}
            initialResponses={initialResponses}
            initialDeepResponses={initialDeepResponses}
            onValidated={(data, responses) => saveMain(active, responses, data)}
            onDeepValidated={(data, responses) => saveDeep(active, responses, data)}
          />
        </div>
      </div>

      {/* PDF report modal — portaled to <body> so it isn't trapped by the
          .ai-rise transform's containing block and truly covers the viewport. */}
      {report && typeof document !== 'undefined' && createPortal(
        <div className="module-theme fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setReport(false)}>
          <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[var(--surface)] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
              <p className="font-accent text-sm font-semibold text-[var(--ink)]">Audit report — {audit.name}</p>
              <button onClick={() => setReport(false)} className="rounded-md p-1.5 text-[var(--ink-faint)] hover:bg-black/5 hover:text-[var(--ink)]"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <AuditReport audit={audit} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
