'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitCompare } from 'lucide-react';
import { PageHeader, Surface, AccentButton, Spinner, EmptyState } from '@/components/ai-act/ui';
import { CrossRegulationView } from '@/components/ai-act/CrossRegulationView';

function Inner() {
  const preSystem = useSearchParams().get('system') || '';
  const [systems, setSystems] = useState<any[]>([]);
  const [systemId, setSystemId] = useState(preSystem);
  const [profile, setProfile] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetch('/api/ai-act/systems').then(async (r) => { if (r.ok) { const d = await r.json(); setSystems(d); if (!preSystem && d[0]) setSystemId(d[0]._id); } }); }, []);

  const run = async () => {
    setLoading(true); setError(''); setResult(null);
    const body = systemId ? { systemId } : { profile };
    const res = await fetch('/api/ai-act/cross-regulation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setLoading(false);
    if (res.ok) setResult(await res.json());
    else setError(`Analysis failed (${res.status}).`);
  };

  return (
    <>
      <PageHeader title="Cross-regulation analysis" subtitle="Where FDA 21 CFR and the EU AI Act overlap for a given system — and what's unique to each." />
      <Surface className="mb-6 p-5">
        {systems.length > 0 && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">System</label>
            <select value={systemId} onChange={(e) => setSystemId(e.target.value)} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[#10A37F] focus:outline-none">
              <option value="">— describe manually below —</option>
              {systems.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        )}
        {!systemId && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">System profile</label>
            <textarea value={profile} onChange={(e) => setProfile(e.target.value)} rows={3} placeholder="e.g. AI-powered diagnostic imaging tool used as a medical device…" className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-[#10A37F] focus:outline-none" />
          </div>
        )}
        <AccentButton onClick={run} disabled={loading || (!systemId && !profile.trim())}>{loading ? <Spinner /> : <GitCompare className="h-4 w-4" />} Analyse overlap</AccentButton>
        {error && <p className="mt-3 text-sm text-amber-600">{error}</p>}
      </Surface>

      {result ? <CrossRegulationView result={result} /> : <EmptyState title="No analysis yet" hint="Pick a system (or describe one) and run the overlap analysis." />}
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>}><Inner /></Suspense>;
}
