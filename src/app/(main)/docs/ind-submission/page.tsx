// Legacy dark page restyled onto the light DocKit primitives — copy unchanged.
import { DocHero, DocSection, DocCallout, DocGrid, DocCard, DocFeature, DocList } from '@/components/docs/DocKit';

const INDSubmissionPage = () => {
  return (
    <>
      <DocHero
        eyebrow="FDA 21 CFR"
        title="IND Submission System"
        lead="Streamlined FDA form preparation with AI-powered automation"
      />

      <DocSection title="System Overview">
        <p>
          Our IND submission system simplifies the complex process of preparing FDA forms 1571 and 1572 for Investigational New Drug applications. Through intelligent form handling, AI-powered autofill, and comprehensive preview capabilities, we streamline the entire submission workflow.
        </p>
        <DocCallout>
          The system provides an intuitive interface for form completion, leverages AI to intelligently populate fields, and generates submission-ready documents that meet FDA requirements.
        </DocCallout>
      </DocSection>

      <DocSection title="Submission Process">
        <DocGrid>
          <DocCard title="1. Form Selection">Choose FDA 1571 or 1572 forms for completion</DocCard>
          <DocCard title="2. AI Autofill">Intelligent field population based on context and data</DocCard>
          <DocCard title="3. Preview &amp; Submit">Review submission-ready documents before filing</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Key Features">
        <DocGrid cols={2}>
          <DocFeature
            title="Intuitive Form Interface"
            items={['Clean, user-friendly form layouts', 'Field validation and error checking', 'Progressive form completion']}
          />
          <DocFeature
            title="AI-Powered Automation"
            items={['Intelligent field population', 'Context-aware suggestions', 'Data consistency verification']}
          />
          <DocFeature
            title="Document Management"
            items={['Real-time document preview', 'PDF generation for submission', 'Version control and tracking']}
          />
          <DocFeature
            title="Compliance Assurance"
            items={['FDA format compliance', 'Required field verification', 'Submission readiness checks']}
          />
        </DocGrid>
      </DocSection>

      <DocSection title="Supported FDA Forms">
        <DocGrid cols={2}>
          <DocFeature
            title="FDA Form 1571"
            desc="Investigational New Drug Application"
            items={['Sponsor information', 'Drug product details', 'Manufacturing information', 'Clinical protocol summary']}
          />
          <DocFeature
            title="FDA Form 1572"
            desc="Statement of Investigator"
            items={['Investigator qualifications', 'Site information', 'Protocol commitments', 'Regulatory compliance']}
          />
        </DocGrid>
      </DocSection>

      <DocSection title="Using the System">
        <DocGrid cols={2}>
          <DocCard step={1} title="Select Form Type">Choose between FDA Form 1571 or 1572 based on your submission needs</DocCard>
          <DocCard step={2} title="Complete Form Fields">Fill out required fields manually or use AI autofill to populate sections intelligently</DocCard>
          <DocCard step={3} title="Review and Preview">Use the preview function to review your submission-ready document</DocCard>
          <DocCard step={4} title="Generate Final Documents">Export completed forms as submission-ready PDFs for FDA filing</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="AI Autofill Features">
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">How AI Autofill Works</p>
        <DocList items={[
          'Analyzes existing form data and context to suggest appropriate field values',
          'Learns from previous submissions to improve accuracy over time',
          'Maintains data consistency across related fields and sections',
          'Provides intelligent suggestions while allowing manual override',
          'Validates populated data against FDA requirements and formats',
        ]} />
      </DocSection>

      <DocSection title="Best Practices">
        <DocList items={[
          'Always review AI-populated fields for accuracy and completeness',
          'Use the preview feature to verify document formatting before submission',
          'Save your progress regularly during form completion',
          'Maintain consistent data formats across all form fields',
          'Keep supporting documentation organized for easy reference',
          'Verify all required fields are completed before generating final documents',
        ]} />
      </DocSection>
    </>
  );
};

export default INDSubmissionPage;
