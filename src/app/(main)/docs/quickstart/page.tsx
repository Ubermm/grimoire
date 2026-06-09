import Link from 'next/link';
import { AccentButton } from '@/components/module/ui';
import { DocHero, DocSection, DocCallout, DocGrid, DocCard, DocFeature } from '@/components/docs/DocKit';

export default function QuickStartPage() {
  return (
    <>
      <DocHero
        eyebrow="Get started"
        title="Begin your compliance journey"
        lead="Comprehensive validation and warning-letter analysis to eliminate regulatory hurdles."
      />

      <DocSection>
        <DocCallout>
          Grimoire One's validation framework ensures 100% coverage of Title 21 CFR requirements, dramatically reducing regulatory delays and compliance gaps.
        </DocCallout>
      </DocSection>

      <DocSection title="Prolog-powered validation">
        <p>Complete CFR code validation with exhaustive verification.</p>
        <DocGrid>
          <DocCard step={1} title="Select CFR codes">Choose relevant Title 21 CFR codes from the database.</DocCard>
          <DocCard step={2} title="Complete forms">Fill out structured validation forms for each code.</DocCard>
          <DocCard step={3} title="Review &amp; submit">Review automated verdicts and generate reports.</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Warning letter analysis">
        <p>AI-powered analysis of FDA warning letters to identify patterns and risks.</p>
        <DocGrid>
          <DocCard step={1} title="Upload letters">Input FDA warning letters via URL or text.</DocCard>
          <DocCard step={2} title="Pattern analysis">Review AI-detected patterns and violation relationships.</DocCard>
          <DocCard step={3} title="Risk assessment">Get insights on compliance risks and recommendations.</DocCard>
        </DocGrid>
      </DocSection>

      <DocSection title="Key platform features">
        <DocGrid cols={2}>
          <DocFeature
            title="Validation features"
            items={['Exhaustive verification of each CFR requirement', 'Automated logical analysis of compliance data', 'Real-time validation feedback', 'Complete audit-trail generation']}
          />
          <DocFeature
            title="Analysis features"
            items={['Pattern detection across warning letters', 'Risk prediction and violation relationships', 'Historical trend analysis', 'Automated compliance recommendations']}
          />
        </DocGrid>
      </DocSection>

      <DocSection title="Start now">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/audit"><AccentButton>Start your first audit <span aria-hidden>→</span></AccentButton></Link>
          <Link href="/analytics" className="font-accent text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">or analyze a warning letter →</Link>
        </div>
      </DocSection>
    </>
  );
}
