// LLM prompts for the EU AI Act module. Mirrors the strict JSON form schema used
// by src/app/(main)/api/generate/route.ts, adapted for AI Act articles instead of
// CFR codes + warning letters.

export const AI_ACT_GENERATE_SYSTEM = `You are a regulatory-compliance engineer who compiles EU AI Act provisions into an executable Tau-Prolog validation form.

You will be given:
- An AI Act provision (article/annex code + full legal text).
- Optional interpretive guidance documents (Commission guidelines, GPAI Code of Practice notes).
- Optionally, an existing form to extend (avoid duplicating its questions).

Produce a single JSON object (and nothing else) with this exact shape:
{
  "questions": [{ "id": "q1", "type": "SELECT" | "CHECKBOX" | "NUMERIC", "text": "...", "options"?: ["..."], "range"?: {"min": 0, "max": 0}, "reference": "Art. 50(1)" }],
  "facts": [{ "template": "predicate({3}).", "question_id": "q3", "description": "..." }],
  "validations": [{ "rule": "rule_name(V) :- fact(V), V == 'yes'.", "description": "...", "operators_used": [":-", ",", "=="] }],
  "queries": [{ "query": "?- rule_name({1}).", "description": "Validates that ...", "validation_rule": "rule_name" }]
}

Rules:
- Use ONLY input types SELECT (yes/no or enumerations), CHECKBOX (multiple selection), or NUMERIC. Never BOOLEAN or TEXT.
- Each "{i}" placeholder refers to the question at position i (1-based) in the "questions" array; it is substituted with the user's answer at validation time.
- SELECT/CHECKBOX answers become single-quoted atoms or Prolog lists — compare with == against quoted atoms (e.g. V == 'yes'). NUMERIC answers are bare numbers — compare with arithmetic operators.
- Author one validation rule + one query per discrete legal requirement so each requirement gets its own pass/fail verdict. The query "description" must state, in plain English, what compliant looks like.
- Avoid non-evaluable comparisons (do not compare an atom with a number).
- Cover the provision exhaustively but do not invent obligations beyond the supplied text/guidance.
- Output strictly valid JSON inside a single \`\`\`json fenced block.`;

export function aiActGenerateUserPrompt(args: {
  articleCode: string;
  articleText: string;
  guidanceDocs?: { title: string; content: string }[];
  existingForm?: string;
}): string {
  const guidance = (args.guidanceDocs || [])
    .map((g, i) => `--- Guidance ${i + 1}: ${g.title} ---\n${g.content}`)
    .join('\n\n');
  return [
    `AI Act provision: ${args.articleCode}`,
    `\n=== PROVISION TEXT ===\n${args.articleText}`,
    guidance ? `\n=== INTERPRETIVE GUIDANCE ===\n${guidance}` : '',
    args.existingForm ? `\n=== EXISTING FORM (extend, do not duplicate) ===\n${args.existingForm}` : '',
    `\nGenerate the validation form JSON for this provision now.`,
  ].filter(Boolean).join('\n');
}

export const CROSS_REGULATION_SYSTEM = `You are a multi-jurisdiction compliance analyst. Given an AI system's profile and two regulatory regimes (US FDA 21 CFR and the EU AI Act), produce a structured overlap analysis.

Return a single JSON object (and nothing else) inside a \`\`\`json fenced block:
{
  "overlaps": [{ "topic": "...", "fda": "21 CFR ...", "aiAct": "Art. ... / Annex ...", "note": "what satisfies both" }],
  "fdaOnly": [{ "requirement": "...", "reference": "21 CFR ..." }],
  "aiActOnly": [{ "requirement": "...", "reference": "Art. ..." }],
  "summary": "2-3 sentence executive summary"
}
Be concrete and cite specific articles/sections. Do not invent requirements.`;

export function crossRegulationUserPrompt(systemProfile: string): string {
  return `AI system profile:\n${systemProfile}\n\nProduce the FDA x EU AI Act overlap analysis JSON now.`;
}
