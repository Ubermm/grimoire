import Link from 'next/link';
import { PageHeader, EntryCard, AccentButton, GhostButton } from '@/components/ai-act/ui';

const SECTIONS = [
  {
    heading: 'Assess',
    items: [
      { href: '/ai-act/registry', index: '01', title: 'AI system registry', desc: 'Inventory your AI systems and track compliance status.' },
      { href: '/ai-act/classify', index: '02', title: 'Risk classification', desc: 'Prohibited · high-risk · GPAI · limited · minimal — verified in Prolog.' },
      { href: '/ai-act/screen/article-5', index: '03', title: 'Article 5 screening', desc: 'Check for prohibited AI practices.' },
    ],
  },
  {
    heading: 'Document',
    items: [
      { href: '/ai-act/screen/article-50', index: '04', title: 'Article 50 transparency', desc: 'Disclosure & synthetic-content labelling obligations.' },
      { href: '/ai-act/gpai', index: '05', title: 'GPAI provider obligations', desc: 'Transparency, copyright & training-data summary (Art. 53).' },
      { href: '/ai-act/annex-iv', index: '06', title: 'Annex IV documentation', desc: 'Build the 9-section technical file for high-risk systems.' },
    ],
  },
  {
    heading: 'Operate',
    items: [
      { href: '/ai-act/audit', index: '07', title: 'Full AI Act audit', desc: 'Article-by-article audit with formal validation & report.' },
      { href: '/ai-act/authoring', index: '08', title: 'Rule authoring', desc: 'LLM-generate a validation form for any article, then edit it.' },
      { href: '/ai-act/cross-regulation', index: '09', title: 'Cross-regulation', desc: 'Where FDA 21 CFR and the AI Act overlap.' },
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
              <Link href="/ai-act/classify"><AccentButton>Classify a system <span aria-hidden>→</span></AccentButton></Link>
              <Link href="/ai-act/registry"><GhostButton>View registry</GhostButton></Link>
            </div>
          }
        />
      </section>

      {/* Capability groups */}
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.heading}>
            <h2 className="font-accent mb-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--ink-faint)]">
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
