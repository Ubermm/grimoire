'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ClassificationWizard } from '@/components/ai-act/ClassificationWizard';
import { Spinner } from '@/components/ai-act/ui';

function ClassifyInner() {
  const sp = useSearchParams();
  const systemId = sp.get('system') || undefined;
  return <ClassificationWizard systemId={systemId} />;
}

export default function ClassifyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-neutral-400" /></div>}>
      <ClassifyInner />
    </Suspense>
  );
}
