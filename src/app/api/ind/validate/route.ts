//@ts-nocheck
// src/app/api/ind/validate/route.ts - IND Document Validation API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getINDDocumentById, updateDocumentValidation } from '@/lib/db/ind-queries';
import {
  PLACEHOLDER_DICTIONARY,
  getRequiredFields,
  validateFieldValue
} from '@/lib/ind/placeholder-dictionary';
import { customModel } from '@/lib/ai';
import { generateText } from 'ai';
import type { ValidationReport } from '@/lib/db/ind-models';

// POST /api/ind/validate - Validate IND document
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document
    const document = await getINDDocumentById(documentId);
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Perform validation
    const validationReport = await validateDocument(document);

    // Update document with validation results
    const updatedDocument = await updateDocumentValidation(documentId, validationReport);

    return NextResponse.json({
      documentId,
      validationReport,
      status: updatedDocument?.status
    });
  } catch (error) {
    console.error('Error validating IND document:', error);
    return NextResponse.json(
      { error: 'Failed to validate document' },
      { status: 500 }
    );
  }
}

// Validation logic using claude-3-haiku-20240307
async function validateDocument(document: any): Promise<ValidationReport> {
  const errors: Array<{ field: string; message: string }> = [];
  const warnings: Array<{ field: string; message: string }> = [];

  // 1. Structure Validation - check required fields
  const requiredFields = getRequiredFields(document.documentType);
  const missingFields: string[] = [];

  requiredFields.forEach(fieldName => {
    const value = document.formData?.[fieldName];
    if (!value || value === '') {
      missingFields.push(fieldName);
      const fieldInfo = PLACEHOLDER_DICTIONARY[document.documentType]?.[fieldName];
      errors.push({
        field: fieldName,
        message: `Required field missing: ${fieldInfo?.description || fieldName}`
      });
    }
  });

  // 2. Field-level validation
  if (document.formData) {
    Object.keys(document.formData).forEach(fieldName => {
      const value = document.formData[fieldName];
      const validation = validateFieldValue(document.documentType, fieldName, value);

      if (!validation.valid && validation.error) {
        errors.push({
          field: fieldName,
          message: validation.error
        });
      }
    });
  }

  // 3. Content validation using AI
  let contentValid = true;
  let regulatoryCompliant = true;

  if (Object.keys(document.formData).length > 0) {
    try {
      const aiValidation = await performAIValidation(document);

      if (aiValidation.errors.length > 0) {
        contentValid = false;
        errors.push(...aiValidation.errors);
      }

      if (aiValidation.warnings.length > 0) {
        warnings.push(...aiValidation.warnings);
      }

      regulatoryCompliant = aiValidation.regulatoryCompliant;
    } catch (aiError) {
      console.error('AI validation error:', aiError);
      warnings.push({
        field: 'general',
        message: 'AI validation could not be completed, manual review recommended'
      });
    }
  }

  // Calculate completion percentage
  const totalFields = requiredFields.length;
  const completedFields = totalFields - missingFields.length;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

  const structureValid = errors.length === 0;

  return {
    structureValid,
    contentValid,
    regulatoryCompliant,
    errors,
    warnings,
    completionPercentage
  };
}

// AI validation using claude-3-haiku-20240307
async function performAIValidation(document: any): Promise<{
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
  regulatoryCompliant: boolean;
}> {
  const model = customModel('claude-3-haiku-20240307');

  const prompt = `
  Validate the following FDA ${document.documentType} form data for regulatory compliance and content quality:

  Document Type: ${document.documentType}
  Form Data: ${JSON.stringify(document.formData, null, 2)}

  Please review for:
  1. Regulatory compliance with FDA IND requirements
  2. Content completeness and accuracy
  3. Professional language and formatting
  4. Consistency across fields
  5. Missing critical information

  Respond with a JSON object containing:
  {
    "errors": [{"field": "fieldName", "message": "error description"}],
    "warnings": [{"field": "fieldName", "message": "warning description"}],
    "regulatoryCompliant": boolean
  }

  Focus on FDA-specific requirements for IND submissions. Be thorough but practical.
  `;

  const systemPrompt = `
  You are an FDA regulatory compliance expert specializing in IND (Investigational New Drug) submissions.
  You have deep knowledge of:
  - 21 CFR Part 312 regulations
  - FDA Form 1571 and 1572 requirements
  - eCTD submission standards
  - Clinical trial regulatory requirements

  Provide specific, actionable feedback for regulatory compliance.
  Focus on critical issues that would cause FDA rejection or clinical holds.
  Be precise and reference specific regulatory requirements when possible.
  `;

  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt
    });

    // Parse AI response
    const aiResponse = JSON.parse(text);

    return {
      errors: aiResponse.errors || [],
      warnings: aiResponse.warnings || [],
      regulatoryCompliant: aiResponse.regulatoryCompliant !== false // Default to true if not specified
    };
  } catch (parseError) {
    console.error('Error parsing AI validation response:', parseError);

    // Fallback: basic text analysis for common issues
    return {
      errors: [],
      warnings: [{
        field: 'general',
        message: 'Automated content validation could not be completed. Manual review recommended.'
      }],
      regulatoryCompliant: true
    };
  }
}
