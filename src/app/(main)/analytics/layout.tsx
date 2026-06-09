// Light "platform" shell for the FDA analytics surface — same shared design
// system as the Audit + AI Act modules so analytics reads as part of the FDA suite.
import React from 'react';
import '@/styles/module-theme.css';
import { ModuleNav } from '@/components/module/ModuleNav';

export const metadata = {
  title: 'Analytics — Grimoire One',
  description: 'FDA warning-letter analytics and compliance insights.',
};

const TABS = [
  { href: '/audit', label: 'Audits' },
  { href: '/analytics', label: 'Analytics', exact: true },
];

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="module-theme module-canvas min-h-screen pt-8 text-[var(--ink)] antialiased">
      <ModuleNav
        wordmark={{ href: '/audit', icon: <span className="font-accent text-[0.8rem] leading-none" aria-hidden>§</span>, label: 'FDA 21 CFR', suffix: 'Grimoire One' }}
        tabs={TABS}
      />
      <div className="ai-rise mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">{children}</div>
    </div>
  );
}
