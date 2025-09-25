//@ts-nocheck
// src/types/ind-types.ts - Common IND form types
export interface INDFormData {
  // Sponsor Information
  sponsorName: string;
  sponsorAddress: string;
  sponsorCity: string;
  sponsorState: string;
  sponsorZip: string;
  sponsorCountry: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;

  // Drug Information
  drugGenericName: string;
  drugTradeName: string;
  activeIngredients: string[];
  dosageForm: string;
  routeOfAdministration: string[];
  strength: string;

  // Study Information
  studyTitle: string;
  studyPhase: 'Phase_I' | 'Phase_II' | 'Phase_III' | 'Phase_IV';
  studyObjectives: string;
  backgroundRationale: string;
  studyDesign: string;
  subjectSelection: string;
  therapeuticArea: string;

  // Investigator Information
  investigatorName: string;
  investigatorAddress: string;
  investigatorCity: string;
  investigatorState: string;
  investigatorZip: string;
  investigatorEmail: string;
  investigatorPhone: string;
  educationTraining: string;
  clinicalExperience: string;
  qualifications: string;

  // Submission Information
  submissionType: 'initial' | 'amendment' | 'annual_report';
  serialNumber: string;
  submissionDate: string;

  // Additional fields as needed
  [key: string]: any;
}
