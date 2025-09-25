//@ts-nocheck
import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import INDSubmissionComponent from '@/components/INDSubmission';

export default async function INDCreationPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <INDSubmissionComponent />
      </Suspense>
    </div>
  );
}

export const metadata = {
  title: 'IND Creation | Grimoire',
  description: 'Create and manage FDA IND submissions',
};
