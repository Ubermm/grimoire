// TypeScript types for the EU AI Act module. Mirrors the Mongoose models in
// src/lib/db/models.ts (CAISystem, CAIActRegulation, CAIActForm, CAIActAudit)
// and the regulation-agnostic validate "form" contract.
import type { RiskLevel } from './constants';

// ---- The shared validation "form" contract (same as /api/validate consumes) ----
export type QuestionType = 'SELECT' | 'CHECKBOX' | 'NUMERIC' | 'TEXT' | 'BOOLEAN';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  range?: { min: number; max: number };
  reference?: string;
}

export interface FormFact {
  template: string;
  question_id: string;
  description: string;
}

export interface FormValidation {
  rule: string;
  description: string;
  operators_used?: string[];
}

export interface FormQuery {
  query: string;
  description: string;
  validation_rule: string;
  // optional: classification wizard tags each query with the risk it implies
  risk?: RiskLevel | 'in_scope';
}

export interface ValidationForm {
  questions: FormQuestion[];
  facts: FormFact[];
  validations: FormValidation[];
  queries: FormQuery[];
}

export interface ValidationResponse {
  passed: boolean[];
  description: string[];
}

// ---- Entity types ----
export interface AnnexIVSection {
  key: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'flagged';
  content: string;
  responses: { questionId: string; answer: string; lastModified?: Date }[];
}

export interface AISystem {
  _id: string;
  userId: string;
  name: string;
  description: string;
  provider?: string;
  role: 'provider' | 'deployer' | 'importer' | 'distributor';
  isGPAI: boolean;
  riskLevel: RiskLevel;
  classificationBasis: string[];
  classificationResponses?: Record<string, string>;
  article50Obligations: string[];
  technicalDocumentation: AnnexIVSection[];
  validationResults: {
    formCode: string;
    passed: boolean[];
    description: string[];
    validatedAt: Date;
  }[];
  status: 'draft' | 'active' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AIActRegulation {
  _id: string;
  RegCode: string;
  RegText: string;
  category: 'prohibited' | 'transparency' | 'high_risk' | 'gpai' | 'tech_doc' | 'general';
  source?: string;
  FormCode?: string;
}

export interface AIActForm {
  _id: string;
  FormCode: string;
  RegCode?: string;
  FormText: string; // JSON.stringify(ValidationForm)
  generatedByLLM: boolean;
  editedByUser: boolean;
  version: number;
}

export interface ClassificationResult {
  riskLevel: RiskLevel;
  basis: string[];
  isGPAI: boolean;
  article50Obligations: string[];
}
