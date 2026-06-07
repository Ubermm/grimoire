//@ts-nocheck
// Hybrid authoring — LLM-generate a validation form for an AI Act provision.
// Mirrors /api/generate (Azure gpt-4o), caches in CAIActForm. Humans then edit
// the result via the authoring UI (PUT /api/ai-act/forms).
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { generateText } from 'ai';
import { AZURE } from '@/lib/ai';
import { CAIActForm } from '@/lib/db/models';
import { generateUUID } from '@/lib/utils';
import { AI_ACT_GENERATE_SYSTEM, aiActGenerateUserPrompt } from '@/lib/ai-act/prompts';

function extractJsonFromText(text: string): any {
  const fenced = text.match(/```json\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : (text.match(/\{[\s\S]*\}/) || [])[0];
  if (!raw) return null;
  try { return JSON.parse(raw.trim()); } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const { articleCode, articleText, guidanceDocs, formCode, regenerate } = await request.json();
    if (!articleCode || !articleText) return new Response('Missing articleCode or articleText', { status: 400 });

    const fc = formCode || `AIACT_${articleCode}`;

    if (!regenerate) {
      const cached = await CAIActForm.findOne({ FormCode: fc });
      if (cached) return Response.json({ form: JSON.parse(cached.FormText), formCode: fc, cached: true });
    }

    const { text } = await generateText({
      model: AZURE('gpt-4o'),
      system: AI_ACT_GENERATE_SYSTEM,
      prompt: aiActGenerateUserPrompt({ articleCode, articleText, guidanceDocs }),
      temperature: 0.2,
    });

    const form = extractJsonFromText(text);
    if (!form || !Array.isArray(form.questions) || !Array.isArray(form.queries)) {
      return new Response('The model did not return a valid form', { status: 502 });
    }

    await CAIActForm.findOneAndUpdate(
      { FormCode: fc },
      { $set: { FormCode: fc, RegCode: articleCode, FormText: JSON.stringify(form), generatedByLLM: true }, $setOnInsert: { _id: generateUUID(), version: 1 } },
      { upsert: true }
    );

    return Response.json({ form, formCode: fc, cached: false });
  } catch (e) {
    console.error('POST /api/ai-act/generate', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
