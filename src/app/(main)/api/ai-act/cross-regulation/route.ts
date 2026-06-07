//@ts-nocheck
// Cross-regulation overlap analysis (FDA 21 CFR x EU AI Act). Read-only; uses gpt-4o.
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { generateText } from 'ai';
import { AZURE } from '@/lib/ai';
import { CAISystem } from '@/lib/db/models';
import { CROSS_REGULATION_SYSTEM, crossRegulationUserPrompt } from '@/lib/ai-act/prompts';

function extractJson(text: string): any {
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
    const { systemId, profile } = await request.json();

    let systemProfile = profile;
    if (systemId) {
      const s = await CAISystem.findOne({ _id: systemId, userId: session.user.id });
      if (s) systemProfile = `Name: ${s.name}\nDescription: ${s.description}\nRole: ${s.role}\nRisk level: ${s.riskLevel}\nGPAI: ${s.isGPAI}\nClassification basis: ${(s.classificationBasis || []).join('; ')}`;
    }
    if (!systemProfile) return new Response('Missing system profile', { status: 400 });

    const { text } = await generateText({
      model: AZURE('gpt-4o'),
      system: CROSS_REGULATION_SYSTEM,
      prompt: crossRegulationUserPrompt(systemProfile),
      temperature: 0.2,
    });
    const result = extractJson(text);
    if (!result) return new Response('The model did not return a valid analysis', { status: 502 });
    return Response.json(result);
  } catch (e) {
    console.error('POST /api/ai-act/cross-regulation', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
