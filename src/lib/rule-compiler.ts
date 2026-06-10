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
- Design questions an auditor can answer in ONE entry: an aggregate yes/no, a count, or a date — NEVER a shape that requires enumerating items or team members one by one (ask "Are all QC team members female?" yes/no, not a per-member gender select).
- NEVER hardcode an answer into a fact (e.g. pred('yes').) — every fact template MUST consume the auditor's answer through a {i} placeholder, otherwise the rule can never react to what they say.
- EVERY predicate the validation body calls must be DEFINED: either an existing fact predicate from the form, or a NEW fact your fragment asserts (bound to a NEW question via {i}). If the rule needs information no existing question captures (e.g. the document's font), you MUST add a question for it — a rule calling an unasserted predicate can never run.
- The FIRST (pass) clause MUST have a body (:- …) that tests an asserted fact — a body-less pass clause would make the rule pass unconditionally.
- The clause MUST parse: balanced parens, every clause ends with a period.`;

// Split a Prolog source string into clauses on '.' boundaries, quote-aware so
// periods inside atoms ('21 CFR 211.22') and decimals (2.5) don't split.
function splitClauses(rule: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < rule.length; i++) {
    const ch = rule[i];
    if (ch === "'" && rule[i - 1] !== '\\') inQ = !inQ;
    cur += ch;
    if (!inQ && ch === '.' && (i + 1 >= rule.length || /\s/.test(rule[i + 1]))) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

// A tri-state validation is degenerate when any clause is a bare directive
// (starts with ':-'), or when a clause other than the final default lacks a
// body — both make the verdict independent of the auditor's answers. Returns
// an error string or null. ("head. :- body." parses fine as fact + directive,
// which is why the parse check alone can't catch this.)
function vacuousValidation(rule: string): string | null {
  const clauses = splitClauses(rule);
  if (!clauses.length) return 'The validation has no clauses.';
  for (const c of clauses) {
    if (c.startsWith(':-')) return `"${c.slice(0, 60)}" is a bare directive, not a clause — the head got separated from its body by a stray period.`;
  }
  for (let i = 0; i < clauses.length - 1; i++) {
    if (!clauses[i].includes(':-')) return `Clause "${clauses[i].slice(0, 80)}" has no body — only the FINAL default clause may be body-less; this one would return its verdict unconditionally.`;
  }
  return null;
}

// Closed-world check: every predicate called in a validation body or query
// must be defined somewhere — as a fact template's head or a validation
// clause's head. Tau-prolog parses programs with undefined predicates happily
// and only throws existence_error at query time, so this is the only place a
// rule like "assess_x(...) :- font('serif')." (where nothing ever asserts
// font/1) can be caught. Returns the undefined predicate names.
const PROLOG_BUILTINS = new Set([
  'member', 'memberchk', 'append', 'length', 'nth0', 'nth1', 'sort', 'msort', 'reverse', 'last',
  'is', 'true', 'fail', 'false', 'between', 'succ', 'abs', 'atom', 'number', 'integer', 'var', 'nonvar',
  'atom_length', 'atom_string', 'number_codes', 'atom_codes', 'findall', 'forall', 'not', 'write', 'nl',
]);
export function undefinedPredicates(form: any): string[] {
  const defined = new Set<string>();
  for (const f of form.facts || []) {
    const p = String(f.template || '').match(/([a-z_][A-Za-z0-9_]*)\s*\(/)?.[1];
    if (p) defined.add(p);
  }
  for (const v of form.validations || []) {
    for (const clause of splitClauses(String(v.rule || ''))) {
      const head = clause.match(/^\s*([a-z_][A-Za-z0-9_]*)\s*\(/)?.[1];
      if (head) defined.add(head);
    }
  }
  const missing = new Set<string>();
  const scanBody = (body: string) => {
    const clean = String(body).replace(/'[^']*'/g, "''").replace(/"[^"]*"/g, '""');
    for (const m of clean.matchAll(/([a-z_][A-Za-z0-9_]*)\s*\(/g)) {
      if (!defined.has(m[1]) && !PROLOG_BUILTINS.has(m[1])) missing.add(m[1]);
    }
  };
  for (const v of form.validations || []) {
    for (const clause of splitClauses(String(v.rule || ''))) {
      const i = clause.indexOf(':-');
      if (i >= 0) scanBody(clause.slice(i + 2));
    }
  }
  for (const q of form.queries || []) scanBody(String(q.query || '').replace(/^\s*\?-\s*/, ''));
  return Array.from(missing);
}

// Reject degenerate fragments the parse-check can't catch: a fact that hardcodes
// a value (no {i} → the rule can never react to an answer), a fact with no
// question to bind, or a validation whose non-final clause has no body
// (→ the rule passes unconditionally). The error string is fed back to the
// model on retry.
function fragmentProblems(fragment: any): string | null {
  const qs = fragment.questions || [];
  const facts = fragment.facts || [];
  for (const f of facts) {
    const t = String(f.template || '');
    if (!/\{\d+\}/.test(t)) return `Fact "${t.slice(0, 80)}" hardcodes a value — every fact template must consume the auditor's answer via a {i} placeholder.`;
  }
  if (facts.length && !qs.length) return 'The fragment declares facts but no new questions — existing questions already have facts; reference their {i} positions inside the validation instead of emitting new facts.';
  for (let i = 0; i < facts.length; i++) {
    const qi = facts[i]._qIndex ?? i;
    if (!qs[qi]) return `Fact ${i} does not bind to any fragment question (_qIndex ${qi} out of range).`;
  }
  return vacuousValidation(String(fragment.validation?.rule || ''));
}

export async function compileEnglishRule(nl: string, form: any, regText?: string): Promise<{ form: any; attempts: number; errors: string[]; description: string }> {
  const existingQs = (form.questions || []).map((q: any, i: number) => `  {${i + 1}} [${q.type}] ${q.text}${q.options ? ` (options: ${q.options.join('/')})` : ''}`).join('\n') || '  (none yet)';
  const existingRules = (form.queries || []).map((q: any) => `  - ${q.description}`).join('\n') || '  (none yet)';
  const baseUser = `Regulation context:\n${(regText || '(not provided)').slice(0, 2500)}\n\nExisting questions (refer to these by their {i} number; only add NEW ones you actually need):\n${existingQs}\n\nExisting rules (do not duplicate):\n${existingRules}\n\nCompile this rule:\n"""\n${nl}\n"""`;

  const errors: string[] = [];
  let last = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    const user = attempt === 1 ? baseUser
      : `${baseUser}\n\nYour previous JSON was rejected:\n${last}\nProblem: ${errors[errors.length - 1]}\nReturn corrected STRICT JSON only.`;
    const text = await complete(COMPILE_SYSTEM, user);
    const fragment = extractJSON(text);
    if (!fragment || !fragment.query || !fragment.validation) { errors.push('Model did not return a valid fragment.'); last = text.slice(0, 400); continue; }
    const degenerate = fragmentProblems(fragment);
    if (degenerate) { errors.push(degenerate); last = JSON.stringify(fragment).slice(0, 400); continue; }
    const merged = mergeFragment(form, fragment);
    // Closed-world gate: the fragment may not call predicates nothing asserts.
    // Compared against the base form's own gaps so pre-existing template debt
    // doesn't block new rules.
    const before = new Set(undefinedPredicates(form));
    const introduced = undefinedPredicates(merged).filter((p) => !before.has(p));
    if (introduced.length) {
      errors.push(`Your rule calls ${introduced.map((p) => `${p}(...)`).join(', ')} but nothing asserts ${introduced.length > 1 ? 'them' : 'it'} — no existing fact and no new fact in your fragment. Add a NEW question that captures this information and a fact template binding it via {i}, then have the validation consume that fact.`);
      last = JSON.stringify(fragment).slice(0, 400);
      continue;
    }
    const probe = await checkParses(buildCheckProgram(merged));
    if (probe.ok) return { form: merged, attempts: attempt, errors, description: fragment.query.description || nl };
    errors.push(probe.error || 'parse error');
    last = JSON.stringify(fragment).slice(0, 400);
  }
  throw new Error(`Could not compile rule after 3 attempts: ${errors[errors.length - 1]}`);
}

/* ------------------------------------------------------------- debug bot */
// Mirrors /api/validate's convertToPrologValue exactly.
function toPrologValue(value: string, type: string): string {
  switch (type) {
    case 'BOOLEAN': return value.toLowerCase() === 'true' ? 'true' : 'false';
    case 'NUMERIC': return value;
    case 'SELECT':
    case 'TEXT': return `'${value.replace(/'/g, "\\'")}'`;
    case 'CHECKBOX': return `[${value.split(',').map((v) => `'${v.trim().replace(/'/g, "\\'")}'`).join(', ')}]`;
    default: return `'${value.replace(/'/g, "\\'")}'`;
  }
}

// The live program exactly as /api/validate assembles it for these responses.
export function buildLiveProgram(form: any, responses: Record<string, string>): string {
  let program = ':- use_module(library(lists)).\n';
  const subVals = (s: string) =>
    String(s).replaceAll('REPLACE_FOR_BACKSLASH', '\\').replaceAll('"', "'")
      .replace(/\{(\d+)\}/g, (_: string, m: string) => {
        const q = form.questions[parseInt(m, 10) - 1];
        return q && responses[q.id] ? toPrologValue(responses[q.id], q.type) : `{${m}}`;
      });
  for (const f of form.facts || []) {
    const q = (form.questions || []).find((x: any) => x.id === f.question_id);
    if (q?.disabled) continue;
    if (!q || !responses[f.question_id] || responses[f.question_id] === 'Does not apply') continue;
    program += subVals(f.template) + '\n';
  }
  for (const v of form.validations || []) {
    program += String(v.rule).replaceAll('REPLACE_FOR_BACKSLASH', '\\').replaceAll('"', "'") + '\n';
  }
  return program;
}

export function substituteQuery(form: any, responses: Record<string, string>, queryDef: any): string {
  return String(queryDef.query)
    .replaceAll('REPLACE_FOR_BACKSLASH', '\\').replaceAll('"', "'")
    .replace('?-', '').trim()
    .replace(/\{(\d+)\}/g, (_: string, m: string) => {
      const q = form.questions[parseInt(m, 10) - 1];
      return q && responses[q.id] ? toPrologValue(responses[q.id], q.type) : `{${m}}`;
    });
}

export function runQuery(program: string, queryText: string): Promise<{ answers: string[]; error?: string }> {
  return new Promise((resolve) => {
    try {
      const session = pl.create(50000);
      session.consult(program, {
        success: () => {
          session.query(queryText.endsWith('.') ? queryText : queryText + '.', {
            success: () => {
              const answers: string[] = [];
              const step = () => session.answer({
                success: (a: any) => { answers.push(session.format_answer(a)); answers.length < 3 ? step() : resolve({ answers }); },
                fail: () => resolve({ answers: answers.length ? answers : ['false'] }),
                error: (e: any) => resolve({ answers, error: String(e) }),
                limit: () => resolve({ answers, error: 'inference limit' }),
              });
              step();
            },
            error: (e: any) => resolve({ answers: [], error: String(e) }),
          });
        },
        error: (e: any) => resolve({ answers: [], error: String(e) }),
      });
    } catch (e: any) { resolve({ answers: [], error: String(e?.message || e) }); }
  });
}

function verdictOf(answers: string[], isStatus: boolean): { status: string; reason?: string } {
  if (isStatus) {
    const ans = answers.find((a) => /Status\s*=/.test(a)) || answers[0] || '';
    const sm = ans.match(/Status\s*=\s*(pass|fail|escalate)/i);
    const rm = ans.match(/Reason\s*=\s*'([^']*)'/);
    return { status: sm ? sm[1].toLowerCase() : 'fail', reason: rm?.[1] };
  }
  return { status: answers[0] === 'true.' || answers[0] === 'true' ? 'pass' : 'fail' };
}

const DEBUG_SYSTEM = `You are the GRIMOIRE/1 debug bot: you diagnose and repair Prolog rules inside a grimoire validation form run by Tau-Prolog.

HOW VALUES ARRIVE (critical — most bugs live here): responses are substituted into {i} placeholders ({i} = the i-th question, 1-based). BOOLEAN → bare true/false. SELECT/TEXT/DATE → the EXACT option string, single-quoted, CASE-SENSITIVE (option "Female" arrives as 'Female', never 'female'). CHECKBOX → a list of quoted options (test with member/2). NUMERIC → bare number. A rule comparing against an atom that is not EXACTLY one of the question's option strings can never succeed.

Tri-state rules define assess_<slug>(Status, Reason) clauses evaluated top-down: pass first, escalate next, a body-less fail clause as default. Never use 'not' — use \\+. Every clause ends with a period.

You receive the form slice, the live program, the failing query, the user's responses, the engine verdict, and possibly human feedback. Diagnose WHY the verdict happened — name the precise mismatch (predicate, arity, quoting, casing, wrong option text, missing fact, clause order). Then, if the rule (not the user's honest answer) is at fault, propose a MINIMAL patch.

Output STRICT JSON only:
{
  "diagnosis": "<plain English, 2-4 sentences, name the exact mismatch>",
  "summary": "<one line: what the fix changes>",
  "fix": {
    "questions":   [ { "index": <0-based into form.questions>, "patch": { "text"?: "...", "options"?: [...], "type"?: "..." } } ],
    "facts":       [ { "index": <0-based into form.facts>, "template": "<corrected template, keep {i} refs>" } ],
    "validations": [ { "index": <0-based into form.validations>, "rule": "<corrected clauses>" } ],
    "queries":     [ { "index": <0-based into form.queries>, "query"?: "...", "description"?: "..." } ]
  } | null
}

PATCH RULES — fix whichever layer is actually wrong:
- NEVER hardcode an answer into a fact template (e.g. pred('yes').) — facts must keep their {i} placeholder so they consume the auditor's answer. NEVER give a tri-state rule a body-less FIRST clause — it would return that verdict unconditionally.
- NEVER repurpose an existing fact for different data (renaming its predicate breaks every validation that calls it, and its {i} still feeds it a different question's answer). If a rule calls a predicate nothing asserts, rewrite the RULE to consume facts that exist — you cannot add questions or facts.
- If the Prolog merely mismatches the form's option strings (casing, quoting, wrong atom), fix the PROLOG to match the existing options.
- If the QUESTION captures data in a shape an auditor cannot reasonably provide — e.g. enumerating an attribute per member of a large team, or free text where a yes/no or a count belongs — RESHAPE the question: rewrite its text/type/options so ONE answer captures the aggregate (a SELECT like "Are all QC team members female?" with options yes/no, or a NUMERIC count), and rewrite the fact template and validation to consume the new shape. You cannot ADD questions — work within the existing ones; prefer a single aggregate SELECT when only one question is available.
- NEVER renumber or remove questions; NEVER change {i} references to different positions; keep ids unchanged. Omit arrays you don't patch. fix: null when the verdict is actually correct (then say so in the diagnosis).`;

export async function debugRule(
  form: any,
  responses: Record<string, string>,
  queryIndex: number,
  feedback?: string,
  priorDiagnosis?: string,
): Promise<{ diagnosis: string; summary?: string; form?: any; verification?: any; attempts: number }> {
  const queryDef = (form.queries || [])[queryIndex];
  if (!queryDef) throw new Error('No such query.');
  const isStatus = queryDef.mode === 'status' || /\bStatus\b/.test(queryDef.query);

  const liveProgram = buildLiveProgram(form, responses);
  const liveQuery = substituteQuery(form, responses, queryDef);
  const current = await runQuery(liveProgram, liveQuery);
  const currentVerdict = current.error ? { status: 'error', reason: current.error } : verdictOf(current.answers, isStatus);

  const qIndex = (form.questions || []).map((q: any, i: number) =>
    `  [${i}] {${i + 1}} id=${q.id} [${q.type}${q.disabled ? ' · DISABLED' : ''}] ${String(q.text).slice(0, 140)}${q.options ? ` (options: ${q.options.join(' / ')})` : ''} → answered: ${responses[q.id] ?? '(blank)'}`).join('\n');
  const fIndex = (form.facts || []).map((f: any, i: number) => `  [${i}] (${f.question_id}) ${String(f.template).slice(0, 200)}`).join('\n');
  const vIndex = (form.validations || []).map((v: any, i: number) => `  [${i}] ${String(v.rule).slice(0, 400)}`).join('\n');

  const baseUser = `FORM QUESTIONS (index, {position}, id, type, options, current answer):\n${qIndex}\n\nFACT TEMPLATES:\n${fIndex}\n\nVALIDATIONS:\n${vIndex}\n\nFAILING QUERY [index ${queryIndex}]: ${queryDef.query}\nDescription: ${queryDef.description || '(none)'}\n\nLIVE PROGRAM (as executed):\n${liveProgram.slice(0, 3500)}\n\nSUBSTITUTED QUERY: ${liveQuery}\nENGINE VERDICT: ${currentVerdict.status}${currentVerdict.reason ? ` — ${currentVerdict.reason}` : ''}${current.error ? ` (engine error: ${current.error})` : ''}` +
    (priorDiagnosis ? `\n\nYOUR PREVIOUS DIAGNOSIS:\n${priorDiagnosis}` : '') +
    (feedback ? `\n\nHUMAN FEEDBACK (what the auditor actually intends):\n"""${feedback}"""` : '');

  const errors: string[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    const user = attempt === 1 ? baseUser
      : `${baseUser}\n\nYour previous patch failed verification: ${errors[errors.length - 1]}\nReturn corrected STRICT JSON only.`;
    const out = extractJSON<any>(await complete(DEBUG_SYSTEM, user, 1400));
    if (!out?.diagnosis) { errors.push('Model did not return a diagnosis.'); continue; }
    if (!out.fix) return { diagnosis: out.diagnosis, summary: out.summary, attempts: attempt };

    // Degenerate-patch gates: a fact may never lose its {i} placeholder
    // (hardcoding the answer makes the rule blind to the form), and a patched
    // tri-state rule may never begin with a body-less clause (it would return
    // that verdict unconditionally).
    const hardcoded = (out.fix.facts || []).find((p: any) => {
      const orig = String((form.facts || [])[p.index]?.template || '');
      return /\{\d+\}/.test(orig) && !/\{\d+\}/.test(String(p.template || ''));
    });
    if (hardcoded) { errors.push(`Your fact patch "${String(hardcoded.template).slice(0, 80)}" dropped the {i} placeholder — the fact must keep consuming the auditor's answer.`); continue; }
    const vacuous = (out.fix.validations || [])
      .map((p: any) => (/\bassess_/.test(String(p.rule || '')) ? vacuousValidation(String(p.rule || '')) : null))
      .find(Boolean);
    if (vacuous) { errors.push(`Your validation patch is degenerate: ${vacuous}`); continue; }

    // Apply the patch to a clone.
    const patched = {
      ...form,
      questions: (form.questions || []).map((q: any, i: number) => {
        const p = (out.fix.questions || []).find((x: any) => x.index === i);
        return p ? { ...q, ...(p.patch || {}) } : q;
      }),
      facts: (form.facts || []).map((f: any, i: number) => {
        const p = (out.fix.facts || []).find((x: any) => x.index === i);
        return p ? { ...f, template: p.template } : f;
      }),
      validations: (form.validations || []).map((v: any, i: number) => {
        const p = (out.fix.validations || []).find((x: any) => x.index === i);
        return p ? { ...v, rule: p.rule } : v;
      }),
      queries: (form.queries || []).map((q: any, i: number) => {
        const p = (out.fix.queries || []).find((x: any) => x.index === i);
        return p ? { ...q, ...(p.query ? { query: p.query } : {}), ...(p.description ? { description: p.description } : {}) } : q;
      }),
    };

    // Closed-world gate: the patch may not break the program's predicate graph
    // (e.g. renaming a fact other validations still call, or calling a
    // predicate nothing asserts).
    const beforeMissing = new Set(undefinedPredicates(form));
    const introduced = undefinedPredicates(patched).filter((p) => !beforeMissing.has(p));
    if (introduced.length) {
      errors.push(`Your patch leaves ${introduced.map((p) => `${p}(...)`).join(', ')} undefined — either it renamed a fact some validation still calls, or it calls a predicate nothing asserts. Patch the consumers together with the fact, and never repurpose an existing fact for a different question.`);
      continue;
    }

    // Verify: parse-check, then re-run the target query live.
    const probe = await checkParses(buildCheckProgram(patched));
    if (!probe.ok) { errors.push(`parse error: ${probe.error}`); continue; }
    const rerun = await runQuery(buildLiveProgram(patched, responses), substituteQuery(form, responses, patched.queries[queryIndex]));
    const verdict = rerun.error ? { status: 'error', reason: rerun.error } : verdictOf(rerun.answers, isStatus);
    // A repaired rule must at least execute: an engine error after the patch
    // means the repair is wrong (or incomplete) — retry with the error in hand.
    if (verdict.status === 'error') {
      errors.push(`After your patch the query still throws: ${String(verdict.reason).slice(0, 200)}. The patch must leave the target query executable.`);
      continue;
    }
    return {
      diagnosis: out.diagnosis,
      summary: out.summary,
      form: patched,
      verification: { parses: true, before: currentVerdict, after: verdict },
      attempts: attempt,
    };
  }
  throw new Error(`Debug failed after 3 attempts: ${errors[errors.length - 1] || 'no usable output'}`);
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
