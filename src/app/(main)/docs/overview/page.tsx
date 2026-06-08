import { Database, Cpu, FileOutput } from 'lucide-react';
import MermaidChart from '@/components/MermaidChart';
import { SectionCard } from '@/components/module/ui';
import { DocHero, DocSection, DocCallout, DocGrid, DocCard, DocFeature, DocList } from '@/components/docs/DocKit';

export default function OverviewPage() {
  return (
    <>
      <DocHero
        eyebrow="Get started"
        title="Platform overview"
        lead="Comprehensive FDA compliance management powered by AI analysis and Prolog-based formal verification."
      />

      <DocSection>
        <DocCallout>
          Grimoire One combines advanced AI analysis with Prolog-based formal verification to provide actionable compliance insights and <em>validated</em> regulatory adherence — proven pass/fail verdicts, not checklists.
        </DocCallout>
      </DocSection>

      <DocSection title="Data flow">
        <SectionCard title="Processing workflow" subtitle="From input sources to deliverables" bodyClassName="bg-[var(--canvas)]">
          <MermaidChart chart={`flowchart TD
    subgraph Input ["Data Sources"]
        A[FDA Warning Letters]
        B[Title 21 CFR Database]
        C[Compliance Documents]
    end
    subgraph Processing ["Core Processing"]
        D[AI Analysis Engine]
        E[Prolog Validation Engine]
        F[Pattern Detection]
    end
    subgraph Output ["Deliverables"]
        G[Violation Analysis]
        H[Compliance Reports]
        I[Validation Results]
        J[Risk Predictions]
    end
    A --> D
    B --> D & E
    C --> D & E
    D --> F
    F --> G & J
    E --> H & I`} />
        </SectionCard>
      </DocSection>

      <DocSection title="Core features">
        <DocGrid cols={2}>
          <DocFeature
            icon={<Database className="h-5 w-5" />}
            title="Warning letter analysis"
            desc="AI-powered analysis of FDA warning letters to identify patterns and risks."
            items={['Pattern detection across similar violations', 'Statistical analysis of violation types', 'Industry-wide trend identification', 'Risk prediction from historical data']}
          />
          <DocFeature
            icon={<Cpu className="h-5 w-5" />}
            title="Prolog validation"
            desc="Formal verification for comprehensive compliance validation."
            items={['Automated validation against CFR requirements', 'Logical flowchart generation', 'Structured validation reporting', 'Complete coverage verification']}
          />
        </DocGrid>
      </DocSection>

      <DocSection title="Platform capabilities">
        <DocGrid>
          <DocCard icon={<Database className="h-4 w-4" />} title="Data sources">
            <DocList items={['FDA Warning Letter database', 'Title 21 CFR documentation', 'FDA guidance documents', 'Historical compliance data']} />
          </DocCard>
          <DocCard icon={<Cpu className="h-4 w-4" />} title="Processing">
            <DocList items={['AI-powered analysis', 'Prolog logic engine', 'Pattern recognition', 'Risk assessment']} />
          </DocCard>
          <DocCard icon={<FileOutput className="h-4 w-4" />} title="Outputs">
            <DocList items={['Compliance reports', 'Validation results', 'Risk predictions', 'Actionable insights']} />
          </DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Getting started">
        <DocGrid>
          <DocCard step={1} title="Open analytics">Go to the analytics page and start a new analysis.</DocCard>
          <DocCard step={2} title="Pick a mode">Choose warning-letter analysis or compliance validation.</DocCard>
          <DocCard step={3} title="Provide inputs">Upload documentation or select CFR codes for validation.</DocCard>
          <DocCard step={4} title="Review results">Read the generated insights and validation verdicts.</DocCard>
        </DocGrid>
      </DocSection>
    </>
  );
}
