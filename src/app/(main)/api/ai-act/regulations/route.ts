//@ts-nocheck
// Serve AI Act regulation text (all, or one by ?code=RegCode).
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAIActRegulation } from '@/lib/db/models';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const code = new URL(request.url).searchParams.get('code');
    if (code) {
      const reg = await CAIActRegulation.findOne({ RegCode: code });
      if (!reg) return new Response('Not found', { status: 404 });
      return Response.json(reg);
    }
    const regs = await CAIActRegulation.find({}).sort({ RegCode: 1 });
    return Response.json(regs);
  } catch (e) {
    console.error('GET /api/ai-act/regulations', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
