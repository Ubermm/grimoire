import Link from 'next/link';
import { Workflow, ShieldAlert, Eye, Cpu, FileText, ScrollText, Boxes, GitCompare, ArrowRight } from 'lucide-react';
import { AccentButton } from '@/components/module/ui';
import { DocHero, DocSection, DocCallout, DocGrid, DocCard, DocFeature, DocList } from '@/components/docs/DocKit';

export default function EuAiActDocs() {
  return (
    <>
      <DocHero
        eyebrow="Regulation (EU) 2024/1689"
        title="EU AI Act module"
        lead="Classify, screen, document and audit AI systems against the EU AI Act. Every verdict is computed by a deterministic Prolog engine — auditable proofs, not checklists."
      />

      <DocSection>
        <DocCallout>
          The AI Act module reuses the same formal-verification engine as the FDA tools: your answers are compiled into Prolog facts and checked against the regulation's rules, so each classification and obligation is provably derived — not an LLM opinion.
        </DocCallout>
      </DocSection>

      <DocSection title="The workflow">
        <DocGrid>
          <DocCard step={1} title="Register a system">Add your AI system to the registry with its role (provider, deployer, importer, distributor).</DocCard>
          <DocCard step={2} title="Classify risk">Answer the screening questions; the engine returns prohibited, high-risk, limited, minimal or GPAI.</DocCard>
          <DocCard step={3} title="Document &amp; audit">Build the Annex IV technical file and run an article-by-article audit with formal validation.</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Assess">
        <DocGrid cols={2}>
          <DocFeature icon={<Boxes className="h-5 w-5" />} title="System registry" desc="Inventory your AI systems and track each one's classification, obligations and validation status." />
          <DocFeature icon={<Workflow className="h-5 w-5" />} title="Risk classification" desc="A Prolog-backed wizard that decides the risk tier in priority order." items={['Article 3 scope check', 'Article 5 prohibited practices (terminal)', 'GPAI / systemic-risk models', 'Article 6 & Annex III high-risk uses', 'Article 50 limited / minimal']} />
        </DocGrid>
      </DocSection>

      <DocSection title="Screen &amp; document">
        <DocGrid cols={2}>
          <DocFeature icon={<ShieldAlert className="h-5 w-5" />} title="Article 5 screening" desc="Check a system against the eight prohibited AI practices — a prohibited verdict is terminal." />
          <DocFeature icon={<Eye className="h-5 w-5" />} title="Article 50 transparency" desc="Disclosure and synthetic-content labelling obligations for limited-risk systems." />
          <DocFeature icon={<Cpu className="h-5 w-5" />} title="GPAI obligations" desc="General-purpose AI: transparency, copyright policy and training-data summary (Art. 53), plus systemic-risk duties." />
          <DocFeature icon={<FileText className="h-5 w-5" />} title="Annex IV technical file" desc="Build the nine-section technical documentation required for high-risk systems." />
        </DocGrid>
      </DocSection>

      <DocSection title="Operate">
        <DocGrid cols={2}>
          <DocFeature icon={<ScrollText className="h-5 w-5" />} title="Full AI Act audit" desc="An article-by-article audit that validates each provision and produces an evidence report." />
          <DocFeature icon={<GitCompare className="h-5 w-5" />} title="Cross-regulation" desc="See where FDA 21 CFR and the EU AI Act overlap (e.g. SaMD ↔ high-risk, Part 11 ↔ data governance)." />
        </DocGrid>
      </DocSection>

      <DocSection title="How classification is decided">
        <p>The engine evaluates outcomes in strict priority order and returns the first that matches:</p>
        <DocList ordered items={[
          <span key="1"><strong>Prohibited</strong> — the system meets an Article 5 practice (terminal).</span>,
          <span key="2"><strong>GPAI / systemic</strong> — a general-purpose model, flagged systemic above the compute threshold.</span>,
          <span key="3"><strong>High-risk</strong> — an Article 6 safety component or a listed Annex III use (unless Art. 6(3) exempt).</span>,
          <span key="4"><strong>Limited</strong> — Article 50 transparency obligations apply.</span>,
          <span key="5"><strong>Minimal</strong> — no specific obligations beyond voluntary codes.</span>,
        ]} />
        <DocCallout>
          Because the decision is a Prolog program, the basis for every verdict is recorded as a list of the exact rules that fired — ready to export as evidence.
        </DocCallout>
      </DocSection>

      <DocSection title="Start now">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/ai-act/classify"><AccentButton>Classify a system <ArrowRight className="h-4 w-4" /></AccentButton></Link>
          <Link href="/ai-act" className="font-accent text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">or open the AI Act hub →</Link>
        </div>
      </DocSection>
    </>
  );
}
