'use client';
// Renders an AI Act validation form (questions), supports autofill, POSTs to the
// shared /api/validate, and shows a light OpenAI-style results panel. Optionally
// persists the result onto an AISystem (merged by FormCode).
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Surface, AccentButton, Spinner, EmptyState } from './ui';
import { RuleAuthoringPanel } from '@/components/rules/RuleAuthoringPanel';
import { cn } from '@/lib/utils';

const statusOf = (r: any, i: number) => r.status?.[i] || (r.passed[i] ? 'pass' : 'fail');

function Segmented({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex w-fit flex-wrap divide-x divide-[var(--line-strong)] border border-[var(--line-strong)] bg-[var(--surface)]">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={cn('px-3.5 py-1 text-sm font-medium transition-colors', value === o ? 'bg-[var(--acc)] text-[var(--acc-contrast)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink-muted)]')}>
          {o}
        </button>
      ))}
    </div>
  );
}

function Field({ q, value, onChange }: { q: any; value: any; onChange: (v: any) => void }) {
  if (q.type === 'CHECKBOX') {
    const arr: string[] = value ? String(value).split(',').filter(Boolean) : [];
    const toggle = (o: string) => onChange((arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]).join(','));
    return (
      <div className="flex flex-wrap gap-2">
        {(q.options || []).map((o: string) => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={cn('font-accent border px-3 py-1 text-xs font-medium transition-colors', arr.includes(o) ? 'border-[var(--acc)] bg-[var(--acc)] text-[var(--acc-contrast)]' : 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--ink)]')}>
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === 'NUMERIC') {
    return <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      className="ai-field w-40 py-1.5" />;
  }
  if (q.type === 'TEXT') {
    return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      className="ai-field py-1.5" />;
  }
  return <Segmented options={q.options || ['yes', 'no']} value={value} onChange={onChange} />;
}

export function LeanValidateFlow({ formCode, initialForm, regText, systemId, initialResponses, autofillMeta, onValidated, onFormChange }: { formCode: string; initialForm?: string | any; regText?: string; systemId?: string; initialResponses?: Record<string, string>; autofillMeta?: Record<string, any>; onValidated?: (r: any, responses: Record<string, string>) => void; onFormChange?: (form: any) => void }) {
  const [form, setForm] = useState<any>(null);
  const [missing, setMissing] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>(initialResponses || {});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Per-audit snapshot wins over the global template.
    if (initialForm) {
      try {
        const snap = typeof initialForm === 'string' ? JSON.parse(initialForm) : initialForm;
        if (snap?.questions?.length) { setForm(snap); return; }
      } catch { /* fall through to global fetch */ }
    }
    fetch(`/api/ai-act/forms?code=${formCode}`).then(async (r) => {
      if (r.ok) { const f = await r.json(); setForm(JSON.parse(f.FormText)); }
      else setMissing(true);
    });
  }, [formCode, initialForm]);

  const answered = form ? form.questions.filter((q: any) => responses[q.id] != null && responses[q.id] !== '').length : 0;

  const validate = async () => {
    setLoading(true);
    const res = await fetch('/api/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: formCode, responses, form }) });
    if (res.ok) {
      const data = await res.json(); // { passed: boolean[], description: string[] }
      setResults(data);
      if (systemId) {
        try {
          const cur = await (await fetch(`/api/ai-act/systems/${systemId}`)).json();
          const others = (cur.validationResults || []).filter((v: any) => v.formCode !== formCode);
          await fetch(`/api/ai-act/systems/${systemId}`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ validationResults: [...others, { formCode, passed: data.passed, description: data.description, validatedAt: new Date() }] }),
          });
        } catch { /* best-effort persistence */ }
      }
      onValidated?.(data, responses);
    }
    setLoading(false);
  };

  if (missing) return <EmptyState title="Form not available" hint={`No seeded form for ${formCode}. Generate one in the Rule authoring tool.`} />;
  if (!form) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>;

  const states = results ? results.description.map((_: any, i: number) => statusOf(results, i)) : [];
  const overall = results ? states.every((s: string) => s === 'pass') : null;
  const anyFail = states.some((s: string) => s === 'fail');

  return (
    <div className="space-y-5">
      <Surface className="p-6">
        <div className="mb-5">
          <span className="font-accent text-sm text-[var(--ink-muted)]">{answered}/{form.questions.length} answered</span>
        </div>
        <div className="space-y-5">
          {form.questions.map((q: any) => (
            <div key={q.id} className="flex flex-col gap-2.5 border-b border-[var(--line)] pb-5 last:border-0 last:pb-0">
              <div>
                <p className="text-sm text-[var(--ink)]">{q.text}</p>
                {q.reference && <p className="font-accent mt-0.5 text-xs text-[var(--ink-faint)]">{q.reference}</p>}
              </div>
              <Field q={q} value={responses[q.id]} onChange={(v) => setResponses({ ...responses, [q.id]: v })} />
              {autofillMeta?.[q.id] && (
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--ink-faint)]">
                  <span className={cn('font-accent rounded-[2px] px-1.5 py-0.5 ring-1 ring-inset',
                    autofillMeta[q.id].confidence === 'high' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : autofillMeta[q.id].confidence === 'medium' ? 'bg-amber-50 text-amber-700 ring-amber-200'
                      : 'bg-neutral-100 text-neutral-500 ring-neutral-200')}>
                    auto · {autofillMeta[q.id].confidence}
                  </span>
                  {autofillMeta[q.id].source && <span className="italic">{autofillMeta[q.id].source}</span>}
                </p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6">
          <AccentButton onClick={validate} disabled={loading || answered === 0}>{loading ? <Spinner /> : null} Validate</AccentButton>
        </div>
      </Surface>

      {onFormChange && <RuleAuthoringPanel form={form} regText={regText} onChange={(f) => { setForm(f); onFormChange(f); }} />}

      {results && (
        <Surface className={cn('p-6', overall ? 'border-emerald-200' : 'border-amber-200')}>
          <p className={cn('mb-4 flex items-center gap-2 text-sm font-semibold', overall ? 'text-emerald-700' : 'text-amber-700')}>
            {overall ? <CheckCircle2 className="h-5 w-5" /> : anyFail ? <XCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            {overall ? 'All requirements satisfied' : anyFail ? 'Issues found — see below' : 'Some items need review — see below'}
          </p>
          <ul className="space-y-2">
            {results.description.map((d: string, i: number) => {
              const st = states[i];
              return (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {st === 'pass' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    : st === 'escalate' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                  <span className={st === 'pass' ? 'text-[var(--ink-muted)]' : 'text-[var(--ink)]'}>
                    {d}{results.reason?.[i] ? <span className="text-[var(--ink-faint)]"> — {results.reason[i]}</span> : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </Surface>
      )}
    </div>
  );
}
