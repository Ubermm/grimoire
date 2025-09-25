// src/app/api/ind/documents/route.ts - IND Documents API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  createINDDocument,
  getINDDocumentById,
  getINDDocumentsBySubmission,
  updateINDDocument,
  deleteINDDocument,
  updateDocumentFormData
} from '@/lib/db/ind-queries';
import { PLACEHOLDER_DICTIONARY, validateFieldValue } from '@/lib/ind/placeholder-dictionary';

// GET /api/ind/documents - Get document(s)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('id');
    const submissionId = searchParams.get('submissionId');

    if (documentId) {
      const document = await getINDDocumentById(documentId);
      if (!document) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(document);
    }

    if (submissionId) {
      const documents = await getINDDocumentsBySubmission(submissionId);
      return NextResponse.json(documents);
    }

    return NextResponse.json(
      { error: 'Either documentId or submissionId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching IND documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/ind/documents - Create new IND document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, documentType, originalPdfUrl } = body;

    if (!submissionId || !documentType || !originalPdfUrl) {
      return NextResponse.json(
        { error: 'submissionId, documentType, and originalPdfUrl are required' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Generate placeholder mapping from dictionary
    const placeholderMapping = PLACEHOLDER_DICTIONARY[documentType];
    if (!placeholderMapping) {
      return NextResponse.json(
        { error: 'No placeholder dictionary found for document type' },
        { status: 400 }
      );
    }

    // Create mapping from field names to PDF placeholders
    const pdfPlaceholderMapping: Record<string, string> = {};
    Object.keys(placeholderMapping).forEach(fieldName => {
      pdfPlaceholderMapping[fieldName] = placeholderMapping[fieldName].pdfPlaceholder;
    });

    const document = await createINDDocument({
      submissionId,
      documentType,
      originalPdfUrl,
      placeholderMapping: pdfPlaceholderMapping,
      formData: {}
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating IND document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}

// PATCH /api/ind/documents - Update IND document
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, formData, ...otherUpdates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    let document;

    // If updating form data, validate and use special function
    if (formData) {
      // Get current document to determine type
      const currentDoc = await getINDDocumentById(id);
      if (!currentDoc) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }

      // Validate form data
      const validationErrors: Array<{ field: string; error: string }> = [];
      Object.keys(formData).forEach(fieldName => {
        const validation = validateFieldValue(currentDoc.documentType, fieldName, formData[fieldName]);
        if (!validation.valid) {
          validationErrors.push({ field: fieldName, error: validation.error || 'Invalid value' });
        }
      });

      if (validationErrors.length > 0) {
        return NextResponse.json(
          { error: 'Validation failed', validationErrors },
          { status: 400 }
        );
      }

      document = await updateDocumentFormData(id, formData);
    } else {
      // Remove fields that shouldn't be updated directly
      delete otherUpdates._id;
      delete otherUpdates.submissionId;
      delete otherUpdates.createdAt;

      document = await updateINDDocument(id, otherUpdates);
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error updating IND document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

// DELETE /api/ind/documents - Delete IND document
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
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteINDDocument(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete document or document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting IND document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}