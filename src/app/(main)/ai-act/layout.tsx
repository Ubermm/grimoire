// Scoped OpenAI-style shell for the EU AI Act module. The parent (main) layout
// provides the (dark) NavBar + Footer; this wraps the content area in a light,
// neutral surface so only the /ai-act subtree adopts the new visual language.
import React from 'react';

export const metadata = {
  title: 'EU AI Act — GrimoireOne',
  description: 'Formally verified EU AI Act compliance.',
};

export default function AIActLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ai-act-theme min-h-screen bg-[#FAFAFA] text-[#0D0D0D] antialiased">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-8 md:py-14">{children}</div>
    </div>
  );
}
