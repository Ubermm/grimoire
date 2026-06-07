//@ts-nocheck
// AI Act validation forms — fetch by ?code=FormCode (or list), and save edited forms (PUT).
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAIActForm } from '@/lib/db/models';
import { generateUUID } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const code = new URL(request.url).searchParams.get('code');
    if (code) {
      const form = await CAIActForm.findOne({ FormCode: code });
      if (!form) return new Response('Not found', { status: 404 });
      return Response.json(form);
    }
    const forms = await CAIActForm.find({}).sort({ FormCode: 1 });
    return Response.json(forms);
  } catch (e) {
    console.error('GET /api/ai-act/forms', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// Save a human-edited (or newly authored) form.
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const body = await request.json();
    const { FormCode, RegCode, form, generatedByLLM } = body;
    if (!FormCode || !form) return new Response('Missing FormCode or form', { status: 400 });
    const FormText = typeof form === 'string' ? form : JSON.stringify(form);
    const existing = await CAIActForm.findOne({ FormCode });
    const saved = await CAIActForm.findOneAndUpdate(
      { FormCode },
      {
        $set: {
          FormCode, RegCode: RegCode || existing?.RegCode || '', FormText,
          editedByUser: true,
          generatedByLLM: generatedByLLM ?? existing?.generatedByLLM ?? false,
          version: (existing?.version || 0) + 1,
        },
        $setOnInsert: { _id: generateUUID() },
      },
      { new: true, upsert: true }
    );
    return Response.json(saved);
  } catch (e) {
    console.error('PUT /api/ai-act/forms', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
