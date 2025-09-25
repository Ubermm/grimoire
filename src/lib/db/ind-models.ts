//@ts-nocheck
// src/lib/db/ind-models.ts - Independent IND Models
import mongoose, { Schema, model, models } from 'mongoose';
import { generateUUID } from '../utils';

// Type Definitions
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidationReport {
  structureValid: boolean;
  contentValid: boolean;
  regulatoryCompliant: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completionPercentage: number;
}

export interface INDDocument {
  _id: string;
  submissionId: string;
  documentType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  status: 'draft' | 'validating' | 'ready';

  // PDF Management
  originalPdfUrl: string;
  editedPdfUrl?: string;
  renderedPdfUrl?: string;

  // Data and validation
  formData: Record<string, any>;
  placeholderMapping: Record<string, string>;
  validationReport: ValidationReport;

  createdAt: Date;
  updatedAt: Date;
}

export interface INDSubmission {
  _id: string;
  userId: string;
  submissionName: string;
  status: 'draft' | 'in_progress' | 'ready' | 'submitted';
  submissionType: 'initial' | 'amendment' | 'annual_report';

  // Document references
  documentIds: string[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

// MongoDB Schemas
const ValidationErrorSchema = new Schema({
  field: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { _id: false });

const ValidationWarningSchema = new Schema({
  field: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
}, { _id: false });

const ValidationReportSchema = new Schema({
  structureValid: {
    type: Boolean,
    default: false
  },
  contentValid: {
    type: Boolean,
    default: false
  },
  regulatoryCompliant: {
    type: Boolean,
    default: false
  },
  errors: [ValidationErrorSchema],
  warnings: [ValidationWarningSchema],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, { _id: false });

const INDDocumentSchema = new Schema<INDDocument>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  submissionId: {
    type: String,
    required: true,
    index: true
  },
  documentType: {
    type: String,
    enum: ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'validating', 'ready'],
    default: 'draft'
  },

  // PDF Management
  originalPdfUrl: {
    type: String,
    required: true
  },
  editedPdfUrl: {
    type: String,
    required: false
  },
  renderedPdfUrl: {
    type: String,
    required: false
  },

  // Data and validation
  formData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  placeholderMapping: {
    type: Schema.Types.Mixed,
    default: {}
  },
  validationReport: {
    type: ValidationReportSchema,
    default: () => ({
      structureValid: false,
      contentValid: false,
      regulatoryCompliant: false,
      errors: [],
      warnings: [],
      completionPercentage: 0
    })
  }
}, {
  timestamps: true
});

const INDSubmissionSchema = new Schema<INDSubmission>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  submissionName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'ready', 'submitted'],
    default: 'draft'
  },
  submissionType: {
    type: String,
    enum: ['initial', 'amendment', 'annual_report'],
    default: 'initial'
  },

  // Document references
  documentIds: [{
    type: String,
    ref: 'INDDocument'
  }],

  // Submission metadata
  submittedAt: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
INDDocumentSchema.index({ submissionId: 1, documentType: 1 });
INDDocumentSchema.index({ status: 1 });
INDDocumentSchema.index({ createdAt: -1 });

INDSubmissionSchema.index({ userId: 1, status: 1 });
INDSubmissionSchema.index({ createdAt: -1 });
INDSubmissionSchema.index({ submissionType: 1 });

// Export models
export const INDDocumentModel = models.INDDocument || model<INDDocument>('INDDocument', INDDocumentSchema);
export const INDSubmissionModel = models.INDSubmission || model<INDSubmission>('INDSubmission', INDSubmissionSchema);
