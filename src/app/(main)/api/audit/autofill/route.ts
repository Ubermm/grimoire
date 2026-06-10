//@ts-nocheck
// Audit-wide, cited autofill: given a context dossier (text + uploaded files) and
// every question across all subsections, deduce as many answers as possible and
// return per-field { value, confidence, source } so the auditor can review and
// confirm. Regulation-agnostic — used by both FDA and AI Act audit run flows.
import { generateText } from 'ai';
import { auth } from '@/app/(auth)/auth';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { customModel } from '@/lib/ai';
import { canonicalizeAnswer } from '@/lib/autofill';

const SYSTEM = `You deduce answers to a compliance audit's questions from an auditor's context dossier (text and/or attached documents).

Return STRICT JSON ONLY, no prose, mapping fieldId → object:
{ "<fieldId>": { "value": "<answer>", "confidence": "high|medium|low", "source": "<short quote or where in the dossier this came from>" } }

Rules:
- Only include a field if the dossier genuinely supports an answer. OMIT fields you cannot ground — do not guess.
- "value" must match the field type: SELECT → exactly one of its options; CHECKBOX → a comma-separated subset of options; NUMERIC → a bare number; DATE → ISO (YYYY-MM-DD); yes/no questions → 'yes' or 'no'.
- "confidence": high = explicitly stated; medium = strongly implied; low = weak inference.
- "source": a brief grounding (a short quote or "<document>: <section>"). Keep it under ~120 chars.`;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    const { dossier, fields } = await request.json();
    if (!Array.isArray(fields) || fields.length === 0) return Response.json({});
    if (!dossier?.text && !(dossier?.files?.length)) return Response.json({});

    const fieldList = fields
      .map((f: any) => `- ${f.id} [${f.type}] ${f.question}${f.options?.length ? ` (options: ${f.options.join(' | ')})` : ''}`)
      .join('\n');

    const { text } = await generateText({
      model: customModel(DEFAULT_MODEL_NAME),
      messages: [
        { role: 'system', content: `${SYSTEM}\n\nQuestions to answer:\n${fieldList}` },
        {
          role: 'user',
          content: dossier.text || 'See attached documents.',
          experimental_attachments: (dossier.files || []).map((f: any) => ({ url: f.url, name: f.name, contentType: f.contentType })),
        },
      ],
    });

    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return Response.json({});
    let parsed: any;
    try { parsed = JSON.parse(m[0]); } catch { return Response.json({}); }

    // Keep only well-formed, grounded entries — and canonicalize each value
    // against the field's options so nothing the form can't accept gets stored.
    const out: Record<string, any> = {};
    for (const f of fields) {
      const e = parsed[f.id];
      if (e && typeof e === 'object' && e.value != null && String(e.value).trim() !== '') {
        const canon = canonicalizeAnswer(e.value, f);
        if (canon == null) continue;
        out[f.id] = {
          value: canon,
          confidence: ['high', 'medium', 'low'].includes(e.confidence) ? e.confidence : 'low',
          source: typeof e.source === 'string' ? e.source.slice(0, 160) : '',
        };
      }
    }
    return Response.json(out);
  } catch (e) {
    console.error('POST /api/audit/autofill', e);
    return Response.json({});
  }
}
