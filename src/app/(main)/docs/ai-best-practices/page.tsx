import { DocHero, DocSection, DocCallout, DocList } from '@/components/docs/DocKit';

export default function AIBestPracticesPage() {
  return (
    <>
      <DocHero
        eyebrow="FDA 21 CFR"
        title="CFR Title 21 AI consultation best practices"
        lead="Real-time interpretation of CFR Title 21 regulations through advanced language models."
      />

      <DocSection title="Overview">
        <p>The AI consultation system helps compliance officers quickly understand regulatory requirements and their practical implications.</p>
        <DocCallout>
          The AI is a supplementary tool — use it alongside human expertise and official FDA guidance. Always verify AI interpretations against official sources.
        </DocCallout>
      </DocSection>

      <DocSection title="Key features">
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">Regulatory interpretation</p>
        <DocList items={['Plain-language explanations of complex regulations', 'Context-aware interpretations', 'Cross-reference identification', 'Historical context and precedents']} />
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">Query capabilities</p>
        <DocList items={['Natural-language question processing', 'Specific regulation lookups', 'Related requirement suggestions', 'Compliance scenario analysis']} />
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">Documentation support</p>
        <DocList items={['Citation generation', 'Requirement summaries', 'Compliance checklist creation', 'Export for documentation']} />
      </DocSection>

      <DocSection title="Effective query techniques">
        <DocList ordered items={['Be specific about the regulation section', 'Provide context about your use case', 'Ask for practical examples when needed', 'Request clarification on technical terms', 'Verify cross-references and related requirements', 'Document important interpretations for later']} />
      </DocSection>

      <DocSection title="Understanding AI responses">
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">Response components</p>
        <DocList items={['Regulatory interpretation', 'Relevant citations', 'Related requirements', 'Practical implications']} />
        <p className="font-accent text-sm font-semibold text-[var(--ink)]">Verification steps</p>
        <DocList items={['Cross-reference with official CFR documentation', 'Review cited regulations in context', 'Consult subject-matter experts', 'Document the verification process']} />
      </DocSection>

      <DocSection title="Best practices">
        <DocList items={['Always verify interpretations against official sources', 'Use specific, well-structured queries', 'Document both questions and answers', 'Maintain context in follow-up questions', 'Regularly review saved interpretations', 'Share important insights with your team', 'Track regulation updates that affect prior interpretations']} />
      </DocSection>

      <DocSection title="Limitations &amp; considerations">
        <DocList items={['AI interpretations are supplementary guidance only', 'Recent regulatory changes may not be reflected immediately', 'Complex scenarios may require human expert consultation', 'Always prioritize official FDA guidance', 'Document any discrepancies found']} />
      </DocSection>
    </>
  );
}
