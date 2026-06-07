// EU AI Act module constants: risk levels, article registry, theme accent tokens.

export type RiskLevel =
  | 'unclassified'
  | 'prohibited'
  | 'high'
  | 'limited'
  | 'minimal'
  | 'gpai'
  | 'gpai_systemic';

export interface RiskMeta {
  level: RiskLevel;
  label: string;
  blurb: string;
  // tailwind classes for the muted OpenAI-style risk badge
  badge: string;
}

export const RISK_LEVELS: Record<RiskLevel, RiskMeta> = {
  unclassified: {
    level: 'unclassified',
    label: 'Unclassified',
    blurb: 'Not yet classified. Run the classification wizard.',
    badge: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  prohibited: {
    level: 'prohibited',
    label: 'Prohibited',
    blurb: 'Falls under an Article 5 prohibited practice — may not be placed on the market or used.',
    badge: 'bg-red-50 text-red-700 border-red-200',
  },
  high: {
    level: 'high',
    label: 'High-risk',
    blurb: 'Article 6 / Annex III high-risk system. Full Chapter III obligations apply.',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  limited: {
    level: 'limited',
    label: 'Limited risk',
    blurb: 'Article 50 transparency obligations apply.',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  minimal: {
    level: 'minimal',
    label: 'Minimal risk',
    blurb: 'No mandatory obligations beyond voluntary codes of conduct.',
    badge: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  },
  gpai: {
    level: 'gpai',
    label: 'GPAI',
    blurb: 'General-purpose AI model — Article 53 provider obligations apply.',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  gpai_systemic: {
    level: 'gpai_systemic',
    label: 'GPAI · systemic',
    blurb: 'GPAI model with systemic risk — Articles 51-55 obligations apply.',
    badge: 'bg-violet-100 text-violet-800 border-violet-300',
  },
};

// Order used to pick the *primary* risk level from the wizard's passed queries.
export const RISK_PRIORITY: RiskLevel[] = [
  'prohibited',
  'gpai_systemic',
  'high',
  'gpai',
  'limited',
];

// Article registry — RegCode -> display metadata. Mirrors the seeded AIActRegulation collection.
export interface ArticleMeta {
  regCode: string;
  title: string;
  category: 'prohibited' | 'transparency' | 'high_risk' | 'gpai' | 'tech_doc' | 'general';
  formCode: string;
}

export const AI_ACT_ARTICLES: ArticleMeta[] = [
  { regCode: 'ART_5', title: 'Article 5 — Prohibited AI practices', category: 'prohibited', formCode: 'AIACT_ART_5' },
  { regCode: 'ART_50', title: 'Article 50 — Transparency obligations', category: 'transparency', formCode: 'AIACT_ART_50' },
  { regCode: 'ANNEX_III', title: 'Annex III — High-risk use cases', category: 'high_risk', formCode: 'AIACT_ANNEX_III' },
  { regCode: 'ANNEX_IV', title: 'Annex IV — Technical documentation', category: 'tech_doc', formCode: 'AIACT_ANNEX_IV' },
  { regCode: 'GPAI_COP_CH1', title: 'GPAI Code of Practice — Transparency', category: 'gpai', formCode: 'AIACT_GPAI_CH1' },
  { regCode: 'GPAI_COP_CH2', title: 'GPAI Code of Practice — Copyright', category: 'gpai', formCode: 'AIACT_GPAI_CH2' },
];

// Single accent used across the /ai-act module (OpenAI-style teal-green).
export const ACCENT = '#10A37F';
