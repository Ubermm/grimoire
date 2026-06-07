//@ts-nocheck
// AI System registry — read / update / delete a single system.
import { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import dbConnect from '@/lib/db/connection';
import { CAISystem } from '@/lib/db/models';

const UPDATABLE = [
  'name', 'description', 'provider', 'role', 'isGPAI', 'riskLevel',
  'classificationBasis', 'classificationResponses', 'article50Obligations',
  'technicalDocumentation', 'validationResults', 'status',
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    const sys = await CAISystem.findOne({ _id: id, userId: session.user.id });
    if (!sys) return new Response('Not found', { status: 404 });
    return Response.json(sys);
  } catch (e) {
    console.error('GET /api/ai-act/systems/[id]', e);
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
    for (const k of UPDATABLE) if (k in body) update[k] = body[k];
    const sys = await CAISystem.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: update },
      { new: true }
    );
    if (!sys) return new Response('Not found', { status: 404 });
    return Response.json(sys);
  } catch (e) {
    console.error('PATCH /api/ai-act/systems/[id]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) return new Response('Unauthorized', { status: 401 });
    await dbConnect();
    await CAISystem.deleteOne({ _id: id, userId: session.user.id });
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error('DELETE /api/ai-act/systems/[id]', e);
    return new Response('Internal Server Error', { status: 500 });
  }
}
