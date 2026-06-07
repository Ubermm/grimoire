//@ts-nocheck
// AI System registry — list + create.
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAISystem } from '@/lib/db/models';
import { generateUUID } from '@/lib/utils';
import { emptyTechnicalDocumentation } from '@/lib/ai-act/annex-iv-sections';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const systems = await CAISystem.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    return Response.json(systems);
  } catch (e) {
    console.error('GET /api/ai-act/systems', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const body = await request.json();
    if (!body?.name) return new Response('Missing name', { status: 400 });
    const sys = await CAISystem.create({
      _id: generateUUID(),
      userId: session.user.id,
      name: body.name,
      description: body.description || '',
      provider: body.provider || '',
      role: body.role || 'provider',
      isGPAI: !!body.isGPAI,
      technicalDocumentation: emptyTechnicalDocumentation(),
    });
    return Response.json(sys, { status: 201 });
  } catch (e) {
    console.error('POST /api/ai-act/systems', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
