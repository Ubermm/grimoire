// src/lib/db/ind-form-models.ts - New Independent IND Form Models
import mongoose, { Schema, model, models } from 'mongoose';
import { generateUUID } from '../utils';

// Type Definitions
export interface INDFormSession {
  _id: string;
  userId: string;
  formType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  title: string;
  status: 'draft' | 'in_progress' | 'completed' | 'submitted';

  // Form data - similar to audit forms
  formData: Record<string, any>;
  metadata: {
    sponsorName?: string;
    studyTitle?: string;
    lastSavedAt?: Date;
    completionPercentage: number;
  };

  // AI features
  aiGeneratedFields: string[]; // Track which fields were AI-generated
  textSeed?: string; // Original text used for AI generation

  // Validation
  validationResults?: {
    isValid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  };

  createdAt: Date;
  updatedAt: Date;
}

export interface INDFormTemplate {
  _id: string;
  formType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  name: string;
  description: string;
  version: string;

  // Form structure - similar to audit questions
  fields: INDFormField[];
  sections: INDFormSection[];

  // Validation rules
  validationRules: Array<{
    fieldId: string;
    rule: string;
    message: string;
    severity: 'error' | 'warning';
  }>;

  // AI prompts for auto-fill
  aiPrompts: Record<string, string>;

  createdAt: Date;
  updatedAt: Date;
}

export interface INDFormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'date' | 'number' | 'email' | 'phone';
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  sectionId: string;
  aiExtractable: boolean; // Can this field be auto-filled from text?
  aiPrompt?: string; // Custom prompt for this field
}

export interface INDFormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  required: boolean;
}

// MongoDB Schemas
const INDFormFieldSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'textarea', 'select', 'checkbox', 'date', 'number', 'email', 'phone'],
    required: true
  },
  label: { type: String, required: true },
  description: String,
  placeholder: String,
  required: { type: Boolean, default: false },
  options: [String],
  validation: {
    pattern: String,
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number
  },
  sectionId: { type: String, required: true },
  aiExtractable: { type: Boolean, default: false },
  aiPrompt: String
}, { _id: false });

const INDFormSectionSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  required: { type: Boolean, default: false }
}, { _id: false });

const INDFormSessionSchema = new Schema<INDFormSession>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  formType: {
    type: String,
    enum: ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'completed', 'submitted'],
    default: 'draft'
  },

  // Form data storage
  formData: {
    type: Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    sponsorName: String,
    studyTitle: String,
    lastSavedAt: Date,
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },

  // AI features
  aiGeneratedFields: [String],
  textSeed: String,

  // Validation results
  validationResults: {
    isValid: { type: Boolean, default: false },
    errors: [{
      field: String,
      message: String
    }],
    warnings: [{
      field: String,
      message: String
    }]
  }
}, {
  timestamps: true
});

const INDFormTemplateSchema = new Schema<INDFormTemplate>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  formType: {
    type: String,
    enum: ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true
  },

  // Form structure
  fields: [INDFormFieldSchema],
  sections: [INDFormSectionSchema],

  // Validation and AI
  validationRules: [{
    fieldId: String,
    rule: String,
    message: String,
    severity: {
      type: String,
      enum: ['error', 'warning'],
      default: 'error'
    }
  }],
  aiPrompts: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
INDFormSessionSchema.index({ userId: 1, status: 1 });
INDFormSessionSchema.index({ formType: 1 });
INDFormSessionSchema.index({ createdAt: -1 });
INDFormSessionSchema.index({ 'metadata.lastSavedAt': -1 });

INDFormTemplateSchema.index({ formType: 1 });
INDFormTemplateSchema.index({ version: -1 });

// Export models
export const INDFormSessionModel = models.INDFormSession || model<INDFormSession>('INDFormSession', INDFormSessionSchema);
export const INDFormTemplateModel = models.INDFormTemplate || model<INDFormTemplate>('INDFormTemplate', INDFormTemplateSchema);