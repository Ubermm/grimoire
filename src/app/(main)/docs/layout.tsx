// Light documentation shell — shares the product design system; sticky sidebar +
// readable content column. The global (main) NavBar/Footer go light on /docs.
import React from 'react';
import '@/styles/module-theme.css';
import { ModuleNav } from '@/components/module/ModuleNav';
import { DocsSidebar } from '@/components/docs/DocsSidebar';

export const metadata = {
  title: 'Documentation — Grimoire One',
  description: 'Guides for formally-verified FDA 21 CFR and EU AI Act compliance.',
};

const TABS = [
  { href: '/docs', label: 'Overview', exact: true },
  { href: '/docs/quickstart', label: 'Quickstart' },
  { href: '/docs/eu-ai-act', label: 'EU AI Act' },
  { href: '/docs/prolog-validation', label: 'Validation' },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="module-theme module-canvas min-h-screen pt-8 text-[var(--ink)] antialiased">
      <ModuleNav
        wordmark={{ href: '/docs', icon: <span className="font-accent text-[0.8rem] leading-none" aria-hidden>¶</span>, label: 'Docs', suffix: 'Grimoire One' }}
        tabs={TABS}
      />
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
          <DocsSidebar />
          <div className="ai-rise min-w-0 max-w-3xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
