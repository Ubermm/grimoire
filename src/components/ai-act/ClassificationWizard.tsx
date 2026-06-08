'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { CLASSIFY_FORM } from '@/lib/ai-act/classify-form';
import { Surface, AccentButton, GhostButton, Spinner, PageHeader } from './ui';
import { RiskBadge } from './RiskBadge';
import { cn } from '@/lib/utils';

const GROUPS: { title: string; ids: string[] }[] = [
  { title: 'Scope', ids: ['q1'] },
  { title: 'Prohibited practices (Article 5)', ids: ['q2', 'q3', 'q4', 'q5', 'q6', 'q7'] },
  { title: 'General-purpose AI models', ids: ['q8', 'q9'] },
  { title: 'High-risk (Article 6 / Annex III)', ids: ['q10', 'q11', 'q12'] },
  { title: 'Transparency (Article 50)', ids: ['q13'] },
  { title: 'High-risk area (for the record)', ids: ['domains'] },
];

function Segmented({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex w-fit gap-0.5 rounded-full border border-[var(--line-strong)] bg-black/[0.03] p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'rounded-full px-3.5 py-1 text-sm font-medium transition-colors',
            value === opt ? 'bg-[var(--surface)] text-[var(--ink)] shadow-sm' : 'text-[var(--ink-faint)] hover:text-[var(--ink-muted)]'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function CheckChips({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={cn(
            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            value.includes(o) ? 'border-[var(--acc)] bg-[var(--acc)]/10 text-[var(--acc)]' : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function ClassificationWizard({ systemId, systemName }: { systemId?: string; systemName?: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [name, setName] = useState(systemName || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const questions = useMemo(() => Object.fromEntries(CLASSIFY_FORM.questions.map((q) => [q.id, q])), []);
  const selectQs = CLASSIFY_FORM.questions.filter((q) => q.type === 'SELECT');
  const answeredCount = selectQs.filter((q) => answers[q.id]).length;
  const allAnswered = answeredCount === selectQs.length && (systemId || name.trim());

  const classify = async () => {
    setLoading(true);
    // serialize CHECKBOX answers (arrays) to comma strings for the validate contract
    const responses: Record<string, string> = {};
    for (const [k, v] of Object.entries(answers)) responses[k] = Array.isArray(v) ? v.join(',') : v;
    const res = await fetch('/api/ai-act/classify', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses, systemId, name }),
    });
    setLoading(false);
    if (res.ok) setResult(await res.json());
  };

  if (result) {
    const cls = result.classification;
    return (
      <Surface className="p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-[var(--acc)]" />
          <h2 className="text-xl font-semibold text-neutral-900">Classification complete</h2>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm text-neutral-500">Risk level:</span>
          <RiskBadge level={cls.riskLevel} className="text-sm" />
          {cls.isGPAI && <span className="rounded bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-600">GPAI</span>}
        </div>
        <div className="mt-5 rounded-lg border border-neutral-100 bg-neutral-50/60 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">Basis (formally derived)</p>
          <ul className="space-y-1.5 text-sm text-neutral-600">
            {cls.basis.map((b: string, i: number) => <li key={i} className="flex gap-2"><span className="text-[var(--acc)]">•</span>{b}</li>)}
          </ul>
        </div>
        {cls.article50Obligations?.length > 0 && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/40 p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-blue-500"><AlertCircle className="h-3.5 w-3.5" /> Article 50 obligations</p>
            <ul className="space-y-1.5 text-sm text-neutral-600">
              {cls.article50Obligations.map((o: string, i: number) => <li key={i} className="flex gap-2"><span className="text-blue-500">•</span>{o}</li>)}
            </ul>
          </div>
        )}
        <div className="mt-7 flex gap-2">
          <Link href={`/ai-act/registry/${result.system._id}`}><AccentButton>Open system dossier <ArrowRight className="h-4 w-4" /></AccentButton></Link>
          <GhostButton onClick={() => { setResult(null); setAnswers({}); }}>Classify another</GhostButton>
        </div>
      </Surface>
    );
  }

  return (
    <>
      <PageHeader title="Risk classification" subtitle="Answer the screening questions. The verdict is computed by a Prolog program — deterministic and auditable, not an LLM opinion." />
      {!systemId && (
        <Surface className="mb-6 p-5">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">System name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name the AI system you're classifying"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-[var(--acc)] focus:outline-none focus:ring-1 focus:ring-[var(--acc)]"
          />
        </Surface>
      )}

      <div className="space-y-5">
        {GROUPS.map((g) => (
          <Surface key={g.title} className="p-6">
            <p className="mb-4 text-sm font-semibold text-neutral-900">{g.title}</p>
            <div className="space-y-5">
              {g.ids.map((id) => {
                const q = questions[id];
                if (!q) return null;
                return (
                  <div key={id} className="flex flex-col gap-2.5 border-b border-neutral-100 pb-5 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm text-neutral-700">{q.text}</p>
                      {q.reference && <p className="mt-0.5 text-xs text-neutral-400">{q.reference}</p>}
                    </div>
                    {q.type === 'CHECKBOX' ? (
                      <CheckChips options={q.options || []} value={answers[id] || []} onChange={(v) => setAnswers({ ...answers, [id]: v })} />
                    ) : (
                      <Segmented options={q.options || []} value={answers[id]} onChange={(v) => setAnswers({ ...answers, [id]: v })} />
                    )}
                  </div>
                );
              })}
            </div>
          </Surface>
        ))}
      </div>

      <div className="sticky bottom-4 mt-6 flex items-center justify-between rounded-xl border border-neutral-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
        <span className="text-sm text-neutral-500">{answeredCount}/{selectQs.length} answered</span>
        <AccentButton onClick={classify} disabled={!allAnswered || loading}>
          {loading ? <Spinner /> : null} Classify
        </AccentButton>
      </div>
    </>
  );
}
