//@ts-nocheck
// src/app/(main)/api/ind-forms/[id]/validate/route.ts - Form Validation API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getINDFormSessionById,
  validateINDFormSession
} from '@/lib/db/ind-form-operations';

// POST /api/ind-forms/[id]/validate - Validate form session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const formSession = await getINDFormSessionById(resolvedParams.id);
    if (!formSession) {
      return NextResponse.json(
        { error: 'Form session not found' },
        { status: 404 }
      );
    }

    if (formSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Perform validation
    const validationResults = await validateINDFormSession(resolvedParams.id);

    return NextResponse.json(validationResults);
  } catch (error) {
    console.error('Error validating IND form session:', error);
    return NextResponse.json(
      { error: 'Failed to validate form session' },
      { status: 500 }
    );
  }
}