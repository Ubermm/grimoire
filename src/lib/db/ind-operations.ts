//@ts-nocheck
// src/lib/db/ind-operations.ts - IND Database Operations (following audit patterns)
import { CINDSubmission } from './models';
import type { INDFormResponse, INDFormSection, INDSubmission } from './models';
import { generateUUID } from '../utils';

// Types are imported from models.ts

// CRUD Operations following audit patterns
export async function createINDSubmission(data: {
  name: string;
  userId: string;
  submissionType?: string;
  documentTypes: string[];
  metadata?: any;
}) {
  const sections: INDFormSection[] = data.documentTypes.map((docType, index) => ({
    id: generateUUID(),
    sectionName: getSectionNameFromDocType(docType),
    documentType: docType as any,
    status: 'pending',
    responses: [],
    validationResults: {
      passed: [],
      errors: [],
      warnings: [],
      completionPercentage: 0
    }
  }));

  const submission = new CINDSubmission({
    _id: generateUUID(),
    name: data.name,
    userId: data.userId,
    status: 'draft',
    submissionType: data.submissionType || 'initial',
    checkpoint: 0,
    sections,
    metadata: data.metadata || {},
    documentUrls: {},
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return await submission.save();
}

export async function getINDSubmissionById(id: string) {
  return await CINDSubmission.findById(id);
}

export async function getINDSubmissionsByUser(userId: string) {
  return await CINDSubmission.find({ userId }).sort({ createdAt: -1 });
}

export async function updateINDSubmission(id: string, updates: Partial<INDSubmission>) {
  return await CINDSubmission.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  );
}

export async function deleteINDSubmission(id: string, userId: string) {
  const submission = await CINDSubmission.findOne({ _id: id, userId });
  if (!submission) {
    throw new Error('Submission not found or unauthorized');
  }

  return await CINDSubmission.deleteOne({ _id: id, userId });
}

// Section operations following audit patterns
export async function updateINDSubmissionSection(
  submissionId: string,
  sectionIndex: number,
  sectionData: Partial<INDFormSection>
) {
  const submission = await CINDSubmission.findById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  if (sectionIndex >= 0 && sectionIndex < submission.sections.length) {
    submission.sections[sectionIndex] = {
      ...submission.sections[sectionIndex],
      ...sectionData,
    };
    submission.updatedAt = new Date();
    submission.checkpoint = Math.max(submission.checkpoint, sectionIndex);

    return await submission.save();
  }

  throw new Error('Invalid section index');
}

export async function saveINDSubmissionResponse(
  submissionId: string,
  sectionIndex: number,
  responses: INDFormResponse[]
) {
  const submission = await CINDSubmission.findById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  if (sectionIndex >= 0 && sectionIndex < submission.sections.length) {
    submission.sections[sectionIndex].responses = responses;
    submission.sections[sectionIndex].status = 'in_progress';
    submission.updatedAt = new Date();

    return await submission.save();
  }

  throw new Error('Invalid section index');
}

// Validation operations
export async function validateINDSubmissionSection(
  submissionId: string,
  sectionIndex: number,
  validationResults: {
    passed: boolean[];
    errors: string[];
    warnings: string[];
    completionPercentage: number;
  }
) {
  const submission = await CINDSubmission.findById(submissionId);
  if (!submission) {
    throw new Error('Submission not found');
  }

  if (sectionIndex >= 0 && sectionIndex < submission.sections.length) {
    submission.sections[sectionIndex].validationResults = validationResults;
    submission.sections[sectionIndex].status =
      validationResults.passed.every(p => p === true) ? 'completed' : 'flagged';
    submission.updatedAt = new Date();

    return await submission.save();
  }

  throw new Error('Invalid section index');
}

// Search and filter operations
export async function searchINDSubmissions(userId: string, filters: {
  status?: string;
  submissionType?: string;
  searchTerm?: string;
}) {
  const query: any = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.submissionType) {
    query.submissionType = filters.submissionType;
  }

  if (filters.searchTerm) {
    query.$or = [
      { name: { $regex: filters.searchTerm, $options: 'i' } },
      { 'metadata.sponsorInfo.name': { $regex: filters.searchTerm, $options: 'i' } },
      { 'metadata.drugInfo.genericName': { $regex: filters.searchTerm, $options: 'i' } },
      { 'metadata.studyInfo.title': { $regex: filters.searchTerm, $options: 'i' } }
    ];
  }

  return await CINDSubmission.find(query).sort({ createdAt: -1 });
}

// Statistics
export async function getINDSubmissionStats(userId: string) {
  const submissions = await CINDSubmission.find({ userId });

  const stats = {
    total: submissions.length,
    draft: 0,
    in_progress: 0,
    under_review: 0,
    completed: 0,
    submitted: 0,
    archived: 0,
    byType: {
      initial: 0,
      amendment: 0,
      annual_report: 0,
      safety_report: 0
    }
  };

  submissions.forEach(submission => {
    stats[submission.status as keyof typeof stats]++;
    stats.byType[submission.submissionType as keyof typeof stats.byType]++;
  });

  return stats;
}

// Helper functions
function getSectionNameFromDocType(docType: string): string {
  const nameMap: Record<string, string> = {
    'FDA_1571': 'Form FDA 1571 - Notice of Claimed Investigational Exemption',
    'FDA_1572': 'Form FDA 1572 - Statement of Investigator',
    'INVESTIGATIONAL_PLAN': 'Investigational Plan',
    'CMC_SUMMARY': 'Chemistry, Manufacturing, and Controls Summary'
  };

  return nameMap[docType] || docType;
}

// Autofill support functions (similar to audit)
export async function getINDSubmissionFormFields(
  submissionId: string,
  sectionIndex: number
): Promise<Record<string, any>> {
  const submission = await CINDSubmission.findById(submissionId);
  if (!submission || sectionIndex >= submission.sections.length) {
    return {};
  }

  const section = submission.sections[sectionIndex];
  const formFields: Record<string, any> = {};

  section.responses.forEach(response => {
    formFields[response.fieldName] = {
      id: response.questionId,
      type: 'text', // Default type
      question: response.fieldName,
      value: response.value
    };
  });

  return formFields;
}