// Scoped "platform" shell for the EU AI Act module. The parent (main) layout
// provides the dark global NavBar + Footer; this wraps the content area in a
// light, neutral surface (design tokens in ai-act.css) so only the /ai-act
// subtree adopts the new visual language.
import React from 'react';
import './ai-act.css';
import { ModuleNav } from '@/components/ai-act/ModuleNav';

export const metadata = {
  title: 'EU AI Act — GrimoireOne',
  description: 'Formally verified EU AI Act compliance.',
};

export default function AIActLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ai-act-theme ai-act-canvas min-h-screen pt-8 text-[var(--ink)] antialiased">
      <ModuleNav />
      <div className="ai-rise mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">{children}</div>
    </div>
  );
}
