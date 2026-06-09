'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { SystemDossier } from '@/components/ai-act/SystemDossier';
import { Spinner } from '@/components/ai-act/ui';

export default function SystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [system, setSystem] = useState<any>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch(`/api/ai-act/systems/${id}`).then(async (r) => {
      if (r.ok) setSystem(await r.json());
      else setMissing(true);
    });
  }, [id]);

  return (
    <>
      <Link href="/ai-act/registry" className="font-accent mb-6 inline-flex items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.1em] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]">
        <span aria-hidden>←</span> Registry
      </Link>
      {missing ? (
        <p className="text-sm text-[var(--ink-muted)]">System not found.</p>
      ) : !system ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>
      ) : (
        <SystemDossier system={system} />
      )}
    </>
  );
}
