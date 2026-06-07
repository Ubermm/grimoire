// P0/P3 smoke test for the EU AI Act module. Run: npx tsx scripts/smoke-ai-act.ts
// 1) connects to the Grimoire DB and counts the new AI Act collections
// 2) runs the deterministic classification Prolog on canned inputs and asserts verdicts
import fs from 'fs';
import { createRequire } from 'module';
import mongoose from 'mongoose';

// Tau-Prolog (via inference.ts) uses CommonJS require under the hood.
(globalThis as any).require = createRequire(import.meta.url);

// Minimal .env loader (dotenv was removed from the project).
const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

// Replicate the /api/validate program assembly so we test the real form + engine.
function convert(value: string, type: string): string {
  if (type === 'NUMERIC') return value;
  if (type === 'CHECKBOX') return `[${value.split(',').map((v) => `'${v.trim()}'`).join(', ')}]`;
  return `'${value.replace(/'/g, "\\'")}'`;
}

function buildProgram(form: any, responses: Record<string, string>): string {
  let program = ':- use_module(library(lists)).\n';
  for (const fact of form.facts) {
    const q = form.questions.find((x: any) => x.id === fact.question_id);
    if (!q || !responses[fact.question_id]) continue;
    const t = fact.template.replace(/\{(\d+)\}/g, (_: string, m: string) => {
      const idx = parseInt(m, 10) - 1;
      const qq = form.questions[idx];
      return convert(responses[qq.id], qq.type);
    });
    program += t + '\n';
  }
  for (const v of form.validations) program += v.rule + '\n';
  return program;
}

// Build a full set of "no" responses, then override.
function answers(overrides: Record<string, string>): Record<string, string> {
  const base: Record<string, string> = {};
  for (let i = 1; i <= 13; i++) base[`q${i}`] = 'no';
  return { ...base, ...overrides };
}

async function main() {
  let failures = 0;

  // ---- 1. DB connectivity + new collections ----
  console.log('=== DB connectivity ===');
  await mongoose.connect(env.MONGODB_URI, { dbName: 'Grimoire' } as any);
  console.log('connected ✓');
  const { executePrologQueries } = await import('../src/lib/ai/inference');
  const { CLASSIFY_FORM, deriveClassification } = await import('../src/lib/ai-act/classify-form');

  for (const c of ['ai_act_regulations', 'ai_act_forms', 'ai_act_audits', 'aisystems']) {
    const n = await mongoose.connection.db.collection(c).countDocuments().catch(() => 0);
    console.log(`  ${c}: ${n} docs`);
  }

  // ---- 2. Seeded validation forms (compiled-regulation rule sets) ----
  console.log('\n=== Seeded forms ===');
  const formCases: { code: string; responses: Record<string, string>; expectAllPass: boolean }[] = [
    { code: 'AIACT_ART_5', responses: Object.fromEntries(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map((q) => [q, 'no'])), expectAllPass: true },
    { code: 'AIACT_ART_5', responses: { ...Object.fromEntries(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'].map((q) => [q, 'no'])), q3: 'yes' }, expectAllPass: false },
    { code: 'AIACT_ART_50', responses: Object.fromEntries(['q1', 'q2', 'q3', 'q4'].map((q) => [q, 'Not applicable'])), expectAllPass: true },
    { code: 'AIACT_GPAI_CH1', responses: Object.fromEntries(['q1', 'q2', 'q3', 'q4'].map((q) => [q, 'yes'])), expectAllPass: true },
    { code: 'AIACT_GPAI_CH1', responses: { q1: 'yes', q2: 'yes', q3: 'no', q4: 'yes' }, expectAllPass: false },
    { code: 'AIACT_ANNEX_IV', responses: Object.fromEntries(Array.from({ length: 9 }, (_, i) => [`q${i + 1}`, 'yes'])), expectAllPass: true },
  ];
  for (const fc of formCases) {
    const doc = await mongoose.connection.db.collection('ai_act_forms').findOne({ FormCode: fc.code });
    if (!doc) { console.log(`  [FAIL] ${fc.code}: not seeded`); failures++; continue; }
    const form = JSON.parse(doc.FormText);
    const program = buildProgram(form, fc.responses);
    const queries = form.queries.map((q: any) => q.query.replace('?-', '').trim());
    const results = await executePrologQueries(program, queries);
    const passed = results.map((r: any) => r.answers.length > 0 && (r.answers[0] === 'true.' || r.answers[0] === 'true'));
    const allPass = passed.every(Boolean);
    const ok = allPass === fc.expectAllPass;
    if (!ok) failures++;
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${fc.code} (${fc.expectAllPass ? 'compliant' : 'non-compliant'}): ${passed.filter(Boolean).length}/${passed.length} passed`);
  }

  await mongoose.disconnect();

  // ---- 3. Classification Prolog ----
  console.log('\n=== Classification Prolog ===');

  const cases: { name: string; responses: Record<string, string>; expect: string }[] = [
    { name: 'social scoring -> prohibited', responses: answers({ q1: 'yes', q3: 'yes' }), expect: 'prohibited' },
    { name: 'Annex III hiring tool -> high', responses: answers({ q1: 'yes', q11: 'yes', q12: 'no' }), expect: 'high' },
    { name: 'Annex III but Art 6(3) derogation -> minimal', responses: answers({ q1: 'yes', q11: 'yes', q12: 'yes' }), expect: 'minimal' },
    { name: 'GPAI systemic -> gpai_systemic', responses: answers({ q1: 'yes', q8: 'yes', q9: 'yes' }), expect: 'gpai_systemic' },
    { name: 'GPAI only -> gpai', responses: answers({ q1: 'yes', q8: 'yes' }), expect: 'gpai' },
    { name: 'chatbot transparency -> limited', responses: answers({ q1: 'yes', q13: 'yes' }), expect: 'limited' },
    { name: 'plain in-scope -> minimal', responses: answers({ q1: 'yes' }), expect: 'minimal' },
    { name: 'out of scope -> unclassified', responses: answers({ q1: 'no' }), expect: 'unclassified' },
  ];

  for (const tc of cases) {
    const program = buildProgram(CLASSIFY_FORM, tc.responses);
    const queries = CLASSIFY_FORM.queries.map((q: any) => q.query.replace('?-', '').trim());
    const results = await executePrologQueries(program, queries);
    const passed = results.map((r: any) => r.answers.length > 0 && (r.answers[0] === 'true.' || r.answers[0] === 'true'));
    const { riskLevel, basis } = deriveClassification(passed);
    const ok = riskLevel === tc.expect;
    if (!ok) failures++;
    console.log(`  [${ok ? 'PASS' : 'FAIL'}] ${tc.name}: got "${riskLevel}" expected "${tc.expect}"${ok ? '' : '\n      basis: ' + JSON.stringify(basis)}`);
  }

  console.log(`\n${failures === 0 ? 'ALL SMOKE TESTS PASSED ✓' : failures + ' FAILURE(S) ✗'}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('SMOKE ERROR:', e); process.exit(1); });
