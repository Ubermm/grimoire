import { DocHero, DocSection, DocCallout, DocCard, DocGrid, DocList } from '@/components/docs/DocKit';

export default function SimilarViolationsPage() {
  return (
    <>
      <DocHero
        eyebrow="FDA 21 CFR"
        title="Similar violation analysis"
        lead="Use CFR 21 violation codes to identify similar cases and predict potential risks."
      />

      <DocSection title="Understanding risk prediction">
        <p>The analysis is based on the principle that warning letters with overlapping violation codes are likely to share similar compliance challenges.</p>
        <DocCallout>
          The system analyzes the specific CFR codes cited in warning letters to create a violation pattern map, helping identify companies with similar compliance challenges.
        </DocCallout>
      </DocSection>

      <DocSection title="How it works">
        <DocGrid>
          <DocCard step={1} title="Violation code analysis">
            <DocList items={['Extracts CFR 21 codes from warning letters', 'Creates a violation pattern fingerprint', 'Maps relationships between violations', 'Identifies common violation groupings']} />
          </DocCard>
          <DocCard step={2} title="Pattern matching">
            <DocList items={['Finds letters with matching codes', 'Identifies superset violations', 'Calculates similarity scores', 'Ranks results by relevance']} />
          </DocCard>
          <DocCard step={3} title="Risk assessment">
            <DocList items={['Analyzes patterns in similar cases', 'Identifies additional risk areas', 'Provides correlation insights', 'Highlights co-occurring violations']} />
          </DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Using the feature">
        <DocList ordered items={['Start a new analysis from the dashboard', "Select 'Find similar' analysis type", 'Input a warning-letter URL or paste content', 'Review matched cases and the statistical summary', 'Explore detailed violation patterns']} />
      </DocSection>

      <DocSection title="Best practices">
        <DocList items={['Review all matched violations carefully', 'Pay special attention to superset violations', 'Use insights for preventive measures', 'Consider historical patterns in your industry']} />
      </DocSection>
    </>
  );
}
