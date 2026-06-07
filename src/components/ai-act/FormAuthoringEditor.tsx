'use client';
// Human-editable view of an LLM-generated validation form. Every part is editable:
// questions, Prolog facts, validation rules, and queries.
import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { Surface, AccentButton, Spinner } from './ui';

const inp = 'w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm focus:border-[#10A37F] focus:outline-none focus:ring-1 focus:ring-[#10A37F]';
const mono = inp + ' font-mono';

function Section({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd: () => void }) {
  return (
    <Surface className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-50"><Plus className="h-3.5 w-3.5" /> Add</button>
      </div>
      <div className="space-y-3">{children}</div>
    </Surface>
  );
}

function Row({ onDelete, children }: { onDelete: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-100 bg-neutral-50/40 p-3">
      <div className="space-y-2">{children}</div>
      <div className="mt-2 flex justify-end">
        <button onClick={onDelete} className="rounded p-1 text-neutral-300 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}

export function FormAuthoringEditor({ initialForm, formCode, regCode, onSaved }: { initialForm: any; formCode: string; regCode?: string; onSaved?: () => void }) {
  const [form, setForm] = useState<any>(initialForm);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const upd = (key: string, idx: number, patch: any) => setForm((f: any) => ({ ...f, [key]: f[key].map((it: any, i: number) => (i === idx ? { ...it, ...patch } : it)) }));
  const add = (key: string, blank: any) => setForm((f: any) => ({ ...f, [key]: [...(f[key] || []), blank] }));
  const del = (key: string, idx: number) => setForm((f: any) => ({ ...f, [key]: f[key].filter((_: any, i: number) => i !== idx) }));

  const save = async () => {
    setSaving(true);
    await fetch('/api/ai-act/forms', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ FormCode: formCode, RegCode: regCode, form, generatedByLLM: false }),
    });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); onSaved?.();
  };

  return (
    <div className="space-y-5">
      <Section title="Questions" onAdd={() => add('questions', { id: `q${(form.questions?.length || 0) + 1}`, type: 'SELECT', text: '', options: ['yes', 'no'], reference: '' })}>
        {(form.questions || []).map((q: any, i: number) => (
          <Row key={i} onDelete={() => del('questions', i)}>
            <div className="flex gap-2">
              <input className={inp + ' w-20'} value={q.id} onChange={(e) => upd('questions', i, { id: e.target.value })} placeholder="id" />
              <select className={inp + ' w-32'} value={q.type} onChange={(e) => upd('questions', i, { type: e.target.value })}>
                {['SELECT', 'CHECKBOX', 'NUMERIC', 'TEXT'].map((t) => <option key={t}>{t}</option>)}
              </select>
              <input className={inp} value={q.reference || ''} onChange={(e) => upd('questions', i, { reference: e.target.value })} placeholder="reference (Art. 50(1))" />
            </div>
            <textarea className={inp} rows={2} value={q.text} onChange={(e) => upd('questions', i, { text: e.target.value })} placeholder="question text" />
            <input className={inp} value={(q.options || []).join(', ')} onChange={(e) => upd('questions', i, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} placeholder="options (comma-separated)" />
          </Row>
        ))}
      </Section>

      <Section title="Facts (Prolog)" onAdd={() => add('facts', { template: '', question_id: '', description: '' })}>
        {(form.facts || []).map((f: any, i: number) => (
          <Row key={i} onDelete={() => del('facts', i)}>
            <input className={mono} value={f.template} onChange={(e) => upd('facts', i, { template: e.target.value })} placeholder="fact({1})." />
            <div className="flex gap-2">
              <input className={inp + ' w-28'} value={f.question_id} onChange={(e) => upd('facts', i, { question_id: e.target.value })} placeholder="q1" />
              <input className={inp} value={f.description} onChange={(e) => upd('facts', i, { description: e.target.value })} placeholder="description" />
            </div>
          </Row>
        ))}
      </Section>

      <Section title="Validation rules (Prolog)" onAdd={() => add('validations', { rule: '', description: '', operators_used: [] })}>
        {(form.validations || []).map((v: any, i: number) => (
          <Row key={i} onDelete={() => del('validations', i)}>
            <textarea className={mono} rows={2} value={v.rule} onChange={(e) => upd('validations', i, { rule: e.target.value })} placeholder="rule(V) :- fact(V), V == 'yes'." />
            <input className={inp} value={v.description} onChange={(e) => upd('validations', i, { description: e.target.value })} placeholder="description" />
          </Row>
        ))}
      </Section>

      <Section title="Queries" onAdd={() => add('queries', { query: '', description: '', validation_rule: '' })}>
        {(form.queries || []).map((qu: any, i: number) => (
          <Row key={i} onDelete={() => del('queries', i)}>
            <div className="flex gap-2">
              <input className={mono} value={qu.query} onChange={(e) => upd('queries', i, { query: e.target.value })} placeholder="?- rule({1})." />
              <input className={inp + ' w-40'} value={qu.validation_rule} onChange={(e) => upd('queries', i, { validation_rule: e.target.value })} placeholder="rule name" />
            </div>
            <input className={inp} value={qu.description} onChange={(e) => upd('queries', i, { description: e.target.value })} placeholder="what compliant looks like" />
          </Row>
        ))}
      </Section>

      <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-xl border border-neutral-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
        {saved && <span className="text-sm text-emerald-600">Saved ✓</span>}
        <AccentButton onClick={save} disabled={saving}>{saving ? <Spinner /> : <Save className="h-4 w-4" />} Save form</AccentButton>
      </div>
    </div>
  );
}
