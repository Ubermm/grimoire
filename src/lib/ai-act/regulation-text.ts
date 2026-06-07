// Real EU AI Act regulatory text (Regulation (EU) 2024/1689), scraped from
// artificialintelligenceact.eu and normalized for offline/deterministic seeding.
// Used by scripts/seed-ai-act.ts to populate the AIActRegulation collection.

export interface RegulationSeed {
  regCode: string;
  title: string;
  category: 'prohibited' | 'transparency' | 'high_risk' | 'gpai' | 'tech_doc' | 'general';
  source: string;
  formCode: string;
  fullText: string;
}

const SRC = 'https://artificialintelligenceact.eu';

export const AI_ACT_REGULATION_SEED: RegulationSeed[] = [
  {
    regCode: 'ART_5',
    title: 'Article 5 — Prohibited AI Practices',
    category: 'prohibited',
    source: `${SRC}/article/5/`,
    formCode: 'AIACT_ART_5',
    fullText: `Article 5 — Prohibited AI Practices

1. The following AI practices shall be prohibited:
(a) AI systems deploying subliminal, purposefully manipulative or deceptive techniques that materially distort behaviour and cause significant harm;
(b) AI systems exploiting vulnerabilities (age, disability, social or economic situation) to materially distort behaviour and cause significant harm;
(c) social scoring of natural persons based on social behaviour or personal characteristics leading to detrimental or unjustified treatment;
(d) risk assessments predicting the risk of a natural person committing a criminal offence based solely on profiling or personality traits;
(e) creating or expanding facial recognition databases through untargeted scraping of facial images from the internet or CCTV;
(f) inferring emotions of natural persons in the workplace or education institutions, except for medical or safety reasons;
(g) biometric categorisation deducing or inferring sensitive attributes (race, political opinions, trade-union membership, religion, sex life, sexual orientation);
(h) real-time remote biometric identification in publicly accessible spaces for law enforcement, save for narrowly defined exceptions (search for victims, prevention of imminent threat, localisation of a suspect for serious offences in Annex II).`,
  },
  {
    regCode: 'ART_50',
    title: 'Article 50 — Transparency Obligations',
    category: 'transparency',
    source: `${SRC}/article/50/`,
    formCode: 'AIACT_ART_50',
    fullText: `Article 50 — Transparency Obligations for Providers and Deployers of Certain AI Systems

1. Providers shall ensure AI systems intended to interact directly with natural persons are designed so that persons are informed they are interacting with an AI system, unless obvious from the context.
2. Providers of AI systems (including GPAI) generating synthetic audio, image, video or text shall ensure outputs are marked in a machine-readable format and detectable as artificially generated or manipulated.
3. Deployers of emotion recognition or biometric categorisation systems shall inform exposed natural persons of the operation of the system and process personal data per GDPR.
4. Deployers of AI systems generating or manipulating deep-fake content shall disclose that the content is artificially generated or manipulated; text published to inform the public on matters of public interest must also be disclosed.
5. Information shall be provided clearly and distinguishably at the latest at the first interaction or exposure, conforming to accessibility requirements.
6. Paragraphs 1-4 do not affect Chapter III requirements or other transparency obligations.
7. The AI Office shall encourage codes of practice for detection and labelling of artificially generated content.`,
  },
  {
    regCode: 'ANNEX_III',
    title: 'Annex III — High-Risk AI Systems (Article 6(2))',
    category: 'high_risk',
    source: `${SRC}/annex/3/`,
    formCode: 'AIACT_ANNEX_III',
    fullText: `Annex III — High-Risk AI Systems referred to in Article 6(2)

1. Biometrics (where permitted): (a) remote biometric identification; (b) biometric categorisation by sensitive/protected attributes; (c) emotion recognition.
2. Critical infrastructure: AI safety components in critical digital infrastructure, road traffic, or supply of water, gas, heating, electricity.
3. Education and vocational training: access/admission, evaluating learning outcomes, assessing appropriate level of education, monitoring prohibited behaviour during tests.
4. Employment, workers management and access to self-employment: recruitment/selection; decisions on terms, promotion, termination, task allocation, performance monitoring.
5. Access to essential private and public services: eligibility for public assistance benefits; creditworthiness/credit scoring (except fraud detection); risk assessment & pricing for life/health insurance; emergency call evaluation and dispatch/triage.
6. Law enforcement (where permitted): victimisation risk; polygraphs; evidence reliability; offending/re-offending risk; profiling.
7. Migration, asylum and border control (where permitted): polygraphs; risk assessment; examination of applications; detection/recognition/identification of persons (except travel-document verification).
8. Administration of justice and democratic processes: assisting judicial authorities in interpreting/applying law; influencing elections/referenda or voting behaviour.`,
  },
  {
    regCode: 'ANNEX_IV',
    title: 'Annex IV — Technical Documentation (Article 11(1))',
    category: 'tech_doc',
    source: `${SRC}/annex/4/`,
    formCode: 'AIACT_ANNEX_IV',
    fullText: `Annex IV — Technical Documentation referred to in Article 11(1)

The technical documentation shall contain at least:
1. General description (intended purpose, provider, version, hardware/software interaction, market forms, hardware requirements, user instructions).
2. Detailed description of elements and the development process (methods, design specifications, architecture, computational resources, data requirements, human oversight, predetermined changes, validation/testing, cybersecurity).
3. Monitoring, functioning and control (capabilities/limitations, accuracy, foreseeable unintended outcomes, risks, human-oversight measures, input data specifications).
4. Appropriateness of the performance metrics.
5. Risk management system per Article 9.
6. Lifecycle changes made by the provider.
7. Harmonised standards applied, or description of other solutions adopted.
8. EU declaration of conformity (Article 47).
9. Post-market monitoring system per Article 72, including the monitoring plan.`,
  },
  {
    regCode: 'GPAI_COP_CH1',
    title: 'Article 53 / GPAI Code of Practice — Transparency & Copyright',
    category: 'gpai',
    source: `${SRC}/article/53/`,
    formCode: 'AIACT_GPAI_CH1',
    fullText: `Article 53 — Obligations for Providers of General-Purpose AI Models

1. Providers of general-purpose AI models shall:
(a) draw up and keep up-to-date technical documentation of the model (training/testing process and evaluation results; at minimum Annex XI) for the AI Office and national competent authorities upon request;
(b) draw up, keep up-to-date and make available information and documentation to downstream providers integrating the model (at minimum Annex XII), enabling them to understand capabilities/limitations and comply with their obligations;
(c) put in place a policy to comply with Union copyright law, in particular to identify and respect rights reservations expressed under Article 4(3) of Directive (EU) 2019/790;
(d) draw up and make publicly available a sufficiently detailed summary of the content used for training, per the AI Office template.

2. Points (a) and (b) do not apply to free/open-source models with publicly available parameters and architecture, unless the model has systemic risk.

The GPAI Code of Practice (10 July 2025) operationalises these duties across three chapters: Transparency, Copyright, and Safety & Security (the last for systemic-risk models only).`,
  },
];
