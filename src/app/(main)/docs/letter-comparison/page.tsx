import { DocHero, DocSection, DocCallout, DocGrid, DocCard, DocFeature } from '@/components/docs/DocKit';

export default function LetterComparisonPage() {
  return (
    <>
      <DocHero
        eyebrow="FDA 21 CFR"
        title="Warning letter comparison"
        lead="Analyze FDA warning letters, identify patterns, and compare violations."
      />

      <DocSection title="Overview">
        <p>The comparison feature enables detailed analysis between different FDA warning letters, helping identify patterns, common violations, and regulatory trends.</p>
        <DocCallout>
          Compare warning letters using direct URLs or pasted content. The system analyzes CFR violations, corrective actions, and regulatory contexts.
        </DocCallout>
      </DocSection>

      <DocSection title="Comparison types">
        <DocGrid cols={2}>
          <DocFeature title="Direct comparison" desc="Compare any two warning letters by providing their URLs." />
          <DocFeature title="Violation set analysis" desc="Find letters with similar or superset violations." />
        </DocGrid>
      </DocSection>

      <DocSection title="Using the comparison tool">
        <DocGrid>
          <DocCard title="1. Select method">Choose direct URL input or content paste.</DocCard>
          <DocCard title="2. Input letters">Provide URLs or paste letter content.</DocCard>
          <DocCard title="3. Review analysis">View side-by-side comparison results.</DocCard>
        </DocGrid>
      </DocSection>
    </>
  );
}
