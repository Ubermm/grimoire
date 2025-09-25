//@ts-nocheck
// src/lib/db/ind-form-operations.ts - Database operations for IND Forms
import {
  INDFormSessionModel,
  INDFormTemplateModel,
  type INDFormSession,
  type INDFormTemplate
} from './ind-form-models';

// Session Operations
export async function createINDFormSession(data: {
  userId: string;
  formType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  title: string;
  textSeed?: string;
}): Promise<INDFormSession> {
  const session = new INDFormSessionModel({
    userId: data.userId,
    formType: data.formType,
    title: data.title,
    status: 'draft',
    formData: {},
    metadata: {
      completionPercentage: 0,
      lastSavedAt: new Date()
    },
    aiGeneratedFields: [],
    textSeed: data.textSeed
  });

  return await session.save();
}

export async function getINDFormSessionById(id: string): Promise<INDFormSession | null> {
  return await INDFormSessionModel.findById(id).lean();
}

export async function getINDFormSessionsByUser(userId: string): Promise<INDFormSession[]> {
  return await INDFormSessionModel.find({ userId })
    .sort({ updatedAt: -1 })
    .lean();
}

export async function updateINDFormSession(
  id: string,
  updates: Partial<INDFormSession>
): Promise<INDFormSession | null> {
  // Update metadata
  if (updates.formData) {
    updates.metadata = {
      ...updates.metadata,
      lastSavedAt: new Date()
    };
  }

  return await INDFormSessionModel.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
}

export async function saveINDFormData(
  sessionId: string,
  formData: Record<string, any>,
  aiGeneratedFields: string[] = []
): Promise<INDFormSession | null> {
  // Calculate completion percentage
  const template = await getINDFormTemplate(
    (await getINDFormSessionById(sessionId))?.formType || 'FDA_1571'
  );

  let completionPercentage = 0;
  if (template) {
    const requiredFields = template.fields.filter(f => f.required);
    const completedFields = requiredFields.filter(f =>
      formData[f.id] && formData[f.id] !== ''
    );
    completionPercentage = Math.round(
      (completedFields.length / requiredFields.length) * 100
    );
  }

  return await updateINDFormSession(sessionId, {
    formData,
    aiGeneratedFields,
    metadata: {
      completionPercentage,
      lastSavedAt: new Date()
    },
    status: completionPercentage === 100 ? 'completed' : 'in_progress'
  });
}

export async function deleteINDFormSession(id: string): Promise<boolean> {
  try {
    const result = await INDFormSessionModel.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting IND form session:', error);
    return false;
  }
}

// Template Operations
export async function createINDFormTemplate(
  template: Omit<INDFormTemplate, '_id' | 'createdAt' | 'updatedAt'>
): Promise<INDFormTemplate> {
  const newTemplate = new INDFormTemplateModel(template);
  return await newTemplate.save();
}

export async function getINDFormTemplate(
  formType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY'
): Promise<INDFormTemplate | null> {
  return await INDFormTemplateModel.findOne({ formType })
    .sort({ version: -1 }) // Get latest version
    .lean();
}

export async function getAllINDFormTemplates(): Promise<INDFormTemplate[]> {
  return await INDFormTemplateModel.find()
    .sort({ formType: 1, version: -1 })
    .lean();
}

// Validation Operations
export async function validateINDFormSession(sessionId: string): Promise<{
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}> {
  const session = await getINDFormSessionById(sessionId);
  if (!session) {
    return {
      isValid: false,
      errors: [{ field: 'session', message: 'Form session not found' }],
      warnings: []
    };
  }

  const template = await getINDFormTemplate(session.formType);
  if (!template) {
    return {
      isValid: false,
      errors: [{ field: 'template', message: 'Form template not found' }],
      warnings: []
    };
  }

  const errors: Array<{ field: string; message: string }> = [];
  const warnings: Array<{ field: string; message: string }> = [];

  // Validate required fields
  template.fields.forEach(field => {
    const value = session.formData[field.id];

    if (field.required && (!value || value === '')) {
      errors.push({
        field: field.id,
        message: `${field.label} is required`
      });
    }

    // Validate field-specific rules
    if (value && field.validation) {
      const validation = field.validation;

      if (validation.pattern) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          errors.push({
            field: field.id,
            message: `${field.label} format is invalid`
          });
        }
      }

      if (validation.minLength && value.length < validation.minLength) {
        errors.push({
          field: field.id,
          message: `${field.label} must be at least ${validation.minLength} characters`
        });
      }

      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push({
          field: field.id,
          message: `${field.label} must be less than ${validation.maxLength} characters`
        });
      }
    }
  });

  // Apply custom validation rules
  template.validationRules.forEach(rule => {
    // Simple rule evaluation - can be enhanced
    const value = session.formData[rule.fieldId];
    if (!value && rule.rule.includes('required')) {
      const severity = rule.severity || 'error';
      const target = severity === 'error' ? errors : warnings;
      target.push({
        field: rule.fieldId,
        message: rule.message
      });
    }
  });

  const validationResults = {
    isValid: errors.length === 0,
    errors,
    warnings
  };

  // Save validation results to session
  await updateINDFormSession(sessionId, {
    validationResults
  });

  return validationResults;
}

// AI Operations
export async function updateAIGeneratedFields(
  sessionId: string,
  newAIFields: string[]
): Promise<INDFormSession | null> {
  const session = await getINDFormSessionById(sessionId);
  if (!session) return null;

  const combinedAIFields = Array.from(
    new Set([...session.aiGeneratedFields, ...newAIFields])
  );

  return await updateINDFormSession(sessionId, {
    aiGeneratedFields: combinedAIFields
  });
}

// Search and Statistics
export async function searchINDFormSessions(
  userId: string,
  filters: {
    formType?: string;
    status?: string;
    searchTerm?: string;
  } = {}
): Promise<INDFormSession[]> {
  const query: any = { userId };

  if (filters.formType) {
    query.formType = filters.formType;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.searchTerm) {
    query.$or = [
      { title: { $regex: filters.searchTerm, $options: 'i' } },
      { 'metadata.sponsorName': { $regex: filters.searchTerm, $options: 'i' } },
      { 'metadata.studyTitle': { $regex: filters.searchTerm, $options: 'i' } }
    ];
  }

  return await INDFormSessionModel.find(query)
    .sort({ updatedAt: -1 })
    .lean();
}

export async function getINDFormStats(userId: string): Promise<{
  totalForms: number;
  completedForms: number;
  draftForms: number;
  submittedForms: number;
  byFormType: Record<string, number>;
}> {
  const sessions = await getINDFormSessionsByUser(userId);

  const stats = {
    totalForms: sessions.length,
    completedForms: sessions.filter(s => s.status === 'completed').length,
    draftForms: sessions.filter(s => s.status === 'draft').length,
    submittedForms: sessions.filter(s => s.status === 'submitted').length,
    byFormType: {} as Record<string, number>
  };

  // Count by form type
  sessions.forEach(session => {
    stats.byFormType[session.formType] = (stats.byFormType[session.formType] || 0) + 1;
  });

  return stats;
}