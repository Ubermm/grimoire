'use client';
// FDA per-subsection validation flow (light, OpenAI/lyzr-style). Resolves a CFR
// code -> FormCode -> form schema, renders the questions, supports AutoFill,
// POSTs to the shared /api/validate, and shows a light results panel. An optional
// "deep validation" pass pulls matching FDA warning letters (/api/topk) and
// generates hindsight questions (/api/generate), then validates those too.
// Mirrors the AI Act LeanValidateFlow; the engine APIs are untouched.
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Sparkles, RotateCcw } from 'lucide-react';
import AutoFill from '@/components/AutoFill';
import { Surface, AccentButton, GhostButton, Spinner, EmptyState } from '@/components/module/ui';
import { cn } from '@/lib/utils';

type Responses = Record<string, string>;
type Result = { passed: boolean[]; description: string[] };

function Segmented({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex w-fit flex-wrap gap-0.5 rounded-full border border-[var(--line-strong)] bg-black/[0.03] p-1">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={cn('rounded-full px-3.5 py-1 text-sm font-medium transition-colors', value === o ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-faint)] hover:text-[var(--ink-muted)]')}>
          {o}
        </button>
      ))}
    </div>
  );
}

function QuestionField({ q, value, onChange }: { q: any; value: any; onChange: (v: any) => void }) {
  if (q.type === 'CHECKBOX') {
    const arr: string[] = value ? String(value).split(',').filter(Boolean) : [];
    const toggle = (o: string) => onChange((arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]).join(','));
    return (
      <div className="flex flex-wrap gap-2">
        {(q.options || []).map((o: string) => (
          <button key={o} type="button" onClick={() => toggle(o)}
            className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', arr.includes(o) ? 'border-[var(--acc)] bg-[var(--acc)]/10 text-[var(--acc)]' : 'border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-neutral-300')}>
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === 'NUMERIC') {
    return <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ai-field w-40" />;
  }
  if (q.type === 'DATE') {
    return <input type="date" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ai-field w-52" />;
  }
  if (q.type === 'TIME') {
    return <input type="time" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ai-field w-40" />;
  }
  if (q.type === 'TEXT') {
    return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="ai-field" />;
  }
  return <Segmented options={q.options || ['true', 'false']} value={value} onChange={onChange} />;
}

function ResultsPanel({ results }: { results: Result }) {
  const overall = results.passed.every(Boolean);
  return (
    <Surface className={cn('p-6', overall ? 'border-emerald-200' : 'border-amber-200')}>
      <p className={cn('mb-4 flex items-center gap-2 text-sm font-semibold', overall ? 'text-emerald-700' : 'text-amber-700')}>
        {overall ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
        {overall ? 'All requirements satisfied' : 'Issues found — see below'}
      </p>
      <ul className="space-y-2">
        {results.description.map((d, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            {results.passed[i] ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
            <span className={results.passed[i] ? 'text-[var(--ink-muted)]' : 'text-[var(--ink)]'}>{d}</span>
          </li>
        ))}
      </ul>
    </Surface>
  );
}

// A self-contained question set: renders fields, autofill, validate -> results.
function QuestionSet({
  cfrCode,
  form,
  initial,
  onValidated,
  ctaLabel = 'Validate',
}: {
  cfrCode: string;
  form: any;
  initial?: Responses;
  onValidated?: (r: Result, responses: Responses) => void;
  ctaLabel?: string;
}) {
  // Default the yes/no (segmented) questions to their affirmative option so the
  // form starts in a sensible, fully-answered state; other field types stay blank.
  const buildDefaults = (): Responses => {
    const out: Responses = {};
    for (const q of form.questions) {
      if (['CHECKBOX', 'NUMERIC', 'DATE', 'TIME', 'TEXT'].includes(q.type)) continue;
      const opts = q.options && q.options.length ? q.options : ['true', 'false'];
      out[q.id] = opts.find((o: string) => o.toLowerCase() === 'yes') || opts[0];
    }
    return out;
  };
  const [responses, setResponses] = useState<Responses>(() => ({ ...buildDefaults(), ...(initial || {}) }));
  const [results, setResults] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => { setResponses(buildDefaults()); setResults(null); };

  const formFields = useMemo(
    () => Object.fromEntries(form.questions.map((q: any) => [q.id, { id: q.id, type: q.type, question: q.text, value: responses[q.id] }])),
    [form, responses]
  );
  const answered = form.questions.filter((q: any) => responses[q.id] != null && responses[q.id] !== '').length;

  const validate = async () => {
    setLoading(true);
    const res = await fetch('/api/validate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cfrCode, responses, form }),
    });
    if (res.ok) {
      const data: Result = await res.json();
      setResults(data);
      onValidated?.(data, responses);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <Surface className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm text-[var(--ink-faint)]">{answered}/{form.questions.length} answered</span>
          <AutoFill formFields={formFields} onAutofill={(vals: Record<string, any>) => setResponses((r) => ({ ...r, ...Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])) }))} />
        </div>
        <div className="space-y-5">
          {form.questions.map((q: any) => (
            <div key={q.id} className="flex flex-col gap-2.5 border-b border-[var(--line)] pb-5 last:border-0 last:pb-0">
              <div>
                <p className="text-sm text-[var(--ink)]">{q.text}</p>
                {(q.reference || q.cfr_reference) && <p className="mt-0.5 text-xs text-[var(--ink-faint)]">{q.reference || q.cfr_reference}</p>}
              </div>
              <QuestionField q={q} value={responses[q.id]} onChange={(v) => setResponses({ ...responses, [q.id]: v })} />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2">
          <AccentButton onClick={validate} disabled={loading || answered === 0}>{loading ? <Spinner /> : <ShieldCheck className="h-4 w-4" />} {ctaLabel}</AccentButton>
          <GhostButton onClick={reset} disabled={loading}><RotateCcw className="h-4 w-4" /> Reset</GhostButton>
        </div>
      </Surface>
      {results && <ResultsPanel results={results} />}
    </div>
  );
}

export function AuditValidateFlow({
  cfrCode,
  initialResponses,
  initialDeepResponses,
  onValidated,
  onDeepValidated,
}: {
  cfrCode: string;
  initialResponses?: Responses;
  initialDeepResponses?: Responses;
  onValidated?: (r: Result, responses: Responses) => void;
  onDeepValidated?: (r: Result, responses: Responses) => void;
}) {
  const [form, setForm] = useState<any>(null);
  const [missing, setMissing] = useState(false);

  // Deep (warning-letter-driven) pass.
  const [deepForm, setDeepForm] = useState<any>(null);
  const [deepLoading, setDeepLoading] = useState(false);
  const [deepError, setDeepError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setForm(null); setMissing(false); setDeepForm(null); setDeepError(null);
      try {
        const regRes = await fetch(`/api/regulations?code=${encodeURIComponent(cfrCode)}`);
        if (!regRes.ok) { if (!cancelled) setMissing(true); return; }
        const reg = await regRes.json();
        if (!reg.FormCode) { if (!cancelled) setMissing(true); return; }
        const formRes = await fetch(`/api/forms?code=${encodeURIComponent(reg.FormCode)}`);
        if (!formRes.ok) { if (!cancelled) setMissing(true); return; }
        const f = await formRes.json();
        // FDA forms store FormText as an object; AI Act stores it as a JSON string.
        const parsed = typeof f.FormText === 'string' ? JSON.parse(f.FormText) : f.FormText;
        if (!parsed?.questions?.length) { if (!cancelled) setMissing(true); return; }
        if (!cancelled) setForm(parsed);
      } catch {
        if (!cancelled) setMissing(true);
      }
    })();
    return () => { cancelled = true; };
  }, [cfrCode]);

  const runDeep = async () => {
    if (!form) return;
    setDeepLoading(true); setDeepError(null);
    try {
      // Pass the full CFR code (e.g. "21 CFR 211.22") — warning letters are stored
      // and matched on that prefix, same as the original audit flow.
      const topk = await (await fetch('/api/topk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cfrSubsection: cfrCode }),
      })).json();
      const letters = topk.warningLetters || [];
      if (letters.length < 3) { setDeepError('No deep checks for this code — there aren’t enough FDA warning letters citing it. The base validation above stands on its own.'); setDeepLoading(false); return; }
      const gen = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cfrSubsection: cfrCode, warningLetters: letters, form: JSON.stringify(form) }),
      });
      if (!gen.ok) { setDeepError('Could not generate deep validation questions.'); setDeepLoading(false); return; }
      const data = await gen.json();
      const df = data.form || data;
      if (!df?.questions?.length) { setDeepError('No additional questions were generated for this code.'); setDeepLoading(false); return; }
      setDeepForm(df);
    } catch {
      setDeepError('Deep validation failed. Please try again.');
    }
    setDeepLoading(false);
  };

  if (missing) return <EmptyState title="No validation form for this code" hint={`No seeded form is mapped to ${cfrCode}. Author one in the AI Act rule-authoring tool or pick a code that has a form.`} />;
  if (!form) return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-[var(--ink-faint)]" /></div>;

  return (
    <div className="space-y-8">
      <QuestionSet cfrCode={cfrCode} form={form} initial={initialResponses} onValidated={onValidated} />

      {/* Deep validation — hindsight questions derived from real FDA warning letters. */}
      <div className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-black/[0.015] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-accent flex items-center gap-2 text-sm font-semibold text-[var(--ink)]"><Sparkles className="h-4 w-4" /> Deep validation <span className="font-normal text-[var(--ink-faint)]">· optional</span></p>
            <p className="mt-1 max-w-xl text-sm text-[var(--ink-muted)]">Generate extra checks from real FDA warning letters that cite this CFR code, to catch issues the base form might miss. Only available for codes with enough cited letters.</p>
          </div>
          {!deepForm && <GhostButton onClick={runDeep} disabled={deepLoading}>{deepLoading ? <Spinner /> : <Sparkles className="h-4 w-4" />} Generate checks</GhostButton>}
        </div>
        {deepError && <p className="mt-4 text-sm text-[var(--ink-muted)]">{deepError}</p>}
        {deepForm && (
          <div className="mt-6">
            <QuestionSet cfrCode={cfrCode} form={deepForm} initial={initialDeepResponses} onValidated={onDeepValidated} ctaLabel="Validate deep checks" />
          </div>
        )}
      </div>
    </div>
  );
}
