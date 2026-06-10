//@ts-nocheck
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { debugRule } from '@/lib/rule-compiler';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { form, responses, queryIndex, feedback, priorDiagnosis } = await request.json();
    if (!form || !responses || queryIndex == null) {
      return Response.json({ error: 'Missing form, responses or queryIndex' }, { status: 400 });
    }
    const result = await debugRule(form, responses, queryIndex, feedback, priorDiagnosis);
    return Response.json(result);
  } catch (error: any) {
    console.error('Error in POST /api/rules/debug:', error);
    return Response.json({ error: error?.message || 'Debug failed' }, { status: 500 });
  }
}
