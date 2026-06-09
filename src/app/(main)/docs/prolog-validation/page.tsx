import { DocHero, DocSection, DocCallout, DocGrid, DocCard, DocFeature, DocList } from '@/components/docs/DocKit';

export default function PrologValidationPage() {
  return (
    <>
      <DocHero
        eyebrow="FDA 21 CFR"
        title="Prolog validation system"
        lead="A comprehensive validation framework powered by logical programming."
      />

      <DocSection title="System overview">
        <p>The Prolog validation system leverages formal logic programming to provide exhaustive verification of CFR requirements. Through automated rule generation and logical analysis, it ensures complete coverage of Title 21 CFR regulations.</p>
        <DocCallout>
          The system automatically transforms CFR requirements into Prolog rules, enabling comprehensive validation of compliance measures and generating detailed visual flowcharts.
        </DocCallout>
      </DocSection>

      <DocSection title="Validation process">
        <DocGrid>
          <DocCard title="1. CFR selection">Choose relevant Title 21 CFR codes for validation.</DocCard>
          <DocCard title="2. Rule generation">Automatic creation of Prolog rules from requirements.</DocCard>
          <DocCard title="3. Validation">Comprehensive verification against generated rules.</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Key features">
        <DocGrid cols={2}>
          <DocFeature title="Automated rule generation" items={['Direct integration with the eCFR API', 'Intelligent requirement parsing', 'Context-aware rule creation']} />
          <DocFeature title="Validation framework" items={['Complete requirement coverage', 'Real-time validation feedback', 'Gap analysis and reporting']} />
        </DocGrid>
      </DocSection>

      <DocSection title="Using the system">
        <DocGrid>
          <DocCard step={1} title="Select requirements">Choose the relevant Title 21 CFR codes for your validation needs.</DocCard>
          <DocCard step={2} title="Complete forms">Fill out the generated validation questionnaires for each requirement.</DocCard>
          <DocCard step={3} title="Review results">Analyze validation outcomes and generated compliance reports.</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Best practices">
        <DocList items={['Provide detailed context for each validation requirement', 'Review all generated validation questions thoroughly', 'Document validation results for audit trails', 'Use flowcharts for process visualization and improvement', 'Maintain comprehensive validation records']} />
      </DocSection>
    </>
  );
}
