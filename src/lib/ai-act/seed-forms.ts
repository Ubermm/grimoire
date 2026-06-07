// Hand-authored seed validation forms (questions/facts/validations/queries) for
// the core AI Act provisions. These are the deterministic "compiled regulation"
// rule sets. Users can later regenerate/edit them via the hybrid authoring flow.
// Each form follows the regulation-agnostic contract consumed by /api/validate.
import type { ValidationForm } from './schema';

const yn = ['yes', 'no'];
const ynNa = ['Yes', 'No', 'Not applicable'];

// Article 5 — prohibited-practice screening. A query PASSES when the system is
// clear of that prohibition (practice = 'no'); a FAILED query flags a prohibited use.
const ART_5: ValidationForm = {
  questions: [
    { id: 'q1', type: 'SELECT', options: yn, reference: 'Art. 5(1)(a)', text: 'Does the system deploy subliminal, purposefully manipulative or deceptive techniques that materially distort behaviour and could cause significant harm?' },
    { id: 'q2', type: 'SELECT', options: yn, reference: 'Art. 5(1)(b)', text: 'Does it exploit vulnerabilities (age, disability, social or economic situation) to materially distort behaviour causing harm?' },
    { id: 'q3', type: 'SELECT', options: yn, reference: 'Art. 5(1)(c)', text: 'Does it perform social scoring leading to detrimental or unjustified treatment?' },
    { id: 'q4', type: 'SELECT', options: yn, reference: 'Art. 5(1)(d)', text: 'Does it predict the risk of a person committing a criminal offence based solely on profiling or personality traits?' },
    { id: 'q5', type: 'SELECT', options: yn, reference: 'Art. 5(1)(e)', text: 'Does it create or expand facial-recognition databases through untargeted scraping of facial images?' },
    { id: 'q6', type: 'SELECT', options: yn, reference: 'Art. 5(1)(f)', text: 'Does it infer emotions in the workplace or education institutions (other than for medical or safety reasons)?' },
    { id: 'q7', type: 'SELECT', options: yn, reference: 'Art. 5(1)(g)', text: 'Does it use biometric categorisation to infer sensitive attributes?' },
    { id: 'q8', type: 'SELECT', options: yn, reference: 'Art. 5(1)(h)', text: 'Does it perform real-time remote biometric identification in public spaces for law enforcement outside the permitted exceptions?' },
  ],
  facts: [
    { template: "p_a({1}).", question_id: 'q1', description: 'subliminal/manipulative' },
    { template: "p_b({2}).", question_id: 'q2', description: 'exploits vulnerabilities' },
    { template: "p_c({3}).", question_id: 'q3', description: 'social scoring' },
    { template: "p_d({4}).", question_id: 'q4', description: 'predictive policing by profiling' },
    { template: "p_e({5}).", question_id: 'q5', description: 'facial scraping' },
    { template: "p_f({6}).", question_id: 'q6', description: 'emotion recognition at work/education' },
    { template: "p_g({7}).", question_id: 'q7', description: 'sensitive biometric categorisation' },
    { template: "p_h({8}).", question_id: 'q8', description: 'real-time remote biometric ID for LE' },
  ],
  validations: [
    { rule: "clear_a :- p_a('no').", description: 'No subliminal/manipulative techniques', operators_used: [':-'] },
    { rule: "clear_b :- p_b('no').", description: 'No exploitation of vulnerabilities', operators_used: [':-'] },
    { rule: "clear_c :- p_c('no').", description: 'No social scoring', operators_used: [':-'] },
    { rule: "clear_d :- p_d('no').", description: 'No predictive policing by profiling', operators_used: [':-'] },
    { rule: "clear_e :- p_e('no').", description: 'No untargeted facial scraping', operators_used: [':-'] },
    { rule: "clear_f :- p_f('no').", description: 'No emotion recognition at work/education', operators_used: [':-'] },
    { rule: "clear_g :- p_g('no').", description: 'No sensitive biometric categorisation', operators_used: [':-'] },
    { rule: "clear_h :- p_h('no').", description: 'No prohibited real-time remote biometric ID', operators_used: [':-'] },
  ],
  queries: [
    { query: '?- clear_a.', validation_rule: 'clear_a', description: 'Art. 5(1)(a): does not deploy subliminal/manipulative/deceptive techniques.' },
    { query: '?- clear_b.', validation_rule: 'clear_b', description: 'Art. 5(1)(b): does not exploit vulnerabilities.' },
    { query: '?- clear_c.', validation_rule: 'clear_c', description: 'Art. 5(1)(c): does not perform social scoring.' },
    { query: '?- clear_d.', validation_rule: 'clear_d', description: 'Art. 5(1)(d): no predictive policing based solely on profiling.' },
    { query: '?- clear_e.', validation_rule: 'clear_e', description: 'Art. 5(1)(e): no untargeted facial-image scraping.' },
    { query: '?- clear_f.', validation_rule: 'clear_f', description: 'Art. 5(1)(f): no emotion recognition in workplace/education.' },
    { query: '?- clear_g.', validation_rule: 'clear_g', description: 'Art. 5(1)(g): no sensitive biometric categorisation.' },
    { query: '?- clear_h.', validation_rule: 'clear_h', description: 'Art. 5(1)(h): no prohibited real-time remote biometric identification.' },
  ],
};

// Article 50 — transparency. Each obligation is satisfied when 'Yes' or 'Not applicable'.
const ART_50: ValidationForm = {
  questions: [
    { id: 'q1', type: 'SELECT', options: ynNa, reference: 'Art. 50(1)', text: 'If the system interacts directly with people, are they informed they are interacting with an AI system?' },
    { id: 'q2', type: 'SELECT', options: ynNa, reference: 'Art. 50(2)', text: 'If it generates synthetic audio/image/video/text, are outputs marked in a machine-readable format as artificially generated?' },
    { id: 'q3', type: 'SELECT', options: ynNa, reference: 'Art. 50(3)', text: 'If it is an emotion-recognition or biometric-categorisation system, are exposed persons informed of its operation?' },
    { id: 'q4', type: 'SELECT', options: ynNa, reference: 'Art. 50(4)', text: 'If it produces deep-fakes or public-interest text, is that content disclosed as artificially generated or manipulated?' },
  ],
  facts: [
    { template: "d1({1}).", question_id: 'q1', description: 'AI-interaction disclosure' },
    { template: "d2({2}).", question_id: 'q2', description: 'synthetic-content marking' },
    { template: "d3({3}).", question_id: 'q3', description: 'emotion/biometric disclosure' },
    { template: "d4({4}).", question_id: 'q4', description: 'deepfake disclosure' },
  ],
  validations: [
    { rule: "ok1 :- d1('Yes').", description: '', operators_used: [':-'] },
    { rule: "ok1 :- d1('Not applicable').", description: '', operators_used: [':-'] },
    { rule: "ok2 :- d2('Yes').", description: '', operators_used: [':-'] },
    { rule: "ok2 :- d2('Not applicable').", description: '', operators_used: [':-'] },
    { rule: "ok3 :- d3('Yes').", description: '', operators_used: [':-'] },
    { rule: "ok3 :- d3('Not applicable').", description: '', operators_used: [':-'] },
    { rule: "ok4 :- d4('Yes').", description: '', operators_used: [':-'] },
    { rule: "ok4 :- d4('Not applicable').", description: '', operators_used: [':-'] },
  ],
  queries: [
    { query: '?- ok1.', validation_rule: 'ok1', description: 'Art. 50(1): users are informed they interact with an AI system (or N/A).' },
    { query: '?- ok2.', validation_rule: 'ok2', description: 'Art. 50(2): synthetic content is machine-readable-marked (or N/A).' },
    { query: '?- ok3.', validation_rule: 'ok3', description: 'Art. 50(3): persons exposed to emotion/biometric systems are informed (or N/A).' },
    { query: '?- ok4.', validation_rule: 'ok4', description: 'Art. 50(4): deep-fake / public-interest text is disclosed (or N/A).' },
  ],
};

// Article 53 / GPAI Code of Practice — provider obligations. Query passes when met.
const GPAI_CH1: ValidationForm = {
  questions: [
    { id: 'q1', type: 'SELECT', options: yn, reference: 'Art. 53(1)(a)', text: 'Have you drawn up and kept up-to-date technical documentation of the model (training/testing process, evaluation results; at minimum Annex XI)?' },
    { id: 'q2', type: 'SELECT', options: yn, reference: 'Art. 53(1)(b)', text: 'Do you make information/documentation (at minimum Annex XII) available to downstream providers integrating the model?' },
    { id: 'q3', type: 'SELECT', options: yn, reference: 'Art. 53(1)(c)', text: 'Have you put in place a policy to comply with Union copyright law, including honouring Article 4(3) rights reservations (TDM opt-outs)?' },
    { id: 'q4', type: 'SELECT', options: yn, reference: 'Art. 53(1)(d)', text: 'Have you published a sufficiently detailed summary of the content used for training, per the AI Office template?' },
  ],
  facts: [
    { template: "g_a({1}).", question_id: 'q1', description: 'technical documentation' },
    { template: "g_b({2}).", question_id: 'q2', description: 'downstream information' },
    { template: "g_c({3}).", question_id: 'q3', description: 'copyright policy' },
    { template: "g_d({4}).", question_id: 'q4', description: 'training-content summary' },
  ],
  validations: [
    { rule: "has_a :- g_a('yes').", description: '', operators_used: [':-'] },
    { rule: "has_b :- g_b('yes').", description: '', operators_used: [':-'] },
    { rule: "has_c :- g_c('yes').", description: '', operators_used: [':-'] },
    { rule: "has_d :- g_d('yes').", description: '', operators_used: [':-'] },
  ],
  queries: [
    { query: '?- has_a.', validation_rule: 'has_a', description: 'Art. 53(1)(a): technical documentation is maintained.' },
    { query: '?- has_b.', validation_rule: 'has_b', description: 'Art. 53(1)(b): downstream-provider information is available.' },
    { query: '?- has_c.', validation_rule: 'has_c', description: 'Art. 53(1)(c): a copyright-compliance policy is in place.' },
    { query: '?- has_d.', validation_rule: 'has_d', description: 'Art. 53(1)(d): a training-content summary is published.' },
  ],
};

// Annex IV — documentation completeness. One yes/no per section; query passes when documented.
const ANNEX_IV: ValidationForm = {
  questions: Array.from({ length: 9 }, (_, i) => ({
    id: `q${i + 1}`, type: 'SELECT' as const, options: yn, reference: `Annex IV(${i + 1})`,
    text: [
      'Is the general description of the system documented (intended purpose, provider, version, interactions, user instructions)?',
      'Is the development process documented (methods, architecture, data requirements, human oversight, validation/testing, cybersecurity)?',
      'Is monitoring/functioning/control documented (capabilities, accuracy, foreseeable risks, oversight, input data)?',
      'Is the appropriateness of the performance metrics documented?',
      'Is the risk-management system (Article 9) documented?',
      'Are lifecycle changes documented?',
      'Are the harmonised standards applied (or alternative solutions) documented?',
      'Is the EU declaration of conformity (Article 47) included?',
      'Is the post-market monitoring system and plan (Article 72) documented?',
    ][i],
  })),
  facts: Array.from({ length: 9 }, (_, i) => ({ template: `sec${i + 1}({${i + 1}}).`, question_id: `q${i + 1}`, description: `Annex IV section ${i + 1}` })),
  validations: Array.from({ length: 9 }, (_, i) => ({ rule: `done${i + 1} :- sec${i + 1}('yes').`, description: '', operators_used: [':-'] })),
  queries: Array.from({ length: 9 }, (_, i) => ({ query: `?- done${i + 1}.`, validation_rule: `done${i + 1}`, description: `Annex IV section ${i + 1} is documented.` })),
};

export const SEED_FORMS: Record<string, ValidationForm> = {
  AIACT_ART_5: ART_5,
  AIACT_ART_50: ART_50,
  AIACT_GPAI_CH1: GPAI_CH1,
  AIACT_ANNEX_IV: ANNEX_IV,
};
