// Annex IV technical-documentation structure (Regulation (EU) 2024/1689, Annex IV).
// 9 sections; each becomes an editable block in the Annex IV builder and a nested
// document in AISystem.technicalDocumentation.

export interface AnnexIVSectionDef {
  key: string;
  title: string;
  prompt: string; // guidance shown to the user / used for autofill
}

export const ANNEX_IV_SECTIONS: AnnexIVSectionDef[] = [
  {
    key: 'section1_generalDescription',
    title: '1. General description of the AI system',
    prompt: 'Intended purpose, provider name, system version; how the system interacts with hardware/software; software versions; market forms; hardware it runs on; product photos/ill.; user instructions.',
  },
  {
    key: 'section2_developmentProcess',
    title: '2. Detailed description of elements & development process',
    prompt: 'Methods/steps for development; design specifications; system architecture; data requirements (datasets, provenance, labelling); human oversight measures; pre-determined changes; validation/testing procedures.',
  },
  {
    key: 'section3_monitoringControl',
    title: '3. Monitoring, functioning and control',
    prompt: 'Capabilities and limitations; expected accuracy; foreseeable unintended outcomes and risks to health/safety/fundamental rights; human-oversight measures; input data specifications.',
  },
  {
    key: 'section4_performanceMetrics',
    title: '4. Appropriateness of performance metrics',
    prompt: 'Description of the performance metrics used and why they are appropriate for the specific AI system.',
  },
  {
    key: 'section5_riskManagement',
    title: '5. Risk management system (Article 9)',
    prompt: 'The risk-management system established, operated and documented across the lifecycle; identified risks and mitigation measures; residual risks.',
  },
  {
    key: 'section6_lifecycleChanges',
    title: '6. Lifecycle changes',
    prompt: 'Description of any change made to the system through its lifecycle, with version control and dates.',
  },
  {
    key: 'section7_appliedStandards',
    title: '7. Harmonised standards & specifications applied',
    prompt: 'List of harmonised standards applied in full or in part; where not applied, description of solutions adopted to meet Chapter III Section 2 requirements.',
  },
  {
    key: 'section8_declarationOfConformity',
    title: '8. EU declaration of conformity',
    prompt: 'A copy of the EU declaration of conformity (Article 47).',
  },
  {
    key: 'section9_postMarketMonitoring',
    title: '9. Post-market monitoring plan',
    prompt: 'Description of the system in place to evaluate AI-system performance in the post-market phase (Article 72), including the post-market monitoring plan.',
  },
];

export function emptyTechnicalDocumentation() {
  return ANNEX_IV_SECTIONS.map((s) => ({
    key: s.key,
    title: s.title,
    status: 'pending' as const,
    content: '',
    responses: [] as { questionId: string; answer: string }[],
  }));
}

export function completionPercentage(
  docs: { status?: string; content?: string }[] | undefined
): number {
  if (!docs || docs.length === 0) return 0;
  const done = docs.filter((d) => d.status === 'completed' || (d.content && d.content.trim().length > 0)).length;
  return Math.round((done / ANNEX_IV_SECTIONS.length) * 100);
}
