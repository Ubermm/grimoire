//@ts-nocheck
// src/lib/templates/template-engine.ts
import fs from 'fs';
import path from 'path';

export class TemplateEngine {
  private static templateCache: Map<string, string> = new Map();

  static async loadTemplate(templateName: string): Promise<string> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }

    const templatePath = path.join(process.cwd(), 'src/lib/templates', `${templateName}.template.txt`);

    try {
      const template = fs.readFileSync(templatePath, 'utf-8');
      this.templateCache.set(templateName, template);
      return template;
    } catch (error) {
      console.error(`Template not found: ${templateName}`, error);
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  static replacePlaceholders(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key.trim());

      // Handle checkboxes
      if (key.startsWith('CHECKBOX_')) {
        return value ? '☑' : '☐';
      }

      // Handle arrays (for multiple values)
      if (Array.isArray(value)) {
        return value.join(', ');
      }

      // Return value or placeholder if missing
      return value !== undefined && value !== null ? String(value) : `[${key}]`;
    });
  }

  private static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  static validateRequiredFields(formType: string, data: Record<string, any>) {
    const requiredFields = this.getRequiredFields(formType);
    const missing = requiredFields.filter(field =>
      this.getNestedValue(data, field) === undefined ||
      this.getNestedValue(data, field) === '' ||
      this.getNestedValue(data, field) === null
    );

    return {
      valid: missing.length === 0,
      missingFields: missing,
      completionPercentage: requiredFields.length > 0 ?
        ((requiredFields.length - missing.length) / requiredFields.length) * 100 : 100,
      errors: missing.map(field => ({
        field,
        message: `Required field missing: ${field}`
      }))
    };
  }

  private static getRequiredFields(formType: string): string[] {
    const fieldMap: Record<string, string[]> = {
      'FDA_1571': [
        'SERIAL_NUMBER', 'SUBMISSION_DATE', 'SPONSOR_NAME',
        'SPONSOR_ADDRESS_LINE1', 'SPONSOR_CITY', 'SPONSOR_STATE',
        'SPONSOR_ZIP', 'CONTACT_PERSON', 'CONTACT_PHONE', 'CONTACT_EMAIL',
        'DRUG_GENERIC_NAME', 'ACTIVE_INGREDIENTS', 'STUDY_TITLE',
        'STUDY_PHASE'
      ],
      'FDA_1572': [
        'INVESTIGATOR_NAME', 'INVESTIGATOR_ADDRESS_LINE1',
        'INVESTIGATOR_CITY', 'INVESTIGATOR_STATE', 'INVESTIGATOR_ZIP',
        'INVESTIGATOR_PHONE', 'INVESTIGATOR_EMAIL', 'INVESTIGATOR_EDUCATION',
        'STUDY_TITLE', 'SPONSOR_NAME'
      ],
      'INVESTIGATIONAL_PLAN': [
        'STUDY_TITLE', 'STUDY_PHASE', 'PRIMARY_OBJECTIVES',
        'STUDY_DESIGN', 'NUMBER_OF_SUBJECTS', 'PRIMARY_ENDPOINT',
        'PRINCIPAL_INVESTIGATOR', 'SPONSOR_NAME'
      ],
      'CMC_SUMMARY': [
        'DRUG_GENERIC_NAME', 'ACTIVE_INGREDIENTS', 'DOSAGE_FORM',
        'MANUFACTURING_SITE', 'QUALITY_SPECIFICATIONS'
      ]
    };

    return fieldMap[formType] || [];
  }

  static getTemplateFields(template: string): string[] {
    const matches = template.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];

    return matches
      .map(match => match.replace(/\{\{|\}\}/g, '').trim())
      .filter((field, index, array) => array.indexOf(field) === index); // Remove duplicates
  }

  static generateFieldPrompts(templateFields: string[]): Record<string, string> {
    const fieldPrompts: Record<string, string> = {};

    templateFields.forEach(field => {
      switch (field) {
        case 'SPONSOR_NAME':
          fieldPrompts[field] = 'Enter the sponsor organization name';
          break;
        case 'CONTACT_PERSON':
          fieldPrompts[field] = 'Enter the primary contact person name';
          break;
        case 'STUDY_TITLE':
          fieldPrompts[field] = 'Enter the clinical study title';
          break;
        case 'DRUG_GENERIC_NAME':
          fieldPrompts[field] = 'Enter the generic name of the investigational drug';
          break;
        case 'STUDY_PHASE':
          fieldPrompts[field] = 'Select the study phase (Phase I, II, III, or IV)';
          break;
        case 'PRINCIPAL_INVESTIGATOR':
          fieldPrompts[field] = 'Enter the principal investigator name';
          break;
        default:
          // Generate a human-readable prompt from the field name
          const humanReadable = field
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
          fieldPrompts[field] = `Enter ${humanReadable}`;
      }
    });

    return fieldPrompts;
  }
}
