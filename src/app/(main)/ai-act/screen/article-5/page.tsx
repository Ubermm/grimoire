'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Spinner } from '@/components/ai-act/ui';
import { LeanValidateFlow } from '@/components/ai-act/LeanValidateFlow';

function Inner() {
  const systemId = useSearchParams().get('system') || undefined;
  return (
    <>
      <PageHeader title="Article 5 — Prohibited practices screening" subtitle="A failed check flags a prohibited AI practice. Such a system may not be placed on the market or put into service." />
      <LeanValidateFlow formCode="AIACT_ART_5" systemId={systemId} />
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>}><Inner /></Suspense>;
}
