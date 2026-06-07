'use client';
// Renders an AI Act validation form (questions), supports autofill, POSTs to the
// shared /api/validate, and shows a light OpenAI-style results panel. Optionally
// persists the result onto an AISystem (merged by FormCode).
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import AutoFill from '@/components/AutoFill';
import { Surface, AccentButton, Spinner, EmptyState } from './ui';
import { cn } from '@/lib/utils';

function Segmented({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={cn('rounded-md px-3 py-1 text-sm font-medium transition-colors', value === o ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-400 hover:text-neutral-600')}>
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
            className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', arr.includes(o) ? 'border-[#10A37F] bg-[#10A37F]/10 text-[#10A37F]' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300')}>
            {o}
          </button>
        ))}
      </div>
    );
  }
  if (q.type === 'NUMERIC') {
    return <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      className="w-40 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:border-[#10A37F] focus:outline-none focus:ring-1 focus:ring-[#10A37F]" />;
  }
  if (q.type === 'TEXT') {
    return <input value={value ?? ''} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm focus:border-[#10A37F] focus:outline-none focus:ring-1 focus:ring-[#10A37F]" />;
  }
  return <Segmented options={q.options || ['yes', 'no']} value={value} onChange={onChange} />;
}

export function LeanValidateFlow({ formCode, systemId, initialResponses, onValidated }: { formCode: string; systemId?: string; initialResponses?: Record<string, string>; onValidated?: (r: any, responses: Record<string, string>) => void }) {
  const [form, setForm] = useState<any>(null);
  const [missing, setMissing] = useState(false);
  const [responses, setResponses] = useState<Record<string, string>>(initialResponses || {});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/ai-act/forms?code=${formCode}`).then(async (r) => {
      if (r.ok) { const f = await r.json(); setForm(JSON.parse(f.FormText)); }
      else setMissing(true);
    });
  }, [formCode]);

  const formFields = useMemo(() => {
    if (!form) return {};
    return Object.fromEntries(form.questions.map((q: any) => [q.id, { id: q.id, type: q.type, question: q.text, value: responses[q.id] }]));
  }, [form, responses]);

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

  const overall = results ? results.passed.every(Boolean) : null;

  return (
    <div className="space-y-5">
      <Surface className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <span className="text-sm text-neutral-500">{answered}/{form.questions.length} answered</span>
          <AutoFill formFields={formFields} onAutofill={(vals: Record<string, any>) => setResponses((r) => ({ ...r, ...Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v)])) }))} />
        </div>
        <div className="space-y-5">
          {form.questions.map((q: any) => (
            <div key={q.id} className="flex flex-col gap-2.5 border-b border-neutral-100 pb-5 last:border-0 last:pb-0">
              <div>
                <p className="text-sm text-neutral-700">{q.text}</p>
                {q.reference && <p className="mt-0.5 text-xs text-neutral-400">{q.reference}</p>}
              </div>
              <Field q={q} value={responses[q.id]} onChange={(v) => setResponses({ ...responses, [q.id]: v })} />
            </div>
          ))}
        </div>
        <div className="mt-6">
          <AccentButton onClick={validate} disabled={loading || answered === 0}>{loading ? <Spinner /> : <ShieldCheck className="h-4 w-4" />} Validate</AccentButton>
        </div>
      </Surface>

      {results && (
        <Surface className={cn('p-6', overall ? 'border-emerald-200' : 'border-amber-200')}>
          <p className={cn('mb-4 flex items-center gap-2 text-sm font-semibold', overall ? 'text-emerald-700' : 'text-amber-700')}>
            {overall ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            {overall ? 'All requirements satisfied' : 'Issues found — see below'}
          </p>
          <ul className="space-y-2">
            {results.description.map((d: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                {results.passed[i] ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />}
                <span className={results.passed[i] ? 'text-neutral-600' : 'text-neutral-800'}>{d}</span>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}
