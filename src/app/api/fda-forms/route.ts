//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

// Local FDA form files
const FDA_FORM_FILES = {
  'FDA_1571': 'FDA_1571.pdf',
  'FDA_1572': 'FDA_1572.pdf',
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('type');

    if (!documentType || !(documentType in FDA_FORM_FILES)) {
      return NextResponse.json(
        { error: 'Invalid or missing document type' },
        { status: 400 }
      );
    }

    const fileName = FDA_FORM_FILES[documentType as keyof typeof FDA_FORM_FILES];
    const filePath = path.join(process.cwd(), 'public', 'fda-forms', fileName);

    try {
      // Read the local PDF file
      const pdfBuffer = await readFile(filePath);

      // Return the PDF with proper headers
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours since it's a local file
        },
      });

    } catch (fileError) {
      console.error('Error reading local FDA form:', fileError);
      return NextResponse.json(
        { error: 'FDA form file not found' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error serving FDA form:', error);
    return NextResponse.json(
      { error: 'Failed to serve FDA form' },
      { status: 500 }
    );
  }
}
