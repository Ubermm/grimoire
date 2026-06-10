'use client';
// Inline rule authoring for an audit subsection. Lists the current rules, lets an
// auditor add a rule in plain English (→ /api/rules/compile), and runs a
// contradiction/coverage scan (→ /api/rules/analyze). Edits flow up via onChange
// so the parent persists them to the audit's per-subsection snapshot.
import { useState } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import { Surface, AccentButton, GhostButton, Spinner } from '@/components/module/ui';
import { cn } from '@/lib/utils';

export function RuleAuthoringPanel({ form, regText, onChange }: { form: any; regText?: string; onChange: (f: any) => void }) {
  const [open, setOpen] = useState(false);
  const [nl, setNl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const addRule = async () => {
    if (!nl.trim()) return;
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/rules/compile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nl, form, regText }) });
      const d = await r.json();
      if (!r.ok) setErr(d?.error || 'Could not compile that rule — try rephrasing.');
      else { onChange(d.form); setNl(''); }
    } catch { setErr('Could not compile that rule — try again.'); }
    setBusy(false);
  };

  const removeRule = (i: number) => {
    // A rule consumes questions through a chain: question → fact template
    // (carries the {i} placeholder and question_id) → fact predicate →
    // validation body → query head. Deleting the rule must walk that chain:
    // drop the validation, drop facts nothing else calls, and DISABLE the
    // questions only those facts consumed. Disabled, not spliced — {i}
    // placeholders and qN ids are positional, so splicing would corrupt
    // every later reference.
    const queries = form.queries || [];
    const validations = form.validations || [];
    const facts = form.facts || [];
    const removed = queries[i];
    const remainingQueries = queries.filter((_: any, idx: number) => idx !== i);

    // 1. The validation(s) defining the removed query's head predicate;
    //    parallel-index fallback for seeded forms.
    const head = String(removed?.query || '').replace(/^\s*\?-\s*/, '').match(/^([a-z_][A-Za-z0-9_]*)/)?.[1];
    const defines = (rule: string) => !!head && new RegExp(`(^|\\n)\\s*${head}\\s*\\(`).test(String(rule || ''));
    const hasNamed = validations.some((v: any) => defines(v.rule));
    const remainingValidations = hasNamed
      ? validations.filter((v: any) => !defines(v.rule))
      : validations.filter((_: any, idx: number) => idx !== i);

    // 2. A fact is live iff something that still runs calls its predicate.
    const liveText = [
      ...remainingValidations.map((v: any) => String(v.rule || '')),
      ...remainingQueries.map((q: any) => String(q.query || '')),
    ].join('\n');
    const predOf = (t: string) => String(t || '').match(/(^|\n)\s*([a-z_][A-Za-z0-9_]*)\s*\(/)?.[2];
    const isCalled = (pred?: string) => !!pred && new RegExp(`\\b${pred}\\s*\\(`).test(liveText);
    const liveFacts: any[] = [];
    const deadFacts: any[] = [];
    for (const f of facts) (isCalled(predOf(f.template)) ? liveFacts : deadFacts).push(f);

    // 3. Question positions/ids still consumed vs. consumed only by the dead chain.
    const refs = (s: string) => Array.from(String(s || '').matchAll(/\{(\d+)\}/g)).map((m) => parseInt(m[1], 10));
    const livePos = new Set([
      ...liveFacts.flatMap((f: any) => refs(f.template)),
      ...remainingQueries.flatMap((q: any) => refs(q.query)),
    ]);
    const liveIds = new Set(liveFacts.map((f: any) => f.question_id).filter(Boolean));
    const deadPos = new Set([...deadFacts.flatMap((f: any) => refs(f.template)), ...refs(removed?.query)]);
    const deadIds = new Set(deadFacts.map((f: any) => f.question_id).filter(Boolean));

    const questions = (form.questions || []).map((q: any, qi: number) => {
      const pos = qi + 1;
      const touchedByDead = deadPos.has(pos) || deadIds.has(q.id);
      const stillLive = livePos.has(pos) || liveIds.has(q.id);
      return touchedByDead && !stillLive ? { ...q, disabled: true } : q;
    });

    onChange({ ...form, questions, facts: liveFacts, queries: remainingQueries, validations: remainingValidations });
  };

  const analyze = async () => {
    setAnalyzing(true);
    try {
      const r = await fetch('/api/rules/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form, regText }) });
      setAnalysis(await r.json());
    } catch { setAnalysis({ contradictions: [], coverageGaps: [] }); }
    setAnalyzing(false);
  };

  return (
    <Surface className="p-5">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between">
        <span className="font-accent flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--ink)]"><span aria-hidden>§</span> Rules &amp; checks <span className="font-normal tracking-normal text-[var(--ink-faint)]">· {form.queries?.length || 0}</span></span>
        <ChevronDown className={cn('h-4 w-4 text-[var(--ink-faint)] transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <ul className="space-y-1.5">
            {(form.queries || []).map((q: any, i: number) => (
              <li key={i} className="flex items-start justify-between gap-3 border border-[var(--line)] px-3 py-2">
                <span className="text-sm text-[var(--ink-muted)]">{q.description}</span>
                <button onClick={() => removeRule(i)} className="shrink-0 p-1 text-[var(--ink-faint)] transition-colors hover:bg-red-50 hover:text-red-600" aria-label="Remove rule"><Trash2 className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>

          <div>
            <label className="font-accent mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Add a rule in plain English</label>
            <textarea value={nl} onChange={(e) => setNl(e.target.value)} placeholder="e.g. Flag for human review if the batch record is missing a second-person signature." className="ai-field min-h-[74px] resize-y" />
            {err && <p className="mt-2 text-sm text-amber-700">{err}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AccentButton onClick={addRule} disabled={busy || !nl.trim()}>{busy ? <Spinner /> : <span aria-hidden>⊢</span>} Compile rule</AccentButton>
              <GhostButton onClick={analyze} disabled={analyzing || !(form.queries || []).length}>{analyzing ? <Spinner /> : null} Check rules</GhostButton>
            </div>
            <p className="mt-2 text-xs text-[var(--ink-faint)]">Compiled to formal logic and parse-checked. Verdicts can be pass, fail, or escalate.</p>
          </div>

          {analysis && (
            <div className="space-y-1.5 border border-[var(--line)] bg-black/[0.015] p-3 text-sm">
              {(!analysis.contradictions?.length && !analysis.coverageGaps?.length) && <p className="text-[var(--ink-muted)]">No contradictions or coverage gaps found.</p>}
              {analysis.contradictions?.map((c: any, i: number) => <p key={`c${i}`} className="text-amber-700">⚠ Contradiction — {c.why || `${c.a} vs ${c.b}`}</p>)}
              {analysis.coverageGaps?.map((g: string, i: number) => (
                <button key={`g${i}`} onClick={() => setNl(g)} className="block text-left text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">○ Gap — {g} <span className="text-[var(--ink-faint)]">(click to draft a rule)</span></button>
              ))}
            </div>
          )}
        </div>
      )}
    </Surface>
  );
}
