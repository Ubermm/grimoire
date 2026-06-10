'use client';
// Audit-level context dossier + bulk autofill. The auditor pastes text / uploads
// documents once; "Auto-fill audit" deduces answers across EVERY subsection with
// confidence + source citations, which the auditor then reviews and confirms.
import { useState } from 'react';
import { Paperclip, FileText, X } from 'lucide-react';
import { CollapsibleSection, AccentButton, Spinner } from '@/components/module/ui';
import { generateUUID } from '@/lib/utils';

type Filled = { responses: Record<string, string>; meta: Record<string, any> };

export function AuditContextPanel({
  subsections,
  dossier,
  onDossierChange,
  onFilled,
}: {
  subsections: any[];
  dossier?: { text?: string; files?: any[] };
  onDossierChange: (d: { text: string; files: any[] }) => void;
  onFilled: (perSub: Filled[]) => void;
}) {
  const [text, setText] = useState(dossier?.text || '');
  const [files, setFiles] = useState<any[]>(dossier?.files || []);
  const [uploading, setUploading] = useState(false);
  const [filling, setFilling] = useState(false);
  const [filledCount, setFilledCount] = useState<number | null>(null);

  const persist = (t: string, fs: any[]) => onDossierChange({ text: t, files: fs });

  const upload = async (e: any) => {
    const list = Array.from((e.target.files || []) as FileList) as File[];
    if (!list.length) return;
    setUploading(true);
    const added: any[] = [];
    for (const file of list) {
      try {
        const fd = new FormData();
        const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
        fd.append('file', new File([file], `${file.name.replace(/\.[^/.]+$/, '')}-${generateUUID().slice(0, 6)}${ext}`, { type: file.type }));
        const r = await fetch('/api/files/upload', { method: 'POST', body: fd });
        if (r.ok) { const d = await r.json(); added.push({ url: d.url, name: d.pathname || file.name, contentType: d.contentType || file.type }); }
      } catch { /* skip */ }
    }
    const next = [...files, ...added];
    setFiles(next); persist(text, next); setUploading(false);
    e.target.value = '';
  };

  const removeFile = (url: string) => { const next = files.filter((f) => f.url !== url); setFiles(next); persist(text, next); };

  const autofill = async () => {
    setFilling(true); setFilledCount(null);
    try {
      const fields: any[] = [];
      const parsed = subsections.map((s) => { try { return typeof s.form === 'string' ? JSON.parse(s.form) : s.form; } catch { return null; } });
      parsed.forEach((f, si) => (f?.questions || []).forEach((q: any) => fields.push({ id: `${si}:${q.id}`, type: q.type, question: q.text, options: q.options })));
      const r = await fetch('/api/audit/autofill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dossier: { text, files }, fields }) });
      const map = r.ok ? await r.json() : {};
      const perSub: Filled[] = subsections.map(() => ({ responses: {}, meta: {} }));
      let count = 0;
      for (const [k, v] of Object.entries<any>(map)) {
        const ci = k.indexOf(':'); if (ci < 0) continue;
        const si = parseInt(k.slice(0, ci), 10); const qid = k.slice(ci + 1);
        if (perSub[si] && v?.value) { perSub[si].responses[qid] = v.value; perSub[si].meta[qid] = { confidence: v.confidence, source: v.source }; count++; }
      }
      onFilled(perSub); setFilledCount(count);
    } catch { setFilledCount(0); }
    setFilling(false);
  };

  const hasContext = !!(text.trim() || files.length);

  return (
    <CollapsibleSection
      defaultOpen={true}
      title={<>Autofill — answer the audit from your documents{hasContext && <span className="font-normal normal-case tracking-normal text-[var(--ink-faint)]"> · ready</span>}</>}
      hint="Upload or paste SOPs, batch records and logs; the engine deduces answers across every section with a source and confidence for you to review. Nothing is accepted without your confirmation."
    >
        <div className="space-y-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={() => persist(text, files)} placeholder="Paste relevant context here…" className="ai-field min-h-[96px] resize-y" />

          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((f) => (
                <span key={f.url} className="font-accent inline-flex items-center gap-1.5 rounded-[2px] border border-[var(--line)] bg-[var(--acc-soft)] px-2.5 py-1 text-xs text-[var(--ink-muted)]">
                  <FileText className="h-3.5 w-3.5" /> {f.name}
                  <button onClick={() => removeFile(f.url)} className="opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <label className="font-accent inline-flex cursor-pointer items-center gap-2 border border-[var(--line-strong)] bg-transparent px-4 py-2 text-[0.78rem] font-medium uppercase tracking-[0.1em] text-[var(--ink-muted)] transition-colors hover:border-[var(--ink)] hover:text-[var(--ink)]">
              {uploading ? <Spinner /> : <Paperclip className="h-4 w-4" />} Attach files
              <input type="file" multiple className="hidden" onChange={upload} />
            </label>
            <AccentButton onClick={autofill} disabled={filling || !hasContext}>{filling ? <Spinner /> : <span aria-hidden>⊢</span>} Auto-fill audit</AccentButton>
            {filledCount != null && <span className="text-sm text-[var(--ink-muted)]">Deduced {filledCount} answer{filledCount === 1 ? '' : 's'} — review &amp; confirm in each section.</span>}
          </div>
        </div>
    </CollapsibleSection>
  );
}
