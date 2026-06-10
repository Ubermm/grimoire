'use client';
// FDA audit run — subsection nav + per-CFR-code validation flow, with PDF export.
// Wired to the existing /api/audit (GET load, PATCH save). All engine APIs intact.
import { use, useState } from 'react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CheckCircle2, Circle, AlertCircle, FileDown, X } from 'lucide-react';
import { Surface, Spinner, PageHeader, AccentButton, GhostButton } from '@/components/module/ui';
import { AuditValidateFlow } from '@/components/fda-audit/AuditValidateFlow';
import { AuditContextPanel } from '@/components/audit-shared/AuditContextPanel';
import { cn } from '@/lib/utils';

// react-pdf needs the browser; keep it out of SSR + the initial bundle.
const AuditReport = dynamic(() => import('@/components/AuditReportV2'), { ssr: false, loading: () => <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-[var(--ink-faint)]" /></div> });

type Result = { passed: boolean[]; description: string[]; status?: string[]; reason?: string[] };

export default function AuditRunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [audit, setAudit] = useState<any>(null);
  const [missing, setMissing] = useState(false);
  const [active, setActive] = useState(0);
  const [report, setReport] = useState(false);
  const [includeComments, setIncludeComments] = useState(true);
  const [includeDeep, setIncludeDeep] = useState(true);
  const [autofillMeta, setAutofillMeta] = useState<any[]>([]);
  const [fillNonce, setFillNonce] = useState(0);

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
        validationResults: {
          passed: data.passed.map((b) => (b ? 'true' : 'false')),
          description: data.description,
          status: data.status || data.passed.map((b) => (b ? 'pass' : 'fail')),
          reason: data.reason || [],
        },
        status: data.passed.every(Boolean) ? 'completed' : 'flagged',
      } : s
    );
    persist(subs);
  };

  // Persist auditor-edited rules to this audit's per-subsection snapshot only.
  // `field` is 'form' (base) or 'deepForm' (warning-letter hindsight checks).
  const saveSnapshot = (idx: number, field: 'form' | 'deepForm', formObj: any) => {
    const subs = audit.subsections.map((s: any, i: number) => (i === idx ? { ...s, [field]: JSON.stringify(formObj) } : s));
    setAudit({ ...audit, subsections: subs });
    fetch('/api/audit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, subsections: subs }) });
  };

  // Auditor comments — saved against the active subsection; status/checkpoint
  // are untouched (mirrors the saveForm pattern).
  const saveComment = (idx: number, field: 'comment' | 'deepComment', text: string) => {
    const subs = audit.subsections.map((s: any, i: number) => (i === idx ? { ...s, [field]: text } : s));
    setAudit({ ...audit, subsections: subs });
    fetch('/api/audit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, subsections: subs }) });
  };

  const saveDossier = (d: any) => {
    setAudit((a: any) => ({ ...a, contextDossier: d }));
    fetch('/api/audit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, contextDossier: d }) });
  };

  // Bulk autofill across all subsections: merge deduced answers into responses,
  // keep confidence/source meta for review, remount the active flow to show them.
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
    fetch('/api/audit', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _id: id, subsections: subs }) });
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
      <Link href="/audit" className="font-accent mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"><span aria-hidden>←</span> Audits</Link>
      <PageHeader
        eyebrow={audit.metadata?.facility || 'FDA 21 CFR'}
        title={audit.name}
        subtitle={`${audit.subsections.length} CFR sections · ${String(audit.status).replace('_', ' ')}`}
        action={<GhostButton onClick={() => setReport(true)}><FileDown className="h-4 w-4" /> Report</GhostButton>}
      />

      <div className="mb-6">
        <AuditContextPanel subsections={audit.subsections} dossier={audit.contextDossier} onDossierChange={saveDossier} onFilled={onFilled} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
        {/* subsection nav — sticky so it follows the form as you scroll */}
        <div className="lg:sticky lg:top-24">
          <p className="font-accent mb-4 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">Sections</p>
          <Surface className="overflow-hidden p-1.5">
            {audit.subsections.map((s: any, i: number) => (
              <button key={s.id} onClick={() => setActive(i)}
                className={cn('font-accent flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors',
                  i === active ? 'bg-[var(--acc-soft)] font-medium text-[var(--ink)]' : 'text-[var(--ink-muted)] hover:bg-black/[0.03]')}>
                {statusIcon(s.status)}
                <span className="truncate">{s.code}</span>
              </button>
            ))}
          </Surface>
        </div>

        {/* active CFR section */}
        <div className="min-w-0">
          <h2 className="mb-4 text-xl text-[var(--ink)]">{sub.code}</h2>
          <AuditValidateFlow
            key={`${sub.id}:${fillNonce}`}
            cfrCode={sub.code}
            initialForm={sub.form}
            initialDeepForm={sub.deepForm}
            initialResponses={initialResponses}
            initialDeepResponses={initialDeepResponses}
            autofillMeta={autofillMeta[active]}
            initialComment={sub.comment}
            initialDeepComment={sub.deepComment}
            onValidated={(data, responses) => saveMain(active, responses, data)}
            onDeepValidated={(data, responses) => saveDeep(active, responses, data)}
            onFormChange={(f) => saveSnapshot(active, 'form', f)}
            onDeepFormChange={(f) => saveSnapshot(active, 'deepForm', f)}
            onComment={(text) => saveComment(active, 'comment', text)}
            onDeepComment={(text) => saveComment(active, 'deepComment', text)}
          />
        </div>
      </div>

      {/* PDF report modal — portaled to <body> so it isn't trapped by the
          .ai-rise transform's containing block and truly covers the viewport. */}
      {report && typeof document !== 'undefined' && createPortal(
        <div className="module-theme fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setReport(false)}>
          <div className="flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3">
              <p className="font-accent text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]">Audit report — {audit.name}</p>
              <div className="flex items-center gap-4">
                <label className="font-accent flex cursor-pointer select-none items-center gap-2 text-xs text-[var(--ink-muted)]">
                  <input type="checkbox" checked={includeComments} onChange={(e) => setIncludeComments(e.target.checked)} />
                  Include auditor comments
                </label>
                <label className="font-accent flex cursor-pointer select-none items-center gap-2 text-xs text-[var(--ink-muted)]">
                  <input type="checkbox" checked={includeDeep} onChange={(e) => setIncludeDeep(e.target.checked)} />
                  Include deep validation
                </label>
                <button onClick={() => setReport(false)} className="p-1.5 text-[var(--ink-faint)] hover:bg-black/5 hover:text-[var(--ink)]"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <AuditReport audit={audit} includeComments={includeComments} includeDeep={includeDeep} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
