//@ts-nocheck
// src/lib/db/models.ts
import mongoose, { Schema, model, models } from 'mongoose';
import { generateUUID } from '../utils';
import type * as SchemaTypes from './schema';

// Add TypeScript interfaces for the new IND schemas
export interface INDFormResponse {
  questionId: string;
  fieldName: string;
  value: any;
  lastModified: Date;
}

export interface INDFormSection {
  id: string;
  sectionName: string;
  documentType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  status: 'pending' | 'in_progress' | 'completed' | 'flagged';
  responses: INDFormResponse[];
  validationResults?: {
    passed: boolean[];
    errors: string[];
    warnings: string[];
    completionPercentage: number;
  };
  comment?: string;
}

export interface INDSubmission {
  _id: string;
  name: string;
  userId: string;
  status: 'draft' | 'in_progress' | 'under_review' | 'completed' | 'submitted' | 'archived';
  submissionType: 'initial' | 'amendment' | 'annual_report' | 'safety_report';
  checkpoint: number;
  sections: INDFormSection[];
  metadata: any;
  documentUrls?: any;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}
import { any } from 'zod';

// User Model
const UserSchema = new Schema<SchemaTypes.User>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  email: {
    type: String,
    required: true,
    maxlength: 100
  },
  password: {
    type: String,
    maxlength: 100
  }
}, {
  timestamps: true
});

export const CUser = models.Users || model<SchemaTypes.User>('Users', UserSchema);

// Chat Model
const ChatSchema = new Schema<SchemaTypes.Chat>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  title: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CChat = models.Chat || model<SchemaTypes.Chat>('Chat', ChatSchema);

// Attachment Model
const AttachmentSchema = new Schema<SchemaTypes.Attachment>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  chatId: { type: String, required: true, index: true },
  messagePosition: { type: String, required: false, index: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  contentType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CAttachment = models.Attachment || model<SchemaTypes.Attachment>('Attachment', AttachmentSchema);

// Message Model
const MessageSchema = new Schema<SchemaTypes.Message>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  chatId: {
    type: String,
    ref: 'Chat',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  content: {
    type: Schema.Types.Mixed,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CMessage = models.Message || model<SchemaTypes.Message>('Message', MessageSchema);

// Vote Model
const VoteSchema = new Schema<SchemaTypes.Vote>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  chatId: {
    type: String,
    ref: 'Chat',
    required: true
  },
  messageId: {
    type: String,
    ref: 'Message',
    required: true
  },
  isUpvoted: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

VoteSchema.index({ chatId: 1, messageId: 1 });
export const CVote = models.Vote || model<SchemaTypes.Vote>('Vote', VoteSchema);

// Document Model
const DocumentSchema = new Schema<SchemaTypes.Document>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  title: {
    type: String,
    required: true
  },
  content: String,
  userId: {
    type: String,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CDocument = models.Document || model<SchemaTypes.Document>('Document', DocumentSchema);

// Suggestion Model
const SuggestionSchema = new Schema<SchemaTypes.Suggestion>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  documentId: {
    type: String,
    ref: 'Document',
    required: true
  },
  originalText: {
    type: String,
    required: true
  },
  suggestedText: {
    type: String,
    required: true
  },
  description: String,
  isResolved: {
    type: Boolean,
    default: false,
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CSuggestion = models.Suggestion || model<SchemaTypes.Suggestion>('Suggestion', SuggestionSchema);

// Warning Letter Model
const WarningLetterSchema = new Schema<SchemaTypes.WarningLetter>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    unique: true
  },
  cfr_codes: {
    type: String,
    required: true
  },
  fdc_codes: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CWarningLetter = models.warning_letters || model<SchemaTypes.WarningLetter>('warning_letters', WarningLetterSchema);

// Module Model
const ModuleSchema = new Schema<SchemaTypes.Module>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  chatId: {
    type: String,
    ref: 'Chat',
    required: true
  },
  modules: {
    type: [String],
    required: true
  },
  reports: {
    type: [String],
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CModule = models.Module || model<SchemaTypes.Module>('Module', ModuleSchema);

// Context Model
const ContextSchema = new Schema<SchemaTypes.Context>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  chatId: {
    type: String,
    ref: 'Chat',
    required: true
  },
  context: {
    type: {
      warningLetter: {
        type: String,
        required: true
      },
      warningLetterUrl: {
        type: String,
        required: false
      },
      qaContext: [{
        question: {
          type: String,
          required: true
        },
        answer: {
          type: String,
          required: true
        }
      }],
      report: {
        type: String,
        required: true
      },
    },
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CContext = models.Context || model<SchemaTypes.Context>('Context', ContextSchema);

// Report Model
const ReportSchema = new Schema<SchemaTypes.Report>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  chatId: {
    type: String,
    ref: 'Chat',
    required: true
  },
  report: {
    type: String,
    required: true
  },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CReport = models.Report || model<SchemaTypes.Report>('Report', ReportSchema);

// Find Model
const FindSchema = new Schema<SchemaTypes.Find>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  userId: {
    type: String,
    required: true
  },
  results: {
    type: [],
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  cfrVisualization: {
    type: String,
    required: true
  },
  fdcVisualization: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CFind = models.FindSimilar || model<SchemaTypes.Find>('FindSimilar', FindSchema);

// Compare Model
const CompareSchema = new Schema<SchemaTypes.Compare>({
  _id: {
      type: Schema.Types.Mixed,
      default: () => generateUUID()
  },
  userId: {
      type: String,
      required: true
  },
  content: {
      type: String,
      required: true
  },
  firstUrl: {
      type: String,
      required: true
  },
  secondUrl: {
      type: String,
      required: true
  },
  cfrVisualization: {
      type: String,
      required: true
  },
  fdcVisualization: {
      type: String,
      required: true
  },
  letterACodes: {
      cfrCodes: [String],
      fdcCodes: [String]
  },
  letterBCodes: {
      cfrCodes: [String],
      fdcCodes: [String]
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CCompare = models.Compare || model<SchemaTypes.Compare>('Compare', CompareSchema);

// Validate Model
const ValidateSchema = new Schema<SchemaTypes.Validate>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  flowchart: {
    type: String,
    required: true
  },
  prologGenText: {
    type: String,
    required: true
  },
  validationResults: {
    type: String,
    required: true
  },
  cfrVisualization: {
    type: String,
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

export const CValidate = models.Validate || model<SchemaTypes.Validate>('Validate', ValidateSchema);

// Contact Model
const ContactSchema = new Schema<SchemaTypes.Contact>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

ContactSchema.index({ userId: 1, email: 1, createdAt: -1 });
export const CContact = models.Contact || model<SchemaTypes.Contact>('Contact', ContactSchema);

const AuditResponseSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

const AuditSubsectionSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  pos: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'flagged'],
    default: 'pending'
  },
  responses: [AuditResponseSchema],
  deepResponses: [AuditResponseSchema],
  // Per-audit snapshot of the validation form (JSON string of {questions,facts,
  // validations,queries}). Frozen at create time so auditors can edit/add rules
  // without touching the shared global template; absent on legacy audits.
  form: {
    type: String,
    required: false
  },
  validationResults: {
    passed: [String],
    description: [String],
    // Tri-state verdict (pass|fail|escalate) + cited reason, aligned to queries.
    status: [String],
    reason: [String]
  },
  deepValidationResults: {
    passed: [String],
    description: [String],
    status: [String],
    reason: [String]
  },
  comment: {
    type: String,
    required: false
  },
});

const AuditSchema = new Schema<SchemaTypes.Audit>({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  name: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'under_review', 'completed', 'archived'],
    default: 'draft'
  },
  checkpoint: {
    type: Number,
    default: 0,
    min: 0
  },
  subsections: [AuditSubsectionSchema],
  metadata: {
    facility: String,
    auditType: String,
    department: String,
    reviewer: String
  },
  // Free-text + uploaded documents the auditor provides once; used to auto-fill
  // answers across all subsections with citations + confidence.
  contextDossier: {
    text: String,
    files: [{ url: String, name: String, contentType: String }]
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AuditSchema.index({ userId: 1, status: 1 });
AuditSchema.index({ createdAt: -1 });
AuditSchema.index({ 'subsections.code': 1 });

export const CAudit = models.Audit || model<SchemaTypes.Audit>('Audit', AuditSchema);

const regulationSchema = new mongoose.Schema({
  RegCode: {
    type: String,
    required: true,
    unique: true
  },
  RegText: {
    type: String,
    required: true
  },
  FormCode: {
    type: String,
    required: true
  }
});

// Define the Form Schema
const formSchema = new mongoose.Schema({
  FormCode: {
    type: String,
    required: true,
    unique: true
  },
  FormText: {
    type: String,
    required: true
  }
});

// Create models from the schemas
export const CRegulation = models.regulations || mongoose.model('regulations', regulationSchema);
export const CForm = models.forms || mongoose.model('forms', formSchema);

const searchSchema = new Schema({
  _id: Schema.Types.Mixed, // Accepts ObjectId or UUID
  Keys: {
    type: [String],
    required: true,
  },
});

export const CSearch = models.search || mongoose.model("search", searchSchema);

const additionalSchema = new mongoose.Schema({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  cfrCode: {
    type: String,
    required: true
  },
  FormText: {
    type: String,
    required: true
  }
});

export const CAdditional = models.additional || mongoose.model('additional', additionalSchema);

// ============================================================
// EU AI Act models (additive — parallel to the FDA collections,
// reusing the same generic AuditSubsection/AuditResponse schemas)
// ============================================================

// Annex IV technical-documentation section (nested in AISystem)
const AnnexIVSectionSchema = new Schema({
  key: { type: String, required: true },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'flagged'],
    default: 'pending'
  },
  content: { type: String, default: '' },
  responses: [AuditResponseSchema],
}, { _id: false });

// Central AI System registry
const AISystemSchema = new Schema({
  _id: { type: Schema.Types.Mixed, default: () => generateUUID() },
  userId: { type: String, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  provider: { type: String },
  role: {
    type: String,
    enum: ['provider', 'deployer', 'importer', 'distributor'],
    default: 'provider'
  },
  isGPAI: { type: Boolean, default: false },
  riskLevel: {
    type: String,
    enum: ['unclassified', 'prohibited', 'high', 'limited', 'minimal', 'gpai', 'gpai_systemic'],
    default: 'unclassified'
  },
  classificationBasis: [String],
  classificationResponses: Schema.Types.Mixed,
  article50Obligations: [String],
  technicalDocumentation: [AnnexIVSectionSchema],
  validationResults: [{
    formCode: String,
    passed: [Boolean],
    description: [String],
    validatedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'archived'],
    default: 'draft'
  },
}, { timestamps: true });
AISystemSchema.index({ userId: 1, riskLevel: 1 });

export const CAISystem = models.AISystem || model('AISystem', AISystemSchema);

// AI Act regulation text (parallel to CRegulation)
const aiActRegulationSchema = new Schema({
  _id: { type: Schema.Types.Mixed, default: () => generateUUID() },
  RegCode: { type: String, required: true, unique: true },
  RegText: { type: String, required: true },
  category: {
    type: String,
    enum: ['prohibited', 'transparency', 'high_risk', 'gpai', 'tech_doc', 'general'],
    default: 'general'
  },
  source: { type: String },
  FormCode: { type: String },
});
export const CAIActRegulation = models.ai_act_regulations || model('ai_act_regulations', aiActRegulationSchema);

// AI Act validation forms (parallel to CForm; supports hybrid LLM+human authoring)
const aiActFormSchema = new Schema({
  _id: { type: Schema.Types.Mixed, default: () => generateUUID() },
  FormCode: { type: String, required: true, unique: true },
  RegCode: { type: String },
  FormText: { type: String, required: true },
  generatedByLLM: { type: Boolean, default: false },
  editedByUser: { type: Boolean, default: false },
  version: { type: Number, default: 1 },
}, { timestamps: true });
export const CAIActForm = models.ai_act_forms || model('ai_act_forms', aiActFormSchema);

// AI Act audit (reuses the generic AuditSubsection schema)
const aiActAuditSchema = new Schema({
  _id: { type: Schema.Types.Mixed, default: () => generateUUID() },
  name: { type: String, required: true },
  userId: { type: String, ref: 'User', required: true },
  systemId: { type: String, ref: 'AISystem' },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'under_review', 'completed', 'archived'],
    default: 'draft'
  },
  checkpoint: { type: Number, default: 0, min: 0 },
  subsections: [AuditSubsectionSchema],
  metadata: {
    regulation: String,
    riskLevel: String,
    reviewer: String,
  },
  contextDossier: {
    text: String,
    files: [{ url: String, name: String, contentType: String }]
  },
  completedAt: { type: Date },
}, { timestamps: true });
aiActAuditSchema.index({ userId: 1, status: 1 });
export const CAIActAudit = models.ai_act_audits || model('ai_act_audits', aiActAuditSchema);

// IND Form Response Schema (following audit pattern)
const INDFormResponseSchema = new Schema({
  questionId: {
    type: String,
    required: true
  },
  fieldName: {
    type: String,
    required: true
  },
  value: {
    type: Schema.Types.Mixed,
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
});

// IND Form Section Schema (following audit pattern)
const INDFormSectionSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  sectionName: {
    type: String,
    required: true
  },
  documentType: {
    type: String,
    enum: ['FDA_1571', 'FDA_1572', 'INVESTIGATIONAL_PLAN', 'CMC_SUMMARY'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'flagged'],
    default: 'pending'
  },
  responses: [INDFormResponseSchema],
  validationResults: {
    passed: [Boolean],
    errors: [String],
    warnings: [String],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  comment: {
    type: String,
    required: false
  }
});

// IND Submission Schema (following audit pattern)
const INDSubmissionSchema = new Schema({
  _id: {
    type: Schema.Types.Mixed,
    default: () => generateUUID()
  },
  name: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'in_progress', 'under_review', 'completed', 'submitted', 'archived'],
    default: 'draft'
  },
  submissionType: {
    type: String,
    enum: ['initial', 'amendment', 'annual_report', 'safety_report'],
    default: 'initial'
  },
  checkpoint: {
    type: Number,
    default: 0,
    min: 0
  },
  sections: [INDFormSectionSchema],
  metadata: {
    sponsorInfo: {
      name: String,
      contactPerson: String,
      email: String,
      phone: String,
      address: String
    },
    drugInfo: {
      genericName: String,
      tradeName: String,
      activeIngredients: [String],
      dosageForm: String,
      routeOfAdministration: [String]
    },
    studyInfo: {
      title: String,
      phase: {
        type: String,
        enum: ['Phase_I', 'Phase_II', 'Phase_III', 'Phase_IV']
      },
      objectives: String,
      therapeuticArea: String
    },
    investigatorInfo: {
      name: String,
      email: String,
      phone: String,
      qualifications: String
    }
  },
  submittedAt: {
    type: Date
  },
  // Document management (following current system)
  documentUrls: {
    fda1571Url: String,
    fda1572Url: String,
    investigationalPlanUrl: String,
    cmcSummaryUrl: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
INDSubmissionSchema.index({ userId: 1, status: 1 });
INDSubmissionSchema.index({ createdAt: -1 });
INDSubmissionSchema.index({ 'sections.documentType': 1 });
INDSubmissionSchema.index({ submissionType: 1 });

export const CINDSubmission = models.INDSubmission || model('INDSubmission', INDSubmissionSchema);

