//@ts-nocheck
// src/app/api/ind-submissions/route.ts - IND Submissions API (following audit pattern)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  createINDSubmission,
  getINDSubmissionsByUser,
  getINDSubmissionById,
  updateINDSubmission,
  deleteINDSubmission,
  searchINDSubmissions,
  getINDSubmissionStats
} from '@/lib/db/ind-operations';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
      console.log("NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "set" : "missing");
      console.log(session);
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const submissionType = searchParams.get('submissionType');
    const searchTerm = searchParams.get('search');
    const getStats = searchParams.get('stats');

    // Get statistics
    if (getStats === 'true') {
      const stats = await getINDSubmissionStats(session.user.id);
      return Response.json(stats);
    }

    if (id) {
      // Get specific submission
      const submission = await getINDSubmissionById(id);

      if (!submission) {
        return new Response('Submission not found', { status: 404 });
      }

      // Check ownership
      if (submission.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 403 });
      }

      return Response.json(submission);
    } else {
      // Get all submissions for user with optional filters
      let submissions;

      if (status || submissionType || searchTerm) {
        // Use search function with filters
        submissions = await searchINDSubmissions(session.user.id, {
          status,
          submissionType,
          searchTerm
        });
      } else {
        // Get all submissions
        submissions = await getINDSubmissionsByUser(session.user.id);
      }

      return Response.json(submissions);
    }
  } catch (error) {
    console.error('Error in GET /api/ind-submissions:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { name, submissionType, documentTypes, metadata } = data;

    // Validate required fields
    if (!name || !documentTypes || !Array.isArray(documentTypes)) {
      return new Response('Name and documentTypes array are required', { status: 400 });
    }

    // Validate document types
    const validTypes = ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'];
    const invalidTypes = documentTypes.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      return new Response(`Invalid document types: ${invalidTypes.join(', ')}`, { status: 400 });
    }

    const submission = await createINDSubmission({
      name,
      userId: session.user.id,
      submissionType,
      documentTypes,
      metadata
    });

    return Response.json(submission, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/ind-submissions:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await request.json();

    if (!data._id) {
      return new Response('Submission ID is required', { status: 400 });
    }

    // Ensure user owns this submission
    const existingSubmission = await getINDSubmissionById(data._id);

    if (!existingSubmission) {
      return new Response('Submission not found', { status: 404 });
    }

    if (existingSubmission.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 403 });
    }

    // Update submission
    const updatedSubmission = await updateINDSubmission(data._id, data);

    return Response.json(updatedSubmission);
  } catch (error) {
    console.error('Error in PATCH /api/ind-submissions:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response('Submission ID is required', { status: 400 });
    }

    await deleteINDSubmission(id, session.user.id);

    return new Response('Submission deleted successfully', { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/ind-submissions:', error);
    if (error.message === 'Submission not found or unauthorized') {
      return new Response(error.message, { status: 404 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}
