'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Spinner } from '@/components/ai-act/ui';
import { LeanValidateFlow } from '@/components/ai-act/LeanValidateFlow';

function Inner() {
  const systemId = useSearchParams().get('system') || undefined;
  return (
    <>
      <PageHeader title="Article 50 — Transparency obligations" subtitle="Disclosure of AI interaction, machine-readable marking of synthetic content, and deep-fake labelling. Answer 'Not applicable' where an obligation does not apply." />
      <LeanValidateFlow formCode="AIACT_ART_50" systemId={systemId} />
    </>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>}><Inner /></Suspense>;
}
