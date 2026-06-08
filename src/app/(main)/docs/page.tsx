import { BookOpen, Rocket, Cpu, GitCompare, Network, ScrollText, Sparkles } from 'lucide-react';
import { PageHeader, EntryCard } from '@/components/module/ui';

const DOCS = [
  { href: '/docs/overview', icon: <BookOpen className="h-5 w-5" />, title: 'Platform overview', desc: 'How AI analysis and formal verification fit together.' },
  { href: '/docs/quickstart', icon: <Rocket className="h-5 w-5" />, title: 'Quickstart', desc: 'Run your first validation or warning-letter analysis.' },
  { href: '/docs/prolog-validation', icon: <Cpu className="h-5 w-5" />, title: 'Prolog validation', desc: 'How CFR requirements become provable Prolog rules.' },
  { href: '/docs/letter-comparison', icon: <GitCompare className="h-5 w-5" />, title: 'Letter comparison', desc: 'Compare two FDA warning letters side by side.' },
  { href: '/docs/similar-violations', icon: <Network className="h-5 w-5" />, title: 'Similar violations', desc: 'Find related letters by shared CFR citations.' },
  { href: '/docs/ai-best-practices', icon: <ScrollText className="h-5 w-5" />, title: 'AI best practices', desc: 'Get reliable answers from the CFR consultation AI.' },
  { href: '/docs/eu-ai-act', icon: <Sparkles className="h-5 w-5" />, title: 'EU AI Act module', desc: 'Classify, screen, document and audit AI systems.' },
];

export default function DocsIndex() {
  return (
    <>
      <PageHeader eyebrow="Documentation" title="Grimoire One docs" subtitle="Guides for formally-verified FDA 21 CFR and EU AI Act compliance — prove adherence, don't just claim it." />
      <div className="grid gap-4 sm:grid-cols-2">
        {DOCS.map((d) => <EntryCard key={d.href} {...d} />)}
      </div>
    </>
  );
}
