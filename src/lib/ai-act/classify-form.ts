// The risk-classification wizard encoded as the regulation-agnostic validate
// "form" (questions / facts / validations / queries). Posting this + responses
// to /api/validate returns passed[] aligned with `queries`; the client picks the
// first passed query in RISK_PRIORITY order as the primary risk level.
import type { ValidationForm, FormQuery } from './schema';
import type { RiskLevel } from './constants';

export const CLASSIFY_FORM: ValidationForm = {
  questions: [
    { id: 'q1', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 3(1)',
      text: 'Is the product an "AI system" within the meaning of Article 3(1), placed on the EU market or whose output affects persons in the EU?' },
    { id: 'q2', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 5(1)(a)-(b)',
      text: 'Does it deploy subliminal, manipulative or deceptive techniques, or exploit vulnerabilities (age, disability, social/economic situation), that materially distort behaviour and cause significant harm?' },
    { id: 'q3', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 5(1)(c)',
      text: 'Does it evaluate or classify people based on social behaviour or personal characteristics (social scoring) leading to detrimental or unjustified treatment?' },
    { id: 'q4', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 5(1)(e)',
      text: 'Does it create or expand facial-recognition databases through untargeted scraping of facial images from the internet or CCTV footage?' },
    { id: 'q5', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 5(1)(f)',
      text: 'Does it infer emotions of people in the workplace or in education institutions (other than for medical or safety reasons)?' },
    { id: 'q6', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 5(1)(g)',
      text: 'Does it use biometric categorisation to infer sensitive attributes (race, political opinions, trade-union membership, religion, sex life or sexual orientation)?' },
    { id: 'q7', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 5(1)(h)',
      text: 'Does it perform "real-time" remote biometric identification in publicly accessible spaces for law-enforcement purposes, outside the narrow permitted exceptions?' },
    { id: 'q8', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 3(63)',
      text: 'Is it a general-purpose AI model (trained on broad data, displaying significant generality, capable of a wide range of distinct tasks)?' },
    { id: 'q9', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 51',
      text: 'Does the general-purpose model present systemic risk (cumulative training compute > 10^25 FLOPs, or designated by the Commission)?' },
    { id: 'q10', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 6(1)',
      text: 'Is the AI system a safety component of — or itself — a product covered by the Union harmonisation legislation in Annex I, and required to undergo third-party conformity assessment?' },
    { id: 'q11', type: 'SELECT', options: ['yes', 'no'], reference: 'Annex III',
      text: 'Is the AI system intended to be used in one of the high-risk areas listed in Annex III (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration/border, administration of justice)?' },
    { id: 'q12', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 6(3)',
      text: 'Does it qualify for the Article 6(3) derogation (narrow procedural task / improves a prior human activity / detects decision patterns without replacing human assessment / preparatory task) AND does it NOT profile natural persons?' },
    { id: 'q13', type: 'SELECT', options: ['yes', 'no'], reference: 'Art. 50',
      text: 'Does it interact directly with natural persons, generate synthetic audio/image/video/text, produce deepfakes, or perform (permitted) emotion recognition / biometric categorisation — triggering transparency duties?' },
    { id: 'domains', type: 'CHECKBOX', reference: 'Annex III',
      options: ['Biometrics', 'Critical infrastructure', 'Education', 'Employment', 'Essential private/public services', 'Law enforcement', 'Migration/border', 'Justice & democracy'],
      text: 'If high-risk under Annex III, which area(s) apply? (recorded for the dossier; does not affect the verdict)' },
  ],
  facts: [
    { template: 'in_scope({1}).', question_id: 'q1', description: 'AI system within scope' },
    { template: 'manipulative({2}).', question_id: 'q2', description: 'Manipulative / exploitative techniques' },
    { template: 'social_scoring({3}).', question_id: 'q3', description: 'Social scoring' },
    { template: 'facial_scraping({4}).', question_id: 'q4', description: 'Untargeted facial-image scraping' },
    { template: 'emotion_workplace({5}).', question_id: 'q5', description: 'Emotion recognition at work / education' },
    { template: 'biometric_categorisation({6}).', question_id: 'q6', description: 'Sensitive biometric categorisation' },
    { template: 'rt_biometric_le({7}).', question_id: 'q7', description: 'Real-time remote biometric ID for law enforcement' },
    { template: 'gpai_model({8}).', question_id: 'q8', description: 'General-purpose AI model' },
    { template: 'systemic({9}).', question_id: 'q9', description: 'Systemic-risk GPAI' },
    { template: 'annex_i_safety({10}).', question_id: 'q10', description: 'Annex I safety component' },
    { template: 'annex_iii_use({11}).', question_id: 'q11', description: 'Annex III high-risk use' },
    { template: 'art6_3_exempt({12}).', question_id: 'q12', description: 'Article 6(3) derogation' },
    { template: 'art50_transparency({13}).', question_id: 'q13', description: 'Article 50 transparency trigger' },
  ],
  validations: [
    { rule: "prohibited :- manipulative('yes').", description: 'Prohibited under Article 5(1)(a)-(b)', operators_used: [':-'] },
    { rule: "prohibited :- social_scoring('yes').", description: 'Prohibited under Article 5(1)(c)', operators_used: [':-'] },
    { rule: "prohibited :- facial_scraping('yes').", description: 'Prohibited under Article 5(1)(e)', operators_used: [':-'] },
    { rule: "prohibited :- emotion_workplace('yes').", description: 'Prohibited under Article 5(1)(f)', operators_used: [':-'] },
    { rule: "prohibited :- biometric_categorisation('yes').", description: 'Prohibited under Article 5(1)(g)', operators_used: [':-'] },
    { rule: "prohibited :- rt_biometric_le('yes').", description: 'Prohibited under Article 5(1)(h)', operators_used: [':-'] },
    { rule: "gpai_systemic :- gpai_model('yes'), systemic('yes').", description: 'GPAI with systemic risk (Art. 51-55)', operators_used: [':-', ','] },
    { rule: "high_risk :- annex_i_safety('yes').", description: 'High-risk — Annex I safety component (Art. 6(1))', operators_used: [':-'] },
    { rule: "high_risk :- annex_iii_use('yes'), art6_3_exempt('no').", description: 'High-risk — Annex III use without Art. 6(3) derogation', operators_used: [':-', ','] },
    { rule: "limited_risk :- art50_transparency('yes').", description: 'Limited risk — Article 50 transparency', operators_used: [':-'] },
    { rule: "gpai_only :- gpai_model('yes').", description: 'General-purpose AI model obligations (Art. 53)', operators_used: [':-'] },
    { rule: "in_scope_system :- in_scope('yes').", description: 'Within scope of the AI Act', operators_used: [':-'] },
  ],
  queries: [
    { query: '?- prohibited.', validation_rule: 'prohibited', risk: 'prohibited',
      description: 'Prohibited practice (Article 5) — the system may not be placed on the market or used.' },
    { query: '?- gpai_systemic.', validation_rule: 'gpai_systemic', risk: 'gpai_systemic',
      description: 'General-purpose AI model with systemic risk (Articles 51-55).' },
    { query: '?- high_risk.', validation_rule: 'high_risk', risk: 'high',
      description: 'High-risk AI system (Article 6 / Annex III) — full Chapter III obligations apply.' },
    { query: '?- gpai_only.', validation_rule: 'gpai_only', risk: 'gpai',
      description: 'General-purpose AI model (Article 53) obligations apply.' },
    { query: '?- limited_risk.', validation_rule: 'limited_risk', risk: 'limited',
      description: 'Limited risk — Article 50 transparency obligations apply.' },
    { query: '?- in_scope_system.', validation_rule: 'in_scope_system', risk: 'in_scope',
      description: 'Within scope of the AI Act.' },
  ],
};

// Article 50 transparency obligations attached when limited_risk fires.
export const ARTICLE_50_OBLIGATIONS = [
  'Inform natural persons that they are interacting with an AI system (Art. 50(1)).',
  'Mark synthetic audio/image/video/text content as artificially generated in a machine-readable format (Art. 50(2)).',
  'Disclose deepfake content as artificially generated or manipulated (Art. 50(4)).',
  'Inform persons exposed to emotion-recognition or biometric-categorisation systems (Art. 50(3)).',
];

/**
 * Derive the primary risk level + basis from the passed[] returned by /api/validate
 * for CLASSIFY_FORM (passed is aligned with CLASSIFY_FORM.queries order).
 */
export function deriveClassification(passed: boolean[]): {
  riskLevel: RiskLevel;
  basis: string[];
  isGPAI: boolean;
  article50Obligations: string[];
} {
  const queries = CLASSIFY_FORM.queries as Required<FormQuery>[];
  const passedByRisk = new Map<string, string>(); // risk -> description
  queries.forEach((q, i) => {
    if (passed[i]) passedByRisk.set(String(q.risk), q.description);
  });

  const inScope = passedByRisk.has('in_scope');
  const isGPAI = passedByRisk.has('gpai') || passedByRisk.has('gpai_systemic');
  const article50Obligations = passedByRisk.has('limited') ? [...ARTICLE_50_OBLIGATIONS] : [];

  if (!inScope) {
    return { riskLevel: 'unclassified', basis: ['Outside the material scope of the AI Act (Article 3).'], isGPAI, article50Obligations };
  }

  // RISK_PRIORITY order, inlined to avoid a circular import.
  const priority: RiskLevel[] = ['prohibited', 'gpai_systemic', 'high', 'gpai', 'limited'];
  const basis: string[] = [];
  let riskLevel: RiskLevel = 'minimal';
  let chosen = false;
  for (const r of priority) {
    if (passedByRisk.has(r)) {
      if (!chosen) { riskLevel = r; chosen = true; }
      basis.push(passedByRisk.get(r)!);
    }
  }
  if (!chosen) basis.push('In scope but no prohibited / high-risk / GPAI / transparency trigger — minimal risk.');

  return { riskLevel, basis, isGPAI, article50Obligations };
}
