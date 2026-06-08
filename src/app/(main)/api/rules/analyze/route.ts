//@ts-nocheck
// Contradiction + coverage scan of a form's rules vs the regulation text.
import { auth } from '@/app/(auth)/auth';
import { analyzeForm } from '@/lib/rule-compiler';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    const { form, regText } = await request.json();
    if (!form?.queries) return new Response('Missing form', { status: 400 });
    return Response.json(await analyzeForm(form, regText));
  } catch (e: any) {
    console.error('POST /api/rules/analyze', e);
    return Response.json({ contradictions: [], coverageGaps: [] });
  }
}
