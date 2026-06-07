import Link from 'next/link';
import {
  Boxes, Workflow, ShieldAlert, Eye, Cpu, FileText, ScrollText, PenSquare, GitCompare, ArrowRight,
} from 'lucide-react';
import { PageHeader, EntryCard, AccentButton, GhostButton } from '@/components/ai-act/ui';

const SECTIONS = [
  {
    heading: 'Assess',
    items: [
      { href: '/ai-act/registry', icon: <Boxes className="h-5 w-5" />, title: 'AI system registry', desc: 'Inventory your AI systems and track compliance status.' },
      { href: '/ai-act/classify', icon: <Workflow className="h-5 w-5" />, title: 'Risk classification', desc: 'Prohibited · high-risk · GPAI · limited · minimal — verified in Prolog.' },
      { href: '/ai-act/screen/article-5', icon: <ShieldAlert className="h-5 w-5" />, title: 'Article 5 screening', desc: 'Check for prohibited AI practices.' },
    ],
  },
  {
    heading: 'Document',
    items: [
      { href: '/ai-act/screen/article-50', icon: <Eye className="h-5 w-5" />, title: 'Article 50 transparency', desc: 'Disclosure & synthetic-content labelling obligations.' },
      { href: '/ai-act/gpai', icon: <Cpu className="h-5 w-5" />, title: 'GPAI provider obligations', desc: 'Transparency, copyright & training-data summary (Art. 53).' },
      { href: '/ai-act/annex-iv', icon: <FileText className="h-5 w-5" />, title: 'Annex IV documentation', desc: 'Build the 9-section technical file for high-risk systems.' },
    ],
  },
  {
    heading: 'Operate',
    items: [
      { href: '/ai-act/audit', icon: <ScrollText className="h-5 w-5" />, title: 'Full AI Act audit', desc: 'Article-by-article audit with formal validation & report.' },
      { href: '/ai-act/authoring', icon: <PenSquare className="h-5 w-5" />, title: 'Rule authoring', desc: 'LLM-generate a validation form for any article, then edit it.' },
      { href: '/ai-act/cross-regulation', icon: <GitCompare className="h-5 w-5" />, title: 'Cross-regulation', desc: 'Where FDA 21 CFR and the AI Act overlap.' },
    ],
  },
];

export default function AIActHub() {
  return (
    <>
      {/* Hero */}
      <section className="mb-12">
        <PageHeader
          eyebrow="Regulation (EU) 2024/1689"
          title="EU AI Act compliance, formally verified"
          subtitle="Classify, screen, document and prove your AI systems against the EU AI Act. Every verdict is computed by a deterministic Prolog engine — auditable proofs, not checklists."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/ai-act/classify"><AccentButton>Classify a system <ArrowRight className="h-4 w-4" /></AccentButton></Link>
              <Link href="/ai-act/registry"><GhostButton>View registry</GhostButton></Link>
            </div>
          }
        />
      </section>

      {/* Capability groups */}
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              {section.heading}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((it) => (
                <EntryCard key={it.href} {...it} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
