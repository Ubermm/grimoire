//@ts-nocheck
// Compile ONE plain-English rule into the auditor's form. Regulation-agnostic —
// used by both the FDA and EU AI Act audit run flows. Returns the merged form
// (snapshot the caller persists onto its audit subsection).
import { auth } from '@/app/(auth)/auth';
import { compileEnglishRule } from '@/lib/rule-compiler';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    const { nl, form, regText } = await request.json();
    if (!nl || !form?.questions) return new Response('Missing nl or form', { status: 400 });
    const result = await compileEnglishRule(String(nl), form, regText);
    return Response.json(result);
  } catch (e: any) {
    console.error('POST /api/rules/compile', e);
    return Response.json({ error: e?.message || 'Could not compile the rule.' }, { status: 422 });
  }
}
