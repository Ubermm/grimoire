//@ts-nocheck
// src/app/(main)/api/ind-forms/[id]/route.ts - Individual IND Form Session API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getINDFormSessionById,
  updateINDFormSession,
  saveINDFormData,
  deleteINDFormSession,
  validateINDFormSession
} from '@/lib/db/ind-form-operations';

// GET /api/ind-forms/[id] - Get specific form session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formSession = await getINDFormSessionById(id);
    if (!formSession) {
      return NextResponse.json(
        { error: 'Form session not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (formSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(formSession);
  } catch (error) {
    console.error('Error fetching IND form session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form session' },
      { status: 500 }
    );
  }
}

// PATCH /api/ind-forms/[id] - Update form session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership first
    const existingSession = await getINDFormSessionById(resolvedParams.id);
    if (!existingSession) {
      return NextResponse.json(
        { error: 'Form session not found' },
        { status: 404 }
      );
    }

    if (existingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { formData, aiGeneratedFields, ...otherUpdates } = body;

    let updatedSession;

    if (formData !== undefined) {
      // Use special save function for form data (calculates completion percentage)
      updatedSession = await saveINDFormData(
        resolvedParams.id,
        formData,
        aiGeneratedFields || []
      );
    } else {
      // Regular update
      updatedSession = await updateINDFormSession(resolvedParams.id, otherUpdates);
    }

    if (!updatedSession) {
      return NextResponse.json(
        { error: 'Failed to update form session' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error('Error updating IND form session:', error);
    return NextResponse.json(
      { error: 'Failed to update form session' },
      { status: 500 }
    );
  }
}

// DELETE /api/ind-forms/[id] - Delete form session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership first
    const existingSession = await getINDFormSessionById(resolvedParams.id);
    if (!existingSession) {
      return NextResponse.json(
        { error: 'Form session not found' },
        { status: 404 }
      );
    }

    if (existingSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const success = await deleteINDFormSession(resolvedParams.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete form session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting IND form session:', error);
    return NextResponse.json(
      { error: 'Failed to delete form session' },
      { status: 500 }
    );
  }
}