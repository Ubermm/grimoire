//@ts-nocheck
// src/app/api/ind-submissions/validate/route.ts - IND Validation API
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  getINDSubmissionById,
  validateINDSubmissionSection,
  updateINDSubmissionSection
} from '@/lib/db/ind-operations';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { submissionId, sectionIndex, responses, documentType } = data;

    if (!submissionId || sectionIndex === undefined || !responses) {
      return new Response('submissionId, sectionIndex, and responses are required', { status: 400 });
    }

    // Get the submission to ensure ownership
    const submission = await getINDSubmissionById(submissionId);
    if (!submission) {
      return new Response('Submission not found', { status: 404 });
    }

    if (submission.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 403 });
    }

    // Validate the section
    const validationResults = await performINDValidation(documentType, responses);

    // Update the submission with validation results
    const updatedSubmission = await validateINDSubmissionSection(
      submissionId,
      sectionIndex,
      validationResults
    );

    return Response.json({
      submissionId,
      sectionIndex,
      validationResults,
      sectionStatus: submission.sections[sectionIndex]?.status
    });

  } catch (error) {
    console.error('Error in POST /api/ind-submissions/validate:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// IND-specific validation logic
async function performINDValidation(documentType: string, responses: Record<string, any>) {
  const validationResults = {
    passed: [] as boolean[],
    errors: [] as string[],
    warnings: [] as string[],
    completionPercentage: 0
  };

  const requiredFields = getRequiredFieldsForDocType(documentType);
  let completedFields = 0;

  requiredFields.forEach((field, index) => {
    const value = responses[field];

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      validationResults.passed[index] = false;
      validationResults.errors.push(`Required field missing: ${field}`);
    } else {
      validationResults.passed[index] = true;
      completedFields++;
    }

    // Add specific validations for each document type
    if (documentType === 'FDA_1571') {
      validateFDA1571Field(field, value, validationResults);
    } else if (documentType === 'FDA_1572') {
      validateFDA1572Field(field, value, validationResults);
    }
  });

  validationResults.completionPercentage = Math.round(
    (completedFields / requiredFields.length) * 100
  );

  return validationResults;
}

function getRequiredFieldsForDocType(documentType: string): string[] {
  const fieldMap: Record<string, string[]> = {
    'FDA_1571': [
      'sponsorName',
      'sponsorAddress',
      'sponsorPhone',
      'contactPerson',
      'drugGenericName',
      'activeIngredients',
      'submissionType'
    ],
    'FDA_1572': [
      'investigatorName',
      'investigatorAddress',
      'investigatorPhone',
      'investigatorEmail',
      'educationTraining',
      'clinicalExperience'
    ],
    'INVESTIGATIONAL_PLAN': [
      'studyTitle',
      'studyObjectives',
      'backgroundRationale',
      'studyDesign',
      'subjectSelection'
    ],
    'CMC_SUMMARY': [
      'manufacturerName',
      'manufacturingProcesses',
      'qualityControls',
      'stabilityData'
    ]
  };

  return fieldMap[documentType] || [];
}

function validateFDA1571Field(field: string, value: any, results: any) {
  // FDA 1571 specific validations
  if (field === 'sponsorPhone') {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (value && !phoneRegex.test(value)) {
      results.warnings.push('Phone number format may be invalid');
    }
  }

  if (field === 'contactEmail') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      results.errors.push('Invalid email format');
    }
  }

  if (field === 'activeIngredients') {
    if (Array.isArray(value) && value.length === 0) {
      results.warnings.push('At least one active ingredient should be specified');
    }
  }
}

function validateFDA1572Field(field: string, value: any, results: any) {
  // FDA 1572 specific validations
  if (field === 'investigatorEmail') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      results.errors.push('Invalid investigator email format');
    }
  }

  if (field === 'educationTraining') {
    if (value && value.length < 50) {
      results.warnings.push('Education and training description seems too brief');
    }
  }
}