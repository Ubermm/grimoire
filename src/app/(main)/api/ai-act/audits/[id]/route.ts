//@ts-nocheck
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAIActAudit } from '@/lib/db/models';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const audit = await CAIActAudit.findOne({ _id: id, userId: session.user.id });
    if (!audit) return new Response('Not found', { status: 404 });
    return Response.json(audit);
  } catch (e) {
    console.error('GET /api/ai-act/audits/[id]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const body = await request.json();
    const update: any = {};
    for (const k of ['name', 'status', 'checkpoint', 'subsections', 'metadata', 'completedAt']) {
      if (k in body) update[k] = body[k];
    }
    const audit = await CAIActAudit.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: update },
      { new: true }
    );
    if (!audit) return new Response('Not found', { status: 404 });
    return Response.json(audit);
  } catch (e) {
    console.error('PATCH /api/ai-act/audits/[id]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
