// Scoped light "platform" shell for the FDA Audit module. The global (main)
// layout supplies the dark NavBar + Footer; this wraps the content in the shared
// light surface (tokens in src/styles/module-theme.css) so FDA Audit and EU AI
// Act feel like one product.
import React from 'react';
import '@/styles/module-theme.css';
import { ModuleNav } from '@/components/module/ModuleNav';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'FDA Audits — Grimoire One',
  description: 'Formally verified FDA 21 CFR compliance audits.',
};

const TABS = [
  { href: '/audit', label: 'Audits', exact: true },
  { href: '/audit/new', label: 'New audit' },
  { href: '/analytics', label: 'Analytics' },
];

export default function AuditLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="module-theme module-canvas min-h-screen pt-8 text-[var(--ink)] antialiased">
      <ModuleNav
        wordmark={{ href: '/audit', icon: <ShieldCheck className="h-3.5 w-3.5" />, label: 'FDA 21 CFR', suffix: 'Grimoire One' }}
        tabs={TABS}
      />
      <div className="ai-rise mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">{children}</div>
    </div>
  );
}
