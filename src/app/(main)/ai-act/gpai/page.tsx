'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Spinner } from '@/components/ai-act/ui';
import { GpaiModule } from '@/components/ai-act/GpaiModule';

function Inner() {
  const systemId = useSearchParams().get('system') || undefined;
  return (
    <>
      <PageHeader title="GPAI provider obligations" subtitle="Article 53 obligations for providers of general-purpose AI models, across the three Code of Practice pillars." />
      <GpaiModule systemId={systemId} />
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>}><Inner /></Suspense>;
}
