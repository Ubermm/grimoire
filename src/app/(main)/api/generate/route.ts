//@ts-nocheck
// Deep-validation question generation — auth + per-CFR-code cache around the
// pipeline in @/lib/deep-form (parallel letter batches, mechanical dedup
// against the base form, positional re-indexed merge).
import { auth } from '@/app/(auth)/auth';
import { CAdditional } from '@/lib/db/models';
import { generateDeepForm, DEEP_FORM_VERSION } from '@/lib/deep-form';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { cfrSubsection, warningLetters, form = {} } = await request.json();

    const resp = await CAdditional.find({ cfrCode: cfrSubsection });

    if (resp[0]) {
      try {
        const cached = JSON.parse(resp[0].FormText);
        // Only serve caches produced by the current pipeline; older versions
        // were either mis-indexed (v1) or full of base-form paraphrases (v2).
        if (cached?._v === DEEP_FORM_VERSION) {
          return Response.json({ form: cached }, { status: 200 });
        }
      } catch { /* corrupted cache — regenerate */ }
    }

    const mergedQuestions = await generateDeepForm(cfrSubsection, warningLetters, form);

    await CAdditional.findOneAndUpdate(
      { cfrCode: cfrSubsection },
      { FormText: JSON.stringify(mergedQuestions) },
      { upsert: true },
    );

    return Response.json({ form: mergedQuestions }, { status: 200 });
  } catch (error) {
    console.error('Error generating validation questions:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
