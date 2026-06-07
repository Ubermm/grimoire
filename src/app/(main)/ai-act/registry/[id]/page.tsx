'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
      <Link href="/ai-act/registry" className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-800">
        <ArrowLeft className="h-4 w-4" /> Registry
      </Link>
      {missing ? (
        <p className="text-sm text-neutral-500">System not found.</p>
      ) : !system ? (
        <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>
      ) : (
        <SystemDossier system={system} />
      )}
    </>
  );
}
