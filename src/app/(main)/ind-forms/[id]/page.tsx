'use client';

import { useEffect, Suspense, useState } from 'react';
import { toast } from 'sonner';
import INDSubmissionComponent from '@/components/INDSubmission';

export default function INDFormPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => {
      window.removeEventListener('resize', checkMobileView);
    };
  }, []);

  if (isMobile) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        fontSize: '1.5rem',
        padding: '20px'
      }}>
        This page cannot be viewed on a mobile device. Please use a desktop.
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <INDSubmissionComponent />
    </Suspense>
  );
}