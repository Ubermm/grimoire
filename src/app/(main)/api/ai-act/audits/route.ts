//@ts-nocheck
// AI Act audits — list + create. An audit bundles one subsection per selected
// provision (FormCode); each subsection reuses the generic AuditSubsection schema.
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAIActAudit } from '@/lib/db/models';
import { generateUUID } from '@/lib/utils';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const audits = await CAIActAudit.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    return Response.json(audits);
  } catch (e) {
    console.error('GET /api/ai-act/audits', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const { name, systemId, provisions, metadata } = await request.json();
    if (!name || !Array.isArray(provisions) || provisions.length === 0) {
      return new Response('Missing name or provisions', { status: 400 });
    }
    const subsections = provisions.map((code: string, i: number) => ({
      id: generateUUID(),
      pos: String(i + 1),
      code, // = FormCode (e.g. AIACT_ART_5)
      status: 'pending',
      responses: [],
      validationResults: { passed: [], description: [] },
    }));
    const audit = await CAIActAudit.create({
      _id: generateUUID(),
      name,
      userId: session.user.id,
      systemId: systemId || undefined,
      status: 'in_progress',
      checkpoint: 0,
      subsections,
      metadata: metadata || {},
    });
    return Response.json(audit, { status: 201 });
  } catch (e) {
    console.error('POST /api/ai-act/audits', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
