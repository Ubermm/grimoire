//@ts-nocheck
// Deep-validation form generation: hindsight questions derived from FDA warning
// letters that cite a CFR code. Two letter-batches are prompted in parallel,
// then mechanically deduplicated against the base form and each other (the
// model routinely ignores "don't repeat the form", and parallel batches can't
// see each other), then merged with positional re-indexing. Lives in lib/ so
// both /api/generate and diagnostics can use it (route files may only export
// handlers).
import { generateText } from 'ai';
import { AZURE } from '@/lib/ai';

// Function to extract JSON from text using regex
function extractJsonFromText(text: string): any {
  try {
    const jsonRegex = /(?<=```json\s?)([\s\S]*?)(?=\s?```)/;
    const match = text.match(jsonRegex);

    if (match && match[0]) {
      return JSON.parse(match[0].trim());
    }

    throw new Error('No JSON found between ```json and ```');
  } catch (error) {
    console.error('Failed to extract JSON:', error);
    throw error;
  }
}

// Generate validation questions for a batch of warning letters
async function generateValidationQuestions(previous: string, cfrSubsection: string, warningLetters: any[], prev: string = "") {

  const { text } = await generateText({
    model: AZURE("gpt-4o"),
    messages: [
      {
        role: 'user',
        content: `
                  Given three FDA warning letters generate validation questions for CFR 21 subsection for the regulatory compliance officer to answer
                  trying to assess the compliance of a firm for subsection ${cfrSubsection} only.

                  We are making a form to validate compliance and some questions are already asked, they are the following:
${previous + prev}

                  CRITICAL — DO NOT DUPLICATE: never restate, rephrase, generalize or specialize any question listed above. A question probing the same
                  practice as an existing one is worthless even with different wording. Every question must target a NEW, specific failure mode that the
                  warning letters describe — the concrete practice the FDA cited (e.g. "OOS investigations were not extended to other implicated batches"),
                  never the regulation's general requirement, which the form above already covers. Fewer, sharper questions beat restatements.

                  You need to generate granular validation questions, that are not already present in the above form, for the compliance officer to answer.
                  The questions should be generated for the CFR 21 subsection ${cfrSubsection} only, and you need to base your questions on the reasons that
                  the FDA has listed in the warning letters to the firms. In essence we are trying to add questions based on the reasons that the FDA has
                  listed in the warning letters to the firms, to help firms discvoer non-compliance using hindsight of the given FDA warning letters.

                  The three warning letters are: ${warningLetters[0].content} END OF FIRST LETTER, ${warningLetters[1].content} END OF SECOND LETTER, ${warningLetters[2].content} END OF THIRD LETTER.

                  Generate a JSON object that represents all compliance requirements as a structured form with validation rules. You must:

                1. Convert all requirements into questions that can be answered using only these input types:
                - SELECT: For yes/no or enumerated choices (including boolean conditions)
                - CHECKBOX: For multiple-choice selections
                - NUMERIC: For all numerical inputs

                2. Ensure type safety by:
                - Using SELECT instead of boolean inputs (e.g., options: ["yes", "no"])
                - Maintaining consistent types in comparisons (no mixing of types)
                - Using appropriate operators for each type
                - Adding range validations for NUMERIC inputs where applicable

                3. Create tau-Prolog facts and rules that:
                - Use numerical placeholders ({1}, {2}, etc.) corresponding to question IDs
                - Handle type compatibility in all comparisons
                - For SELECT inputs, compare the actual option values in rules (e.g., Value1 == "yes")
                - For NUMERIC inputs, use arithmetic comparison operators
                - For CHECKBOX inputs, handle multiple selections appropriately
                - Generated facts and rules should be consistent with tau-Prolog's requirements.

                4. Generate queries that:
                - Validate every requirement mentioned in the CFR subsection exhaustively and completely.
                - Include detailed descriptions of what specific requirement is being validated
                - Use consistent types throughout the validation chain
                - Start with ?- and end with .
                - Use valid, compatible data types to avoid non-evaluable comparisons in tau-Prolog (e.g., avoid direct comparisons between 'true' and 1).

                Generate valid a JSON object, with all fields and sub-fields present, even if they are empty.
                Take care of the rules.
                Output JSON Schema(STRICT):
                {
                    "questions": [
                        {
                            "id": "q1",
                            "type": "SELECT | CHECKBOX | NUMERIC",
                            "text": "question text",
                            "options": ["option1", "option2"],  // Required for SELECT/CHECKBOX
                            "range": {"min": number, "max": number},  // Required for NUMERIC
                            "cfr_reference": "specific part reference"
                        }
                    ],
                    "facts": [
                        {
                            "template": "fact_name({3}).",
                            "question_id": "q3",
                            "description": "what this fact represents",
                        }
                    ],
                    "validations": [
                        {
                            "rule": "validation_rule(Value1, Value2) :- fact1(Value1), fact2(Value2), Value1 == \"yes\".",
                            "description": "validates requirement from part (a)",
                            "operators_used": [":", "-", ",", "=="],
                        }
                    ],
                    "queries": [
                        {
                            "query": "?- validation_rule({1}, {2}).",
                            "description": "Validates that [specific requirement] from section [X] is met by checking [exact condition]",
                            "validation_rule": "validation_rule",
                        }
                    ]
                }

                Type Safety Requirements:
                1. SELECT inputs:
                - Always compare with exact option values (e.g., == "yes", == "no")
                - Use string comparison operators (==, \==)
                - Document option values in validation rules

                2. NUMERIC inputs:
                - Use arithmetic operators (>, <, >=, =<, =:=, =\=)
                - Include range validations where applicable
                - Ensure all numeric comparisons use compatible units

                3. CHECKBOX inputs:
                - Handle as lists of selected options
                - Use appropriate list operations for validation
                - Compare against specific option values

                remember {x} will be the placeholder for the answer to question x.
                Question ids MUST be q1, q2, q3… in order, each unique, and {x} must always refer to the question whose id is qx.
                The json schema is strict, also don't make the mistake of making it questions[i].question, it's questions[i].text
                according to the schema. Look at the schema carefully.
                Generate a valid json object with all fields and sub-fields present, even if they are empty.
                Begin the json block with \`\`\`json and end with \`\`\`
                Moreover the types of the questions are SELECT, CHECKBOX and NUMERIC. Always must be in uppercase.
                Include all fields mentioned in the schema for example for questions: cfr_reference, type, options, range, etc. Similarly mention every subfield for other types, like facts, queries etc.

                In essence we are trying to check if the firm has taken necessary steps to avoid getting rejected by the FDA for the reasons listed in the warning letters.
                For example if a firm has conducted invesitgations for Out-of-Specification(OOS) failures, they may not have done it for all batches, so you need to add a questions that checks that.
        `
      }
    ]
  });
  return text.replaceAll("\\\\", "REPLACE_FOR_BACKSLASH");
}

/* ------------------------------------------------------------------ dedup */
// Similarity = word-overlap containment: the fraction of the shorter
// question's content words found in the longer one.
function wordSet(s: string): Set<string> {
  return new Set(String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2));
}
export function isDuplicateText(a: string, b: string): boolean {
  const A = wordSet(a), B = wordSet(b);
  if (!A.size || !B.size) return false;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / Math.min(A.size, B.size) >= 0.6;
}

// Drop a batch's questions that duplicate any of `existingTexts`, compacting
// the whole {i} chain with them: facts that consumed a dropped question, then
// validations that called a dropped fact, then queries whose head predicate no
// longer has a definition. Safe pre-merge because the batch is self-contained;
// surviving {i} refs and qN ids are renumbered to the compacted positions.
export function pruneBatch(batch: any, existingTexts: string[]) {
  const qs = batch.questions || [];
  const dropPos = new Set<number>(); // 1-based, batch-local
  const dropIds = new Set<string>();
  qs.forEach((q: any, i: number) => {
    if (existingTexts.some((t) => isDuplicateText(t, q.text))) { dropPos.add(i + 1); if (q.id) dropIds.add(q.id); }
  });
  if (!dropPos.size) return batch;

  const remap: Record<number, number> = {};
  let n = 0;
  qs.forEach((_: any, i: number) => { if (!dropPos.has(i + 1)) remap[i + 1] = ++n; });
  const refs = (s: any) => Array.from(String(s || '').matchAll(/\{(\d+)\}/g)).map((m: any) => parseInt(m[1], 10));
  const touchesDropped = (s: any) => refs(s).some((p) => dropPos.has(p));
  const renum = (s: any) => String(s || '').replace(/\{(\d+)\}/g, (_: string, m: string) => `{${remap[parseInt(m, 10)] ?? m}}`);
  const predOf = (s: any) => String(s || '').match(/([a-z_][A-Za-z0-9_]*)\s*\(/)?.[1];

  const keptFacts: any[] = [];
  const droppedPreds: string[] = [];
  for (const f of batch.facts || []) {
    if (touchesDropped(f.template) || dropIds.has(f.question_id)) { const p = predOf(f.template); if (p) droppedPreds.push(p); }
    else keptFacts.push(f);
  }
  const callsDropped = (s: any) => droppedPreds.some((p) => new RegExp(`\\b${p}\\s*\\(`).test(String(s || '')));
  const keptVals = (batch.validations || []).filter((v: any) => !touchesDropped(v.rule) && !callsDropped(v.rule));
  const keptQueries = (batch.queries || []).filter((q: any) => {
    if (touchesDropped(q.query) || callsDropped(q.query)) return false;
    const head = String(q.query || '').replace(/^\s*\?-\s*/, '').match(/^([a-z_][A-Za-z0-9_]*)/)?.[1];
    return !!head && keptVals.some((v: any) => new RegExp(`\\b${head}\\s*\\(`).test(String(v.rule || '')));
  });

  const keptQs = qs.filter((_: any, i: number) => !dropPos.has(i + 1));
  const idMap: Record<string, string> = {};
  const questions = keptQs.map((q: any, i: number) => { const nid = `q${i + 1}`; if (q.id) idMap[q.id] = nid; return { ...q, id: nid }; });
  return {
    questions,
    facts: keptFacts.map((f: any) => ({ ...f, template: renum(f.template), question_id: idMap[f.question_id] || f.question_id })),
    validations: keptVals.map((v: any) => ({ ...v, rule: renum(v.rule) })),
    queries: keptQueries.map((q: any) => ({ ...q, query: renum(q.query) })),
  };
}

// Re-index a generated batch so question ids are positional (qN at position N
// — the invariant /api/validate's {i}→qN mapping assumes) and every {i}
// placeholder / question_id is shifted by the batch's offset in the merged form.
function reindexBatch(batch: any, offset: number) {
  const idMap: Record<string, string> = {};
  const questions = (batch.questions || []).map((q: any, i: number) => {
    const newId = `q${offset + i + 1}`;
    if (q.id) idMap[q.id] = newId;
    return { ...q, id: newId };
  });
  const shift = (s: any) => String(s || '').replace(/\{(\d+)\}/g, (_: string, n: string) => `{${parseInt(n, 10) + offset}}`);
  const facts = (batch.facts || []).map((f: any) => ({
    ...f,
    template: shift(f.template),
    question_id: idMap[f.question_id] || f.question_id,
  }));
  const validations = (batch.validations || []).map((v: any) => ({ ...v, rule: shift(v.rule) }));
  const queries = (batch.queries || []).map((q: any) => ({ ...q, query: shift(q.query) }));
  return { questions, facts, validations, queries };
}

// Merge two independently-numbered batches: batch 2's questions, placeholders
// and question_ids are shifted past batch 1 instead of colliding.
function mergeJsonResults(batch1: any, batch2: any): any {
  const b1 = reindexBatch(batch1, 0);
  const b2 = reindexBatch(batch2, b1.questions.length);
  return {
    _v: 3, // merge-format version — older cached forms regenerate (v3 = deduped)
    questions: [...b1.questions, ...b2.questions],
    facts: [...b1.facts, ...b2.facts],
    validations: [...b1.validations, ...b2.validations],
    queries: [...b1.queries, ...b2.queries],
  };
}

// Current cache/merge format — /api/generate only serves caches at this version.
export const DEEP_FORM_VERSION = 3;

// The whole deep-form pipeline, auth/cache aside: prompt both letter batches in
// parallel with the base form's question texts as context, mechanically prune
// anything that still duplicates the base form (batch 1) or the base form plus
// batch 1's survivors (batch 2), then merge.
export async function generateDeepForm(cfrSubsection: string, warningLetters: any[], formJson: any) {
  let baseTexts: string[] = [];
  try {
    const parsed = typeof formJson === 'string' ? JSON.parse(formJson) : formJson;
    baseTexts = (parsed?.questions || []).map((q: any) => String(q.text || '')).filter(Boolean);
  } catch { /* no usable base form — generate without dedup context */ }
  const previous = baseTexts.length ? baseTexts.map((t, i) => `                  ${i + 1}. ${t}`).join('\n') : '                  (none yet)';

  // Split warning letters into two batches of three. The batches cover
  // DIFFERENT letters, so they run in parallel; cross-batch dedup happens
  // mechanically below instead of by serializing the calls. Batch 2 only
  // runs when it has a full three letters (the prompt indexes all three).
  const batch1 = warningLetters.slice(0, 3);
  const batch2 = warningLetters.slice(3, 6);

  const [response1, response2] = await Promise.all([
    generateValidationQuestions(previous, cfrSubsection, batch1, ""),
    batch2.length >= 3 ? generateValidationQuestions(previous, cfrSubsection, batch2, "") : Promise.resolve(null),
  ]);

  const json1 = extractJsonFromText(response1);
  const json2 = response2 ? extractJsonFromText(response2) : { questions: [], facts: [], validations: [], queries: [] };

  const pruned1 = pruneBatch(json1, baseTexts);
  const pruned2 = pruneBatch(json2, [...baseTexts, ...(pruned1.questions || []).map((q: any) => q.text)]);

  return mergeJsonResults(pruned1, pruned2);
}
