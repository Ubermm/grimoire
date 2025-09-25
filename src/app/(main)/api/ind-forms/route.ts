//@ts-nocheck
// src/app/(main)/api/ind-forms/route.ts - Main IND Forms API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  createINDFormSession,
  getINDFormSessionsByUser,
  getINDFormSessionById,
  searchINDFormSessions,
  getINDFormStats
} from '@/lib/db/ind-form-operations';

// GET /api/ind-forms - Get form sessions or specific session
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');
    const formType = searchParams.get('formType');
    const status = searchParams.get('status');
    const searchTerm = searchParams.get('search');
    const stats = searchParams.get('stats');

    // Get statistics
    if (stats === 'true') {
      const statisticsData = await getINDFormStats(session.user.id);
      return NextResponse.json(statisticsData);
    }

    // Get specific session
    if (sessionId) {
      const formSession = await getINDFormSessionById(sessionId);
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
    }

    // Search/filter sessions
    const filters: any = {};
    if (formType) filters.formType = formType;
    if (status) filters.status = status;
    if (searchTerm) filters.searchTerm = searchTerm;

    const sessions = Object.keys(filters).length > 0
      ? await searchINDFormSessions(session.user.id, filters)
      : await getINDFormSessionsByUser(session.user.id);

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error handling IND forms request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ind-forms - Create new form session
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { formType, title, textSeed } = body;

    // Validate required fields
    if (!formType || !title) {
      return NextResponse.json(
        { error: 'formType and title are required' },
        { status: 400 }
      );
    }

    // Validate form type
    const validTypes = ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'];
    if (!validTypes.includes(formType)) {
      return NextResponse.json(
        { error: 'Invalid form type' },
        { status: 400 }
      );
    }

    const newSession = await createINDFormSession({
      userId: session.user.id,
      formType,
      title,
      textSeed
    });

    return NextResponse.json(newSession, { status: 201 });
  } catch (error) {
    console.error('Error creating IND form session:', error);
    return NextResponse.json(
      { error: 'Failed to create form session' },
      { status: 500 }
    );
  }
}
