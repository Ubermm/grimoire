//@ts-nocheck
'use client';
// Light "stats" rebuild of the FDA warning-letter analytics surface. Same engine
// endpoints as before (/api/find, /api/compare, /api/scrape) — only the
// presentation changes: KPI strip, Recharts frequency bars, light Mermaid graphs,
// and an inline new-analysis panel. The old dark ComplianceDashboard is retired.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Search, ArrowRightLeft, Plus, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { generateUUID } from '@/lib/utils';
import { Markdown } from '@/components/markdown';
import MermaidChart from '@/components/MermaidChart';
import {
  PageHeader, Surface, SectionCard, AccentButton, GhostButton, Spinner, EmptyState, Badge,
} from '@/components/module/ui';
import { cn } from '@/lib/utils';

const FrequencyBars = dynamic(() => import('@/components/analytics/FrequencyBars'), {
  ssr: false,
  loading: () => <div className="flex justify-center py-10"><Spinner className="h-5 w-5 text-[var(--ink-faint)]" /></div>,
});

/* --------------------------------------------------------------- KPI card */
function Kpi({ index, label, value }: { index: string; label: string; value: React.ReactNode }) {
  return (
    <Surface className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-accent text-xs uppercase tracking-wide text-[var(--ink-faint)]">{label}</p>
        <span className="font-accent text-[0.68rem] text-[var(--ink-faint)]" aria-hidden>{index}</span>
      </div>
      <p className="font-serif-display serif-oldstyle-nums mt-2 truncate text-3xl font-medium tracking-tight text-[var(--ink)]">{value}</p>
    </Surface>
  );
}

/* ------------------------------------------------------- result renderers */
function CodeChips({ codes }: { codes?: string[] }) {
  if (!codes?.length) return <span className="text-sm text-[var(--ink-faint)]">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {codes.map((c, i) => (
        <span key={`${c}-${i}`} className="font-accent rounded-[2px] bg-[var(--acc-soft)] px-2 py-0.5 text-xs text-[var(--ink-muted)] ring-1 ring-inset ring-[var(--line)]">{c}</span>
      ))}
    </div>
  );
}

function FindResults({ audit }: { audit: any }) {
  if (!audit?.results?.length && !audit?.summary) {
    return <p className="py-10 text-center text-sm text-[var(--ink-faint)]">No results found.</p>;
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">Matching warning letters</p>
        <Badge>{audit.results?.length || 0} found</Badge>
      </div>

      {audit.summary && (
        <Surface className="p-5">
          <p className="font-accent mb-2 text-xs uppercase tracking-wide text-[var(--ink-faint)]">Statistical summary</p>
          <Markdown className="prose prose-sm prose-neutral max-w-none">{audit.summary}</Markdown>
        </Surface>
      )}

      {(audit.cfrVisualization || audit.fdcVisualization) && (
        <div className={cn(audit.cfrVisualization && audit.fdcVisualization && 'grid grid-cols-1 gap-5 lg:grid-cols-2')}>
          {audit.cfrVisualization && <SectionCard title="Co-occurring CFR violations" bodyClassName="bg-[var(--canvas)]"><MermaidChart chart={audit.cfrVisualization} /></SectionCard>}
          {audit.fdcVisualization && <SectionCard title="Co-occurring FD&C violations" bodyClassName="bg-[var(--canvas)]"><MermaidChart chart={audit.fdcVisualization} /></SectionCard>}
        </div>
      )}

      {Array.isArray(audit.results) && audit.results.length > 0 && (
        <div className="space-y-2.5">
          {audit.results.map((r: any, i: number) => (
            <Surface key={`${r._id || r.url || i}`} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-accent text-sm font-medium text-[var(--ink)] hover:underline">
                  {r.title || 'Untitled warning letter'}
                </a>
                <Badge>{r.totalMatches || 0} matches</Badge>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div><p className="font-accent mb-1 text-xs uppercase tracking-wide text-[var(--ink-faint)]">CFR</p><CodeChips codes={r.matchedCfrCodes} /></div>
                <div><p className="font-accent mb-1 text-xs uppercase tracking-wide text-[var(--ink-faint)]">FD&C</p><CodeChips codes={r.matchedFdcCodes} /></div>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareResults({ audit }: { audit: any }) {
  if (!audit?.content) return <p className="py-10 text-center text-sm text-[var(--ink-faint)]">No comparison data.</p>;
  const Letter = ({ label, url, codes }: any) => (
    <Surface className="p-4">
      <p className="font-accent mb-2 text-xs uppercase tracking-wide text-[var(--ink-faint)]">{label}</p>
      {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-[var(--ink)] hover:underline">{url.split('/').pop() || url}</a> : <span className="text-sm text-[var(--ink-faint)]">No document</span>}
      <div className="mt-3 space-y-3">
        <div><p className="font-accent mb-1 text-xs uppercase tracking-wide text-[var(--ink-faint)]">CFR</p><CodeChips codes={codes?.cfrCodes} /></div>
        <div><p className="font-accent mb-1 text-xs uppercase tracking-wide text-[var(--ink-faint)]">FD&C</p><CodeChips codes={codes?.fdcCodes} /></div>
      </div>
    </Surface>
  );
  return (
    <div className="space-y-6">
      <Surface className="p-5">
        <p className="font-accent mb-2 text-xs uppercase tracking-wide text-[var(--ink-faint)]">Comparison analysis</p>
        <Markdown className="prose prose-sm prose-neutral max-w-none">{audit.content}</Markdown>
      </Surface>
      {(audit.cfrVisualization || audit.fdcVisualization) && (
        <div className={cn(audit.cfrVisualization && audit.fdcVisualization && 'grid grid-cols-1 gap-5 lg:grid-cols-2')}>
          {audit.cfrVisualization && <SectionCard title="CFR violations comparison" bodyClassName="bg-[var(--canvas)]"><MermaidChart chart={audit.cfrVisualization} /></SectionCard>}
          {audit.fdcVisualization && <SectionCard title="FD&C violations comparison" bodyClassName="bg-[var(--canvas)]"><MermaidChart chart={audit.fdcVisualization} /></SectionCard>}
        </div>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Letter label="First letter" url={audit.firstUrl} codes={audit.letterACodes} />
        <Letter label="Second letter" url={audit.secondUrl} codes={audit.letterBCodes} />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- segmented */
function Segmented({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const opts = [{ k: 'find', label: 'Find similar' }, { k: 'compare', label: 'Compare letters' }];
  return (
    <div className="inline-flex w-fit border border-[var(--line-strong)]">
      {opts.map((o) => (
        <button key={o.k} type="button" onClick={() => onChange(o.k)}
          className={cn('font-accent px-4 py-1.5 text-[0.78rem] font-medium uppercase tracking-[0.08em] transition-colors', value === o.k ? 'bg-[var(--acc)] text-[var(--acc-contrast)]' : 'text-[var(--ink-faint)] hover:text-[var(--ink)]')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ============================================================ dashboard */
export default function AnalyticsDashboard() {
  const [audits, setAudits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showNew, setShowNew] = useState(false);
  // Scroll the freshly-opened analysis form into view (it renders below the
  // KPI strip, off-screen on smaller viewports). scroll-mt offsets the navbar.
  const newPanelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (showNew) newPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [showNew]);
  const [analysisType, setAnalysisType] = useState('find');
  const [warningLetter, setWarningLetter] = useState('');
  const [warningLetterUrl, setWarningLetterUrl] = useState('');
  const [secondLetter, setSecondLetter] = useState('');
  const [secondLetterUrl, setSecondLetterUrl] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const fetchPreviousAudits = async () => {
    try {
      const [findRes, cmpRes] = await Promise.all([fetch('/api/find'), fetch('/api/compare')]);
      const findData = await findRes.json();
      const cmpData = await cmpRes.json();
      const all = [
        ...(findData.results || []).map((a: any) => ({ ...a, id: a.id || generateUUID(), analysisType: 'find', timestamp: new Date(a.createdAt).toLocaleString() })),
        ...(cmpData.results || []).map((a: any) => ({ ...a, id: a.id || generateUUID(), analysisType: 'compare', timestamp: new Date(a.createdAt).toLocaleString() })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setAudits(all);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchPreviousAudits(); }, []);

  const stats = useMemo(() => {
    const cfr: Record<string, number> = {}, fdc: Record<string, number> = {};
    let letters = 0;
    for (const a of audits) {
      if (a.analysisType !== 'find') continue;
      for (const r of (a.results || [])) {
        letters++;
        for (const c of (r.matchedCfrCodes || [])) cfr[c] = (cfr[c] || 0) + 1;
        for (const c of (r.matchedFdcCodes || [])) fdc[c] = (fdc[c] || 0) + 1;
      }
    }
    const top = (m: Record<string, number>) => Object.entries(m).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);
    const cfrTop = top(cfr);
    return { analyses: audits.length, letters, distinctCfr: Object.keys(cfr).length, topCode: cfrTop[0]?.label || '—', cfrTop, fdcTop: top(fdc) };
  }, [audits]);

  const fetchOne = async (url: string, set: (s: string) => void) => {
    setIsFetching(true); setError('');
    try { const d = await parseOrThrow(await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) })); set(d.content); }
    catch (e) { console.error(e); setError(e?.message || 'Failed to fetch the letter.'); } finally { setIsFetching(false); }
  };
  const fetchBoth = async () => {
    setIsFetching(true); setError('');
    try {
      const [a, b] = await Promise.all([
        fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: warningLetterUrl }) }),
        fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: secondLetterUrl }) }),
      ]);
      setWarningLetter((await parseOrThrow(a)).content); setSecondLetter((await parseOrThrow(b)).content);
    } catch (e) { console.error(e); setError(e?.message || 'Failed to fetch the letters.'); } finally { setIsFetching(false); }
  };

  const reset = () => { setWarningLetter(''); setWarningLetterUrl(''); setSecondLetter(''); setSecondLetterUrl(''); setError(''); };

  // Parse a response defensively: surface the server's JSON error (or status
  // text) instead of crashing on a non-JSON 500 body.
  const parseOrThrow = async (res: Response) => {
    const body = await res.text();
    let d: any = null;
    try { d = JSON.parse(body); } catch { /* non-JSON body */ }
    if (!res.ok) throw new Error(d?.error || body?.slice(0, 200) || `Request failed (${res.status})`);
    if (!d) throw new Error('The server returned an unexpected response.');
    return d;
  };

  const submit = async () => {
    setIsLoading(true); setError('');
    try {
      const id = generateUUID();
      let newAudit: any;
      if (analysisType === 'find') {
        const d = await parseOrThrow(await fetch('/api/find', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: warningLetter }) }));
        newAudit = { _id: d._id, id, url: warningLetterUrl, results: d.results, summary: d.summary, cfrVisualization: d.cfrVisualization, fdcVisualization: d.fdcVisualization, analysisType: 'find', timestamp: new Date().toLocaleString() };
      } else {
        const d = await parseOrThrow(await fetch('/api/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstLetter: warningLetter, secondLetter, firstUrl: warningLetterUrl, secondUrl: secondLetterUrl }) }));
        newAudit = { _id: d._id, id, firstUrl: warningLetterUrl, secondUrl: secondLetterUrl, content: d.content, cfrVisualization: d.cfrVisualization, fdcVisualization: d.fdcVisualization, letterACodes: d.letterACodes, letterBCodes: d.letterBCodes, analysisType: 'compare', timestamp: new Date().toLocaleString() };
      }
      setAudits((p) => [newAudit, ...p]);
      setExpanded((p) => new Set(p).add(id));
      setShowNew(false); reset();
    } catch (e) { console.error(e); setError(e?.message || 'An unexpected error occurred. Please try again.'); }
    finally { setIsLoading(false); }
  };

  const remove = async (a: any) => {
    setAudits((p) => p.filter((x) => x._id !== a._id));
    try { await fetch(`/api/${a.analysisType}?id=${a._id}`, { method: 'DELETE' }); } catch (e) { console.error(e); }
  };
  const toggle = (id: string) => setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <>
      <PageHeader
        eyebrow="FDA 21 CFR · Warning letters"
        title="Compliance analytics"
        subtitle="Find related FDA warning letters, compare two letters, and see which CFR & FD&C citations recur across enforcement."
        action={<AccentButton onClick={() => setShowNew((s) => !s)}><Plus className="h-4 w-4" /> New analysis</AccentButton>}
      />

      {/* KPI strip */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi index="01" label="Analyses" value={stats.analyses} />
        <Kpi index="02" label="Letters matched" value={stats.letters} />
        <Kpi index="03" label="Distinct CFR codes" value={stats.distinctCfr} />
        <Kpi index="04" label="Top-cited code" value={<span className="text-xl">{stats.topCode}</span>} />
      </div>

      {/* new analysis panel */}
      {showNew && (
        <div ref={newPanelRef} className="scroll-mt-20">
        <Surface className="mb-8 p-6">
          <div className="mb-5 flex items-center justify-between">
            <Segmented value={analysisType} onChange={(v) => { setAnalysisType(v); reset(); }} />
            <GhostButton onClick={() => { setShowNew(false); reset(); }}>Cancel</GhostButton>
          </div>

          {analysisType === 'find' ? (
            <div className="space-y-3">
              <label className="font-accent block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Warning letter URL</label>
              <div className="flex gap-2">
                <input value={warningLetterUrl} onChange={(e) => setWarningLetterUrl(e.target.value)} placeholder="Paste an FDA warning-letter URL" className="ai-field" />
                <AccentButton onClick={() => fetchOne(warningLetterUrl, setWarningLetter)} disabled={isFetching || !warningLetterUrl.trim()}>{isFetching ? <Spinner /> : 'Fetch'}</AccentButton>
              </div>
              <label className="font-accent block text-xs font-medium uppercase tracking-wide text-[var(--ink-muted)]">Or paste content</label>
              <textarea value={warningLetter} onChange={(e) => setWarningLetter(e.target.value)} placeholder="Paste warning-letter text here…" className="ai-field min-h-[180px] resize-y" />
              <AccentButton onClick={submit} disabled={isLoading || !warningLetter.trim()} className="w-full">{isLoading ? <><Spinner /> Analyzing — ~10s</> : <><Search className="h-4 w-4" /> Find similar letters</>}</AccentButton>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={warningLetterUrl} onChange={(e) => setWarningLetterUrl(e.target.value)} placeholder="First letter URL" className="ai-field" />
                <input value={secondLetterUrl} onChange={(e) => setSecondLetterUrl(e.target.value)} placeholder="Second letter URL" className="ai-field" />
              </div>
              <GhostButton onClick={fetchBoth} disabled={isFetching || !warningLetterUrl.trim() || !secondLetterUrl.trim()}>{isFetching ? <Spinner /> : 'Fetch both letters'}</GhostButton>
              <div className="grid gap-3 sm:grid-cols-2">
                <textarea value={warningLetter} onChange={(e) => setWarningLetter(e.target.value)} placeholder="First letter content…" className="ai-field min-h-[150px] resize-y" />
                <textarea value={secondLetter} onChange={(e) => setSecondLetter(e.target.value)} placeholder="Second letter content…" className="ai-field min-h-[150px] resize-y" />
              </div>
              <AccentButton onClick={submit} disabled={isLoading || !warningLetter.trim() || !secondLetter.trim()} className="w-full">{isLoading ? <><Spinner /> Writing the comparison — ~20s</> : <><ArrowRightLeft className="h-4 w-4" /> Compare letters</>}</AccentButton>
            </div>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Surface>
        </div>
      )}

      {/* frequency charts */}
      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <SectionCard title="Top cited CFR codes" subtitle="Frequency across analyzed warning letters">
          <FrequencyBars data={stats.cfrTop} />
        </SectionCard>
        <SectionCard title="Top cited FD&C codes" subtitle="Frequency across analyzed warning letters">
          <FrequencyBars data={stats.fdcTop} />
        </SectionCard>
      </div>

      {/* analyses list */}
      <h2 className="font-accent mb-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">Recent analyses</h2>
      {audits.length === 0 ? (
        <EmptyState title="No analyses yet" hint="Run a find-similar or compare analysis to populate the dashboard." action={<AccentButton onClick={() => setShowNew(true)}><Plus className="h-4 w-4" /> New analysis</AccentButton>} />
      ) : (
        <div className="space-y-3">
          {audits.map((a, i) => (
            <Surface key={a.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-accent text-[0.78rem] text-[var(--ink-faint)]" aria-hidden>{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="font-accent text-sm font-medium capitalize text-[var(--ink)]">{a.analysisType === 'find' ? 'Find similar' : 'Compare'} analysis</p>
                    <p className="text-xs text-[var(--ink-faint)]">{a.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => remove(a)} className="p-2 text-[var(--ink-faint)] hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  <button onClick={() => toggle(a.id)} className="p-2 text-[var(--ink-faint)] hover:bg-black/5 hover:text-[var(--ink)]">{expanded.has(a.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>
                </div>
              </div>
              {expanded.has(a.id) && <div className="mt-5 border-t border-[var(--line)] pt-5">{a.analysisType === 'find' ? <FindResults audit={a} /> : <CompareResults audit={a} />}</div>}
            </Surface>
          ))}
        </div>
      )}
    </>
  );
}
