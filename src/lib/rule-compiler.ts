//@ts-nocheck
// Plain-English → Prolog rule compiler for grimoire validation forms. Ported from
// the company-brain compiler (NL→clause, parse-check + 3× retry, coverage scan)
// and adapted to grimoire's PREPROCESSED form-fragment model: a rule becomes a
// {question + fact template + named validation clause + tri-state query}, stored
// with {i} placeholders (1-indexed question position) and REPLACE_FOR_BACKSLASH.
import { generateText } from 'ai';
import { AZURE, customModel } from '@/lib/ai';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import pl from 'tau-prolog';
const listsMod = require('tau-prolog/modules/lists');
listsMod(pl);

/* --------------------------------------------------------------- LLM model */
async function complete(system: string, user: string, maxTokens = 900, temperature = 0.1): Promise<string> {
  try {
    const { text } = await generateText({ model: AZURE('gpt-4o'), messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature, maxTokens });
    return text;
  } catch {
    const { text } = await generateText({ model: customModel(DEFAULT_MODEL_NAME), messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature, maxTokens });
    return text;
  }
}

function extractFenced(text: string, lang?: string): string | null {
  const re = lang ? new RegExp('```' + lang + '\\s*([\\s\\S]*?)```', 'i') : /```\s*([\s\S]*?)```/;
  const m = text.match(re);
  return m ? m[1].trim() : null;
}
function extractJSON<T = any>(text: string): T | null {
  const fenced = extractFenced(text, 'json') ?? extractFenced(text);
  const raw = fenced ?? text;
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

/* ----------------------------------------------------- prolog parse-check */
function dummyFor(type: string): string {
  switch ((type || '').toUpperCase()) {
    case 'NUMERIC': return '0';
    case 'CHECKBOX': return "['x']";
    case 'BOOLEAN': return 'true';
    default: return "'x'"; // SELECT / TEXT / DATE
  }
}
// Assemble a runnable program from a form, substituting {i} with type-dummies so
// the clauses can be consulted (parse-checked) without user responses.
export function buildCheckProgram(form: any): string {
  let program = ':- use_module(library(lists)).\n';
  const sub = (s: string) =>
    String(s).replaceAll('REPLACE_FOR_BACKSLASH', '\\').replaceAll('"', "'")
      .replace(/\{(\d+)\}/g, (_: string, m: string) => {
        const q = form.questions[parseInt(m, 10) - 1];
        return dummyFor(q?.type);
      });
  for (const f of form.facts || []) program += sub(f.template) + '\n';
  for (const v of form.validations || []) program += sub(v.rule) + '\n';
  return program;
}
export function checkParses(program: string): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    try {
      const session = pl.create(10000);
      session.consult(program, { success: () => resolve({ ok: true }), error: (e: any) => resolve({ ok: false, error: String(e) }) });
    } catch (e: any) { resolve({ ok: false, error: String(e?.message || e) }); }
  });
}

/* ----------------------------------------------------------------- merge */
function uniqueId(form: any, base: string): string {
  const taken = new Set((form.questions || []).map((q: any) => q.id));
  let id = base, n = 1;
  while (taken.has(id)) id = `${base}_${n++}`;
  return id;
}
// Merge a compiled fragment into the form: append questions, re-index the
// fragment's {i} placeholders to the global question positions, ensure unique ids.
export function mergeFragment(form: any, fragment: any): any {
  const base = form.questions.length;
  const fragQs = (fragment.questions || []).map((q: any, i: number) => ({ ...q, id: uniqueId(form, q.id || `c${base + i + 1}`) }));
  const reindex = (s: string) => String(s).replace(/\{(\d+)\}/g, (_: string, m: string) => `{${parseInt(m, 10) + base}}`);
  const fragFacts = (fragment.facts || []).map((f: any, i: number) => ({
    ...f,
    template: reindex(f.template),
    question_id: fragQs[(f._qIndex ?? i)]?.id || fragQs[i]?.id || f.question_id,
  }));
  return {
    questions: [...form.questions, ...fragQs],
    facts: [...form.facts, ...fragFacts],
    validations: [...form.validations, ...(fragment.validation ? [fragment.validation] : [])],
    queries: [...form.queries, ...(fragment.query ? [fragment.query] : [])],
  };
}

/* --------------------------------------------------------- compile a rule */
const COMPILE_SYSTEM = `You compile ONE plain-English compliance rule into a fragment of a grimoire validation form for a Tau-Prolog engine.

A form is { questions, facts, validations, queries }. The auditor's rule may reference data already captured by EXISTING questions, or may need NEW questions to capture data.

Output STRICT JSON ONLY (no prose, no fences) in this exact shape:
{
  "questions": [ { "id": "c1", "type": "SELECT|CHECKBOX|NUMERIC|TEXT|DATE", "text": "plain question for the auditor", "options": ["yes","no"], "reference": "<citation>" } ],
  "facts":     [ { "template": "pred({1}).", "_qIndex": 0, "description": "what this fact means" } ],
  "validation":{ "rule": "<tri-state clauses>", "description": "what this rule checks" },
  "query":     { "query": "?- assess_<slug>(Status, Reason).", "validation_rule": "assess_<slug>", "description": "plain-English requirement", "mode": "status" }
}

RULES:
- questions: ONLY new questions this rule needs. {i} in a fact is 1-based over THIS fragment's questions (the merger re-indexes to global positions). _qIndex is the 0-based index of the fragment question the fact binds.
- SELECT/CHECKBOX/TEXT/DATE values arrive as single-quoted atoms (e.g. == 'yes'); CHECKBOX as a list (use member/2); NUMERIC as bare numbers (use =<,>=,<,>). Never use 'not' — use \\+.
- The validation MUST define a tri-state predicate. Emit clauses in priority order, e.g.:
    assess_<slug>(pass, 'reason text') :- <pass condition>.
    assess_<slug>(escalate, 'reason text') :- <needs-human condition>.
    assess_<slug>(fail, 'reason text').
  Status atoms: pass | fail | escalate. Reason is a short single-quoted atom restating the outcome. The final fail clause is the default (no body).
- Map intent: "must / required / compliant if" → pass condition; "violation / non-compliant if" → fail; "needs review / judgment / unclear" → escalate.
- Encode ONLY what the auditor stated. Do not invent thresholds or extra conditions. Use a unique <slug> (lowercase, underscores) derived from the rule.
- The clause MUST parse: balanced parens, every clause ends with a period.`;

export async function compileEnglishRule(nl: string, form: any, regText?: string): Promise<{ form: any; attempts: number; errors: string[]; description: string }> {
  const existingQs = (form.questions || []).map((q: any, i: number) => `  {${i + 1}} [${q.type}] ${q.text}${q.options ? ` (options: ${q.options.join('/')})` : ''}`).join('\n') || '  (none yet)';
  const existingRules = (form.queries || []).map((q: any) => `  - ${q.description}`).join('\n') || '  (none yet)';
  const baseUser = `Regulation context:\n${(regText || '(not provided)').slice(0, 2500)}\n\nExisting questions (refer to these by their {i} number; only add NEW ones you actually need):\n${existingQs}\n\nExisting rules (do not duplicate):\n${existingRules}\n\nCompile this rule:\n"""\n${nl}\n"""`;

  const errors: string[] = [];
  let last = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const user = attempt === 1 ? baseUser
      : `${baseUser}\n\nYour previous JSON produced a Prolog program that failed to parse:\n${last}\nError: ${errors[errors.length - 1]}\nReturn corrected STRICT JSON only.`;
    const text = await complete(COMPILE_SYSTEM, user);
    const fragment = extractJSON(text);
    if (!fragment || !fragment.query || !fragment.validation) { errors.push('Model did not return a valid fragment.'); last = text.slice(0, 400); continue; }
    const merged = mergeFragment(form, fragment);
    const probe = await checkParses(buildCheckProgram(merged));
    if (probe.ok) return { form: merged, attempts: attempt, errors, description: fragment.query.description || nl };
    errors.push(probe.error || 'parse error');
    last = JSON.stringify(fragment).slice(0, 400);
  }
  throw new Error(`Could not compile rule after 3 attempts: ${errors[errors.length - 1]}`);
}

/* ------------------------------------------------- contradiction/coverage */
const ANALYZE_SYSTEM = `You audit a grimoire validation form's rules for an auditor.

HOW THE ENGINE WORKS (critical): each rule is ONE predicate whose clauses are evaluated TOP-DOWN, and the FIRST matching clause wins — the priority order is pass, then escalate, then a default fail. So having several possible outcomes WITHIN a single rule is the INTENDED design, NOT a contradiction (only the first matching clause ever fires). NEVER flag a single rule's own pass / escalate / fail clauses, or a boundary value between them, as contradicting each other.

Find ONLY:
1. CONTRADICTIONS — TWO DIFFERENT rules that, for ONE specific concrete input, return genuinely conflicting verdicts (e.g. rule A → pass while rule B → fail for the same situation). You MUST be able to state the concrete input. Be conservative: if you cannot name a concrete input where two DISTINCT rules conflict, return none. Do not speculate.
2. COVERAGE GAPS — distinct requirements in the regulation text that no rule addresses.

Output STRICT JSON only (use empty arrays when there is nothing genuine to report):
{"contradictions":[{"a":"<rule A description>","b":"<rule B description>","why":"<the concrete input and why the two rules conflict>"}],"coverageGaps":["<plain english requirement>"]}`;

export async function analyzeForm(form: any, regText?: string): Promise<{ contradictions: any[]; coverageGaps: string[] }> {
  if (!(form.queries || []).length) return { contradictions: [], coverageGaps: [] };
  const rules = form.queries.map((q: any, i: number) => `  ${i + 1}. ${q.description}\n     ${(form.validations[i]?.rule || '').slice(0, 500)}`).join('\n');
  const user = `Regulation:\n${(regText || '(not provided)').slice(0, 2500)}\n\nRules:\n${rules}\n\nReturn strict JSON only.`;
  try {
    const out = extractJSON(await complete(ANALYZE_SYSTEM, user, 1200));
    return { contradictions: Array.isArray(out?.contradictions) ? out.contradictions : [], coverageGaps: Array.isArray(out?.coverageGaps) ? out.coverageGaps : [] };
  } catch { return { contradictions: [], coverageGaps: [] }; }
}
