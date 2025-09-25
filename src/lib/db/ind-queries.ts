//@ts-nocheck
// src/lib/db/ind-queries.ts - IND Database Operations
import {
  INDSubmissionModel,
  INDDocumentModel,
  type INDSubmission,
  type INDDocument,
  type ValidationReport
} from './ind-models';
import type { Document } from 'mongoose';
import { CRegulation } from './models';

// Submission CRUD Operations
export async function createINDSubmission(data: {
  userId: string;
  submissionName: string;
  submissionType?: 'initial' | 'amendment' | 'annual_report';
}): Promise<INDSubmission> {
  const submission = new INDSubmissionModel({
    userId: data.userId,
    submissionName: data.submissionName,
    submissionType: data.submissionType || 'initial',
    status: 'draft',
    documentIds: []
  });

  return await submission.save();
}

export async function getINDSubmissionById(id: string): Promise<any> {
  return await INDSubmissionModel.findById(id).lean();
}

export async function getINDSubmissionsByUser(userId: string): Promise<any[]> {
  return await INDSubmissionModel.find({ userId })
    .sort({ updatedAt: -1 }).lean();
}

export async function updateINDSubmission(
  id: string,
  updates: any
): Promise<any> {
  return await INDSubmissionModel.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
}

export async function deleteINDSubmission(id: string): Promise<boolean> {
  try {
    // Also delete associated documents
    await INDDocumentModel.deleteMany({ submissionId: id });

    const result = await INDSubmissionModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting IND submission:', error);
    return false;
  }
}

// Document CRUD Operations
export async function createINDDocument(data: {
  submissionId: string;
  documentType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  originalPdfUrl: string;
  placeholderMapping?: Record<string, string>;
  formData?: Record<string, any>;
}): Promise<any> {
  const document = new INDDocumentModel({
    submissionId: data.submissionId,
    documentType: data.documentType,
    originalPdfUrl: data.originalPdfUrl,
    placeholderMapping: data.placeholderMapping || {},
    formData: data.formData || {},
    status: 'draft'
  });

  const savedDocument = await document.save();

  // Add document ID to submission
  await INDSubmissionModel.findByIdAndUpdate(
    data.submissionId,
    { $push: { documentIds: savedDocument._id } }
  );

  return savedDocument;
}

export async function getINDDocumentById(id: string): Promise<any> {
  return await INDDocumentModel.findById(id).lean();
}

export async function getINDDocumentsBySubmission(submissionId: string): Promise<any[]> {
  return await INDDocumentModel.find({ submissionId })
    .sort({ createdAt: -1 }).lean();
}

export async function updateINDDocument(
  id: string,
  updates: any
): Promise<any> {
  return await INDDocumentModel.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
}

export async function deleteINDDocument(id: string): Promise<boolean> {
  try {
    const document = await INDDocumentModel.findById(id).lean();
    if (!document) return false;

    // Remove document ID from submission
    await INDSubmissionModel.findByIdAndUpdate(
      document.submissionId,
      { $pull: { documentIds: id } }
    );

    // Delete the document
    await INDDocumentModel.findByIdAndDelete(id);
    return true;
  } catch (error) {
    console.error('Error deleting IND document:', error);
    return false;
  }
}

// Validation Operations
export async function updateDocumentValidation(
  documentId: string,
  validationReport: ValidationReport
): Promise<any> {
  const status = validationReport.structureValid &&
                validationReport.contentValid &&
                validationReport.regulatoryCompliant ? 'ready' : 'draft';

  return await updateINDDocument(documentId, {
    validationReport,
    status
  });
}

export async function updateDocumentFormData(
  documentId: string,
  formData: Record<string, any>
): Promise<any> {
  return await updateINDDocument(documentId, {
    formData,
    status: 'draft' // Reset status when form data changes
  });
}

// PDF Management Operations
export async function updateDocumentPdfUrls(
  documentId: string,
  urls: {
    editedPdfUrl?: string;
    renderedPdfUrl?: string;
  }
): Promise<any> {
  return await updateINDDocument(documentId, urls);
}

// Status Management
export async function updateSubmissionStatus(
  submissionId: string,
  status: 'draft' | 'in_progress' | 'ready' | 'submitted'
): Promise<any> {
  const updates: any = { status };

  if (status === 'submitted') {
    updates.submittedAt = new Date();
  }

  return await updateINDSubmission(submissionId, updates);
}

// Analytics and Reporting
export async function getSubmissionSummary(submissionId: string): Promise<{
  submission: INDSubmission | null;
  documents: INDDocument[];
  completionStatus: {
    totalDocuments: number;
    readyDocuments: number;
    completionPercentage: number;
  };
}> {
  const submission = await getINDSubmissionById(submissionId);
  const documents = await getINDDocumentsBySubmission(submissionId);

  const readyDocuments = documents.filter(doc => doc.status === 'ready').length;
  const completionPercentage = documents.length > 0
    ? Math.round((readyDocuments / documents.length) * 100)
    : 0;

  return {
    submission,
    documents,
    completionStatus: {
      totalDocuments: documents.length,
      readyDocuments,
      completionPercentage
    }
  };
}

// Search and Filter Operations
export async function searchINDSubmissions(
  userId: string,
  filters: {
    status?: string;
    submissionType?: string;
    searchTerm?: string;
  } = {}
): Promise<any[]> {
  const query: any = { userId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.submissionType) {
    query.submissionType = filters.submissionType;
  }

  if (filters.searchTerm) {
    query.submissionName = {
      $regex: filters.searchTerm,
      $options: 'i'
    };
  }

  return await INDSubmissionModel.find(query)
    .sort({ updatedAt: -1 }).lean();
}

export async function loadRegulationsFromMongoDB(cfrCodes?: string[]): Promise<any[]> {
  if (!cfrCodes || cfrCodes.length === 0) {
    return [];
  }
  const res = await CRegulation.find({ RegCode: { $in: cfrCodes } }).lean();
  const regs : Record<string, string> = {};
  for(const doc of res) {
    regs[doc.RegCode] = doc.RegText;
  }

  return regs;
}
