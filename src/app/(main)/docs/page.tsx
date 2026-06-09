import { PageHeader, EntryCard } from '@/components/module/ui';

const DOCS = [
  { href: '/docs/overview', index: '01', title: 'Platform overview', desc: 'How AI analysis and formal verification fit together.' },
  { href: '/docs/quickstart', index: '02', title: 'Quickstart', desc: 'Run your first validation or warning-letter analysis.' },
  { href: '/docs/prolog-validation', index: '03', title: 'Prolog validation', desc: 'How CFR requirements become provable Prolog rules.' },
  { href: '/docs/letter-comparison', index: '04', title: 'Letter comparison', desc: 'Compare two FDA warning letters side by side.' },
  { href: '/docs/similar-violations', index: '05', title: 'Similar violations', desc: 'Find related letters by shared CFR citations.' },
  { href: '/docs/ai-best-practices', index: '06', title: 'AI best practices', desc: 'Get reliable answers from the CFR consultation AI.' },
  { href: '/docs/eu-ai-act', index: '07', title: 'EU AI Act module', desc: 'Classify, screen, document and audit AI systems.' },
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
