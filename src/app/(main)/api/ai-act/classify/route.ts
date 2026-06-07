//@ts-nocheck
// Risk classification — server-authoritative. Builds the classification Prolog
// program from CLASSIFY_FORM + the user's responses, runs it through the shared
// Tau-Prolog engine, derives the risk level, and persists to an AISystem.
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAISystem } from '@/lib/db/models';
import { generateUUID } from '@/lib/utils';
import { executePrologQueries } from '@/lib/ai/inference';
import { CLASSIFY_FORM, deriveClassification } from '@/lib/ai-act/classify-form';
import { emptyTechnicalDocumentation } from '@/lib/ai-act/annex-iv-sections';

// Same value conversion the /api/validate route uses.
function convert(value: string, type: string): string {
  if (type === 'NUMERIC') return value;
  if (type === 'CHECKBOX') return `[${value.split(',').map((v) => `'${v.trim().replace(/'/g, "\\'")}'`).join(', ')}]`;
  return `'${value.replace(/'/g, "\\'")}'`;
}

function buildProgram(form: any, responses: Record<string, string>): string {
  let program = ':- use_module(library(lists)).\n';
  for (const fact of form.facts) {
    const q = form.questions.find((x: any) => x.id === fact.question_id);
    if (!q || !responses[fact.question_id]) continue;
    program += fact.template.replace(/\{(\d+)\}/g, (_: string, m: string) => {
      const qq = form.questions[parseInt(m, 10) - 1];
      return convert(responses[qq.id], qq.type);
    }) + '\n';
  }
  for (const v of form.validations) program += v.rule + '\n';
  return program;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const { responses, systemId, name } = await request.json();
    if (!responses) return new Response('Missing responses', { status: 400 });

    const program = buildProgram(CLASSIFY_FORM, responses);
    const queries = CLASSIFY_FORM.queries.map((q: any) => q.query.replace('?-', '').trim());
    const results = await executePrologQueries(program, queries);
    const passed = results.map((r: any) => r.answers.length > 0 && (r.answers[0] === 'true.' || r.answers[0] === 'true'));
    const cls = deriveClassification(passed);

    const update = {
      riskLevel: cls.riskLevel,
      classificationBasis: cls.basis,
      isGPAI: cls.isGPAI,
      article50Obligations: cls.article50Obligations,
      classificationResponses: responses,
      status: 'active',
    };

    let system;
    if (systemId) {
      system = await CAISystem.findOneAndUpdate(
        { _id: systemId, userId: session.user.id },
        { $set: update },
        { new: true }
      );
      if (!system) return new Response('System not found', { status: 404 });
    } else {
      system = await CAISystem.create({
        _id: generateUUID(),
        userId: session.user.id,
        name: name?.trim() || 'Untitled AI system',
        technicalDocumentation: emptyTechnicalDocumentation(),
        ...update,
      });
    }

    return Response.json({ classification: cls, system });
  } catch (e) {
    console.error('POST /api/ai-act/classify', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
