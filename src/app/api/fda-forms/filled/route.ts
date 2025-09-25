//@ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { EnhancedPDFFormFiller } from '@/lib/ind/pdf-form-filler';

// Local FDA form files
const FDA_FORM_FILES = {
  'FDA_1571': 'FDA_1571.pdf',
  'FDA_1572': 'FDA_1572.pdf',
} as const;

// Utility to write PDF to temp, read back, and clean up
async function writePdfToTempAndReturn(bytes: Uint8Array): Promise<Uint8Array> {
  const tmpFilePath = path.join(process.cwd(), `filled_pdf_${Date.now()}.pdf`);
  try {
    fs.writeFileSync(tmpFilePath, bytes);
    const fileBytes = await fs.readFileSync(tmpFilePath);
    return fileBytes;
  } finally {
    fs.unlinkSync(tmpFilePath);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentType, formData } = await request.json();

    if (!documentType || !(documentType in FDA_FORM_FILES)) {
      return NextResponse.json({ error: 'Invalid or missing document type' }, { status: 400 });
    }
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: 'Invalid or missing form data' }, { status: 400 });
    }

    const fileName = FDA_FORM_FILES[documentType as keyof typeof FDA_FORM_FILES];
    const filePath = path.join(process.cwd(), 'public', 'fda-forms', fileName);

    const originalPdfBuffer = await fs.readFileSync(filePath);
    const originalPdfBytes = new Uint8Array(originalPdfBuffer);

    // Fill PDF
    const filledPdfBytes = await EnhancedPDFFormFiller.fillPDFFormFields(
      originalPdfBytes,
      documentType,
      formData
    );

    // Write to temp and read back
    const finalPdfBytes = await writePdfToTempAndReturn(filledPdfBytes);

    const timestamp = new Date().toISOString().split('T')[0];
    const filledFileName = `${documentType}_filled_${timestamp}.pdf`;

    return new NextResponse(Buffer.from(finalPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filledFileName}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating filled FDA form:', error);
    return NextResponse.json(
      { error: 'Failed to generate filled FDA form' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documentType = searchParams.get('type');
    const formDataParam = searchParams.get('formData');

    if (!documentType || !(documentType in FDA_FORM_FILES)) {
      return NextResponse.json({ error: 'Invalid or missing document type' }, { status: 400 });
    }
    if (!formDataParam) {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 });
    }

    let formData;
    try {
      formData = JSON.parse(decodeURIComponent(formDataParam));
    } catch {
      return NextResponse.json({ error: 'Invalid form data format' }, { status: 400 });
    }

    const fileName = FDA_FORM_FILES[documentType as keyof typeof FDA_FORM_FILES];
    const filePath = path.join(process.cwd(), 'public', 'fda-forms', fileName);

    const originalPdfBuffer = await fs.readFileSync(filePath);
    const originalPdfBytes = new Uint8Array(originalPdfBuffer);

    const filledPdfBytes = await EnhancedPDFFormFiller.fillPDFFormFields(
      originalPdfBytes,
      documentType,
      formData
    );

    const finalPdfBytes = await writePdfToTempAndReturn(filledPdfBytes);

    const timestamp = new Date().toISOString().split('T')[0];
    const filledFileName = `${documentType}_filled_${timestamp}.pdf`;

    return new NextResponse(Buffer.from(finalPdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filledFileName}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('Error generating filled FDA form preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate filled FDA form preview' },
      { status: 500 }
    );
  }
}
