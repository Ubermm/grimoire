// src/app/api/ind/submissions/route.ts - IND Submissions API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  createINDSubmission,
  getINDSubmissionsByUser,
  updateINDSubmission,
  deleteINDSubmission,
  searchINDSubmissions
} from '@/lib/db/ind-queries';

// GET /api/ind/submissions - List user's IND submissions
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const submissionType = searchParams.get('submissionType');
    const searchTerm = searchParams.get('search');

    let submissions;
    if (status || submissionType || searchTerm) {
      submissions = await searchINDSubmissions(session.user.id, {
        status: status || undefined,
        submissionType: submissionType || undefined,
        searchTerm: searchTerm || undefined
      });
    } else {
      submissions = await getINDSubmissionsByUser(session.user.id);
    }

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching IND submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/ind/submissions - Create new IND submission
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionName, submissionType = 'initial' } = body;

    if (!submissionName || submissionName.trim() === '') {
      return NextResponse.json(
        { error: 'Submission name is required' },
        { status: 400 }
      );
    }

    const submission = await createINDSubmission({
      userId: session.user.id,
      submissionName: submissionName.trim(),
      submissionType
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error creating IND submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}

// PATCH /api/ind/submissions - Update IND submission
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates._id;
    delete updates.createdAt;

    const submission = await updateINDSubmission(id, updates);

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error updating IND submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE /api/ind/submissions - Delete IND submission
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteINDSubmission(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete submission or submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting IND submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}