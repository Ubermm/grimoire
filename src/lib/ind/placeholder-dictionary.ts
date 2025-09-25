export interface PlaceholderField {
  pdfPlaceholder: string;
  fieldType: 'text' | 'checkbox' | 'radio' | 'date' | 'number' | 'select' | 'dropdown' | 'textarea';
  required: boolean;
  validation?: string;         // Regex or validation rule
  description: string;         // Human-readable description
  options?: string[];          // For select/radio fields
  placeholder?: string;        // Input placeholder text
  pdfFieldName?: string;       // Actual PDF form field name
}

export interface PlaceholderDictionary {
  [documentType: string]: {
    [formField: string]: PlaceholderField;
  };
}

// Main dictionary with PDF field mappings based on actual FDA forms
export const PLACEHOLDER_DICTIONARY: PlaceholderDictionary = {
  'FDA_1571': {
    // 1. NAME OF SPONSOR
    'sponsorName': {
      pdfPlaceholder: '{{SPONSOR_NAME}}',
      fieldType: 'text',
      required: true,
      description: 'Name of Sponsor',
      placeholder: 'Enter sponsor organization name',
      pdfFieldName: 'SPONSOR_NAME'
    },

    // 2. DATE OF SUBMISSION
    'submissionDate': {
      pdfPlaceholder: '11/11/1111',
      fieldType: 'date',
      required: true,
      description: 'Date of Submission (mm/dd/yyyy)',
      pdfFieldName: 'SUBMISSION_DATE'
    },

    // 3. SPONSOR ADDRESS
    'sponsorAddressLine1': {
      pdfPlaceholder: '{{SPONSOR_ADDRESS_1}}',
      fieldType: 'text',
      required: true,
      description: 'Address 1 (Street address, P.O. box, company name c/o)',
      placeholder: 'Street address',
      pdfFieldName: 'SPONSOR_ADDRESS_1'
    },
    'sponsorAddressLine2': {
      pdfPlaceholder: '{{SPONSOR_ADDRESS_2}}',
      fieldType: 'text',
      required: false,
      description: 'Address 2 (Apartment, suite, unit, building, floor, etc.)',
      placeholder: 'Apt, suite, etc.',
      pdfFieldName: 'SPONSOR_ADDRESS_2'
    },
    'sponsorCity': {
      pdfPlaceholder: '{{SPONSOR_CITY}}',
      fieldType: 'text',
      required: true,
      description: 'City',
      placeholder: 'City',
      pdfFieldName: 'SPONSOR_CITY'
    },
    'sponsorState': {
      pdfPlaceholder: '{{SPONSOR_STATE}}',
      fieldType: 'text',
      required: true,
      description: 'State/Province/Region',
      placeholder: 'State',
      pdfFieldName: 'SPONSOR_STATE'
    },
    'sponsorCountry': {
      pdfPlaceholder: '{{SPONSOR_COUNTRY}}',
      fieldType: 'text',
      required: true,
      description: 'Country',
      placeholder: 'Country',
      pdfFieldName: 'SPONSOR_COUNTRY'
    },
    'sponsorZip': {
      pdfPlaceholder: '{{SPONSOR_ZIP}}',
      fieldType: 'text',
      required: true,
      description: 'ZIP or Postal Code',
      placeholder: 'ZIP code',
      validation: '^[A-Za-z0-9\\s-]{3,12}$',
      pdfFieldName: 'SPONSOR_ZIP'
    },

    // 4. TELEPHONE NUMBER
    'telephoneNumber': {
      pdfPlaceholder: '{{TELEPHONE_NUMBER}}',
      fieldType: 'text',
      required: true,
      description: 'Telephone Number (Include country code if applicable and area code)',
      placeholder: '+1-555-123-4567',
      validation: '^(\\+?1[-.\s]?)?\\(?([0-9]{3})\\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$',
      pdfFieldName: 'TELEPHONE_NUMBER'
    },

    // 5. NAME OF DRUG
    'drugName': {
      pdfPlaceholder: '{{DRUG_NAME}}',
      fieldType: 'textarea',
      required: true,
      description: 'Name of Drug (Include all available names: Trade, Generic, Chemical, or Code)',
      placeholder: 'Enter all available drug names',
      pdfFieldName: 'DRUG_NAME'
    },

    // 6A. IND NUMBER
    'indNumber': {
      pdfPlaceholder: '{{IND_NUMBER}}',
      fieldType: 'text',
      required: false,
      description: 'IND Number (If previously assigned)',
      placeholder: 'IND number if previously assigned',
      pdfFieldName: 'IND_NUMBER'
    },

    // 6B. SELECT ONE (Radio buttons)
    'sponsorType': {
      pdfPlaceholder: '{{SPONSOR_TYPE}}',
      fieldType: 'radio',
      required: true,
      description: 'Select One: Commercial or Research',
      options: ['Commercial', 'Research'],
      pdfFieldName: 'SPONSOR_TYPE'
    },

    // 7A. PROPOSED INDICATION FOR USE
    'proposedIndication': {
      pdfPlaceholder: '{{PROPOSED_INDICATION}}',
      fieldType: 'textarea',
      required: true,
      description: '(Proposed) Indication for Use',
      placeholder: 'Describe the proposed indication',
      pdfFieldName: 'PROPOSED_INDICATION'
    },

    // 7A. RARE DISEASE (Radio buttons)
    'isRareDisease': {
      pdfPlaceholder: '{{IS_RARE_DISEASE}}',
      fieldType: 'radio',
      required: true,
      description: 'Is this indication for a rare disease (prevalence <200,000 in U.S.)?',
      options: ['Yes', 'No'],
      pdfFieldName: 'IS_RARE_DISEASE'
    },

    // 7A. ORPHAN DESIGNATION (Radio buttons)
    'hasOrphanDesignation': {
      pdfPlaceholder: '{{HAS_ORPHAN_DESIGNATION}}',
      fieldType: 'radio',
      required: false,
      description: 'Does this product have an FDA Orphan Designation for this indication?',
      options: ['Yes', 'No'],
      pdfFieldName: 'HAS_ORPHAN_DESIGNATION'
    },

    // ORPHAN DESIGNATION NUMBER
    'orphanDesignationNumber': {
      pdfPlaceholder: '{{ORPHAN_DESIGNATION_NUMBER}}',
      fieldType: 'text',
      required: false,
      description: 'If yes, provide the Orphan Designation number for this indication',
      placeholder: 'Orphan designation number',
      pdfFieldName: 'ORPHAN_DESIGNATION_NUMBER'
    },

    // 7B. SNOMED CT INDICATION
    'snomedCtIndication': {
      pdfPlaceholder: '{{SNOMED_CT_INDICATION}}',
      fieldType: 'text',
      required: false,
      description: 'SNOMED CT Indication Disease Term',
      placeholder: 'SNOMED CT code and term',
      pdfFieldName: 'SNOMED_CT_INDICATION'
    },

    // 8. PHASE OF CLINICAL INVESTIGATION (Multiple checkboxes)
    'phaseOfInvestigation': {
      pdfPlaceholder: '{{PHASE_OF_INVESTIGATION}}',
      fieldType: 'checkbox',
      required: true,
      description: 'Phase of Clinical Investigation to be conducted',
      options: ['Phase 1', 'Phase 2', 'Phase 3', 'Other (Specify)'],
      pdfFieldName: 'PHASE_OF_INVESTIGATION'
    },

    // OTHER PHASE SPECIFICATION
    'otherPhaseSpecification': {
      pdfPlaceholder: '{{OTHER_PHASE_SPECIFICATION}}',
      fieldType: 'text',
      required: false,
      description: 'Other Phase Specification',
      placeholder: 'Specify other phase',
      pdfFieldName: 'OTHER_PHASE_SPECIFICATION'
    },

    // 9. REFERENCES
    'references': {
      pdfPlaceholder: '{{REFERENCES}}',
      fieldType: 'textarea',
      required: false,
      description: 'List numbers of all INDs, NDAs, DMFs, and BLAs referred to in this application',
      placeholder: 'List reference numbers',
      pdfFieldName: 'REFERENCES'
    },

    // 10. SERIAL NUMBER
    'serialNumber': {
      pdfPlaceholder: '^^^^',
      fieldType: 'text',
      required: true,
      description: 'Serial Number (Initial IND should be 0000, subsequent submissions numbered consecutively)',
      placeholder: 'e.g., 0000',
      pdfFieldName: 'SERIAL_NUMBER'
    },

    // 11. SUBMISSION CONTENTS (Multiple checkboxes grouped)
    'submissionContents': {
      pdfPlaceholder: '{{SUBMISSION_CONTENTS}}',
      fieldType: 'checkbox',
      required: false,
      description: 'This submission contains (Select all that apply)',
      options: [
        'Initial Investigational New Drug Application (IND)',
        'Request For Reactivation Or Reinstatement',
        'Development Safety Update Report (DSUR)',
        'New Protocol',
        'Protocol Amendment',
        'Information Amendment',
        'Request for Meeting',
        'IND Safety Report',
        'Change in Protocol',
        'New Investigator',
        'Human Factors Protocol',
        'Chemistry/Microbiology',
        'Pharmacology/Toxicology',
        'Clinical/Safety',
        'Statistics',
        'Proprietary Name Review',
        'Special Protocol Assessment',
        'PMR/PMC Protocol',
        'Clinical Pharmacology',
        'Initial Written Report',
        'Follow-up to a Written Report',
        'Formal Dispute Resolution',
        'Response to Clinical Hold',
        'Annual Report',
        'Response To FDA Request For Information',
        'General Correspondence'
      ],
      pdfFieldName: 'SUBMISSION_CONTENTS'
    },
    'otherSubmissionType': {
      pdfPlaceholder: '{{OTHER_SUBMISSION_TYPE}}',
      fieldType: 'text',
      required: false,
      description: 'Other (Specify)',
      placeholder: 'Specify other submission type',
      pdfFieldName: 'OTHER_SUBMISSION_TYPE'
    },

    // 12. COMBINATION PRODUCT
    'isCombinationProduct': {
      pdfPlaceholder: '{{IS_COMBINATION_PRODUCT}}',
      fieldType: 'radio',
      required: false,
      description: 'For Originals, is the product a combination product (21 CFR 3.2(e))?',
      options: ['Yes', 'No'],
      pdfFieldName: 'IS_COMBINATION_PRODUCT'
    },
    'combinationProductType': {
      pdfPlaceholder: '{{COMBINATION_PRODUCT_TYPE}}',
      fieldType: 'text',
      required: false,
      description: 'Combination Product Type (See instructions)',
      placeholder: 'Product type',
      pdfFieldName: 'COMBINATION_PRODUCT_TYPE'
    },
    'rfdNumber': {
      pdfPlaceholder: '{{}}',
      fieldType: 'text',
      required: false,
      description: 'Request for Designation (RFD) Number',
      placeholder: 'RFD number',
      pdfFieldName: 'RFD_NUMBER'
    },

    // 13. EXPANDED ACCESS USE & SPECIAL SELECTIONS (Multiple checkboxes grouped)
    'expandedAccessUse': {
      pdfPlaceholder: '{{EXPANDED_ACCESS_USE}}',
      fieldType: 'checkbox',
      required: false,
      description: 'Expanded Access Use (Select all that apply)',
      options: [
        'Individual Patient, NonEmergency 21 CFR 312.310',
        'Individual Patient, Emergency 21 CFR 312.310(d)',
        'Intermediate Size Patient Population, 21 CFR 312.315',
        'Treatment IND or Protocol, 21 CFR 312.320'
      ],
      pdfFieldName: 'EXPANDED_ACCESS_USE'
    },
    'specialSelections': {
      pdfPlaceholder: '{{SPECIAL_SELECTIONS}}',
      fieldType: 'checkbox',
      required: false,
      description: 'Special Selections (Select all that apply)',
      options: [
        'Emergency Research Exception From Informed Consent Requirements, 21 CFR 312.23 (f)',
        'Charge Request, 21 CFR 312.8'
      ],
      pdfFieldName: 'SPECIAL_SELECTIONS'
    },

    // PAGE 2 FIELDS
    // 14. CONTENTS OF APPLICATION (Multiple checkboxes grouped)
    'contentsOfApplication': {
      pdfPlaceholder: '{{CONTENTS_OF_APPLICATION}}',
      fieldType: 'checkbox',
      required: false,
      description: 'Contents of Application (Select all that apply)',
      options: [
        'Form FDA 1571 (21 CFR 312.23(a)(1))',
        'Table of Contents (21 CFR 312.23(a)(2))',
        'Introductory statement (21 CFR 312.23(a)(3))',
        'General Investigational plan (21 CFR 312.23(a)(3))',
        "Investigator's brochure (21 CFR 312.23(a)(5))",
        'Study protocol (21 CFR 312.23(a)(6))',
        'Investigator data (21 CFR 312.23(a)(6)(iii)(b)) or completed Form FDA 1572',
        'Facilities data (21 CFR 312.23(a)(6)(iii)(b)) or completed Form FDA 1572',
        'Institutional Review Board data (21 CFR 312.23(a)(6)(iii)(b)) or completed Form FDA 1572',
        'Chemistry, manufacturing, and control data (21 CFR 312.23(a)(7))',
        'Environmental assessment or claim for exclusion (21 CFR 312.23(a)(7)(iv)(e))',
        'Pharmacology and toxicology data (21 CFR 312.23(a)(8))',
        'Previous human experience (21 CFR 312.23(a)(9))',
        'Additional information (21 CFR 312.23(a)(10))',
        'Biosimilar User Fee Cover Sheet (Form FDA 3792)',
        'Clinical Trials Certification of Compliance (Form FDA 3674)'
      ],
      pdfFieldName: 'CONTENTS_OF_APPLICATION'
    },

    // 15. CONTRACT RESEARCH ORGANIZATION
    'contractResearchOrganization': {
      pdfPlaceholder: '{{CONTRACT_RESEARCH_ORGANIZATION}}',
      fieldType: 'radio',
      required: false,
      description: 'Is any part of the clinical study to be conducted by a contract research organization?',
      options: ['Yes', 'No'],
      pdfFieldName: 'CONTRACT_RESEARCH_ORGANIZATION'
    },
    'sponsorObligationsTransferred': {
      pdfPlaceholder: '{{SPONSOR_OBLIGATIONS_TRANSFERRED}}',
      fieldType: 'radio',
      required: false,
      description: 'If Yes, will any sponsor obligations be transferred to the contract research organization?',
      options: ['Yes', 'No'],
      pdfFieldName: 'SPONSOR_OBLIGATIONS_TRANSFERRED'
    },

    // 16-17. MONITORING AND SAFETY PERSONNEL
    'monitoringPersonName': {
      pdfPlaceholder: '{{MONITORING_PERSON_NAME}}',
      fieldType: 'text',
      required: false,
      description: 'Name and Title of the person responsible for monitoring the conduct and progress of the clinical investigations',
      placeholder: 'Monitor name and title',
      pdfFieldName: 'MONITORING_PERSON_NAME'
    },
    'safetyPersonName': {
      pdfPlaceholder: '{{SAFETY_PERSON_NAME}}',
      fieldType: 'text',
      required: false,
      description: 'Name and Title of the person responsible for review and evaluation of information relevant to the safety of the drug',
      placeholder: 'Safety person name and title',
      pdfFieldName: 'SAFETY_PERSON_NAME'
    },

    // 18-23. SPONSOR REPRESENTATIVE INFORMATION
    'sponsorRepName': {
      pdfPlaceholder: '{{SPONSOR_REP_NAME}}',
      fieldType: 'text',
      required: true,
      description: 'Name of Sponsor or Sponsor\'s Authorized Representative',
      placeholder: 'Representative name',
      pdfFieldName: 'SPONSOR_REP_NAME'
    },
    'sponsorRepPhone': {
      pdfPlaceholder: '{{SPONSOR_REP_PHONE}}',
      fieldType: 'text',
      required: true,
      description: 'Telephone Number (Include country code if applicable and area code)',
      placeholder: '+1-555-123-4567',
      validation: '^(\\+?1[-.\s]?)?\\(?([0-9]{3})\\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$',
      pdfFieldName: 'SPONSOR_REP_PHONE'
    },
    'sponsorRepFax': {
      pdfPlaceholder: '{{SPONSOR_REP_FAX}}',
      fieldType: 'text',
      required: false,
      description: 'Facsimile (FAX) Number (Include country code if applicable and area code)',
      placeholder: '+1-555-123-4567',
      pdfFieldName: 'SPONSOR_REP_FAX'
    },
    'sponsorRepAddress1': {
      pdfPlaceholder: '{{SPONSOR_REP_ADDRESS_1}}',
      fieldType: 'text',
      required: true,
      description: 'Address 1 (Street address, P.O. box, company name c/o)',
      placeholder: 'Street address',
      pdfFieldName: 'SPONSOR_REP_ADDRESS_1'
    },
    'sponsorRepAddress2': {
      pdfPlaceholder: '{{SPONSOR_REP_ADDRESS_2}}',
      fieldType: 'text',
      required: false,
      description: 'Address 2 (Apartment, suite, unit, building, floor, etc.)',
      placeholder: 'Apt, suite, etc.',
      pdfFieldName: 'SPONSOR_REP_ADDRESS_2'
    },
    'sponsorRepCity': {
      pdfPlaceholder: '{{SPONSOR_REP_CITY}}',
      fieldType: 'text',
      required: true,
      description: 'City',
      placeholder: 'City',
      pdfFieldName: 'SPONSOR_REP_CITY'
    },
    'sponsorRepState': {
      pdfPlaceholder: '{{SPONSOR_REP_STATE}}',
      fieldType: 'text',
      required: true,
      description: 'State/Province/Region',
      placeholder: 'State',
      pdfFieldName: 'SPONSOR_REP_STATE'
    },
    'sponsorRepCountry': {
      pdfPlaceholder: '{{SPONSOR_REP_COUNTRY}}',
      fieldType: 'text',
      required: true,
      description: 'Country',
      placeholder: 'Country',
      pdfFieldName: 'SPONSOR_REP_COUNTRY'
    },
    'sponsorRepZip': {
      pdfPlaceholder: '{{SPONSOR_REP_ZIP}}',
      fieldType: 'text',
      required: true,
      description: 'ZIP or Postal Code',
      placeholder: 'ZIP code',
      validation: '^[A-Za-z0-9\\s-]{3,12}$',
      pdfFieldName: 'SPONSOR_REP_ZIP'
    },
    'sponsorRepEmail': {
      pdfPlaceholder: '{{SPONSOR_REP_EMAIL}}',
      fieldType: 'text',
      required: true,
      description: 'Email Address',
      placeholder: 'contact@example.com',
      validation: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      pdfFieldName: 'SPONSOR_REP_EMAIL'
    },
    'sponsorSignatureDate': {
      pdfPlaceholder: '02/02/2222',
      fieldType: 'date',
      required: true,
      description: 'Date of Sponsor\'s Signature (mm/dd/yyyy)',
      pdfFieldName: 'SPONSOR_SIGNATURE_DATE'
    },

    // 24-26. COUNTERSIGNER INFORMATION
    'countersignerName': {
      pdfPlaceholder: '{{COUNTERSIGNER_NAME}}',
      fieldType: 'text',
      required: false,
      description: 'Name of Countersigner',
      placeholder: 'Countersigner name',
      pdfFieldName: 'COUNTERSIGNER_NAME'
    },
    'countersignerAddress1': {
      pdfPlaceholder: '{{COUNTERSIGNER_ADDRESS_1}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner Address 1 (Street address, P.O. box, company name c/o)',
      placeholder: 'Street address',
      pdfFieldName: 'COUNTERSIGNER_ADDRESS_1'
    },
    'countersignerAddress2': {
      pdfPlaceholder: '{{COUNTERSIGNER_ADDRESS_2}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner Address 2 (Apartment, suite, unit, building, floor, etc.)',
      placeholder: 'Apt, suite, etc.',
      pdfFieldName: 'COUNTERSIGNER_ADDRESS_2'
    },
    'countersignerCity': {
      pdfPlaceholder: '{{COUNTERSIGNER_CITY}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner City',
      placeholder: 'City',
      pdfFieldName: 'COUNTERSIGNER_CITY'
    },
    'countersignerState': {
      pdfPlaceholder: '{{COUNTERSIGNER_STATE}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner State/Province/Region',
      placeholder: 'State',
      pdfFieldName: 'COUNTERSIGNER_STATE'
    },
    'countersignerCountry': {
      pdfPlaceholder: '{{COUNTERSIGNER_COUNTRY}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner Country',
      placeholder: 'Country',
      pdfFieldName: 'COUNTERSIGNER_COUNTRY'
    },
    'countersignerZip': {
      pdfPlaceholder: '{{COUNTERSIGNER_ZIP}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner ZIP or Postal Code',
      placeholder: 'ZIP code',
      validation: '^[A-Za-z0-9\\s-]{3,12}$',
      pdfFieldName: 'COUNTERSIGNER_ZIP'
    },
    'countersignerEmail': {
      pdfPlaceholder: '{{COUNTERSIGNER_EMAIL}}',
      fieldType: 'text',
      required: false,
      description: 'Countersigner Email Address',
      placeholder: 'contact@example.com',
      validation: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
      pdfFieldName: 'COUNTERSIGNER_EMAIL'
    },

    // 27-28. SIGNATURES
    'sponsorSignature': {
      pdfPlaceholder: '{{SPONSOR_SIGNATURE}}',
      fieldType: 'text',
      required: true,
      description: 'Signature of Sponsor or Sponsor\'s Authorized Representative',
      placeholder: 'Digital signature or signature field',
      pdfFieldName: 'SPONSOR_SIGNATURE'
    },
    'countersignerSignature': {
      pdfPlaceholder: '{{COUNTERSIGNER_SIGNATURE}}',
      fieldType: 'text',
      required: false,
      description: 'Signature of Countersigner',
      placeholder: 'Digital signature or signature field',
      pdfFieldName: 'COUNTERSIGNER_SIGNATURE'
    }
  },

    // FDA 1572 Statement of Investigator - Ordered by form sections
'FDA_1572': {
  // 1. NAME AND ADDRESS OF INVESTIGATOR
  'investigatorName': {
    pdfPlaceholder: '{{INVESTIGATOR_NAME}}',
    fieldType: 'text',
    required: true,
    description: 'Name of Clinical Investigator',
    placeholder: 'Enter full name of investigator',
    pdfFieldName: 'INVESTIGATOR_NAME'
  },
  'investigatorAddress1': {
    pdfPlaceholder: '{{INVESTIGATOR_ADDRESS_1}}',
    fieldType: 'text',
    required: true,
    description: 'Address 1',
    placeholder: 'Street address',
    pdfFieldName: 'INVESTIGATOR_ADDRESS_1'
  },
  'investigatorAddress2': {
    pdfPlaceholder: '{{INVESTIGATOR_ADDRESS_2}}',
    fieldType: 'text',
    required: false,
    description: 'Address 2',
    placeholder: 'Apt, suite, etc. (optional)',
    pdfFieldName: 'INVESTIGATOR_ADDRESS_2'
  },
  'investigatorCity': {
    pdfPlaceholder: '{{INVESTIGATOR_CITY}}',
    fieldType: 'text',
    required: true,
    description: 'City',
    placeholder: 'City',
    pdfFieldName: 'INVESTIGATOR_CITY'
  },
  'investigatorState': {
    pdfPlaceholder: '{{INVESTIGATOR_STATE}}',
    fieldType: 'text',
    required: true,
    description: 'State/Province/Region',
    placeholder: 'State/Province/Region',
    pdfFieldName: 'INVESTIGATOR_STATE'
  },
  'investigatorCountry': {
    pdfPlaceholder: '{{INVESTIGATOR_COUNTRY}}',
    fieldType: 'text',
    required: true,
    description: 'Country',
    placeholder: 'Country',
    pdfFieldName: 'INVESTIGATOR_COUNTRY'
  },
  'investigatorZip': {
    pdfPlaceholder: '{{INVESTIGATOR_ZIP}}',
    fieldType: 'text',
    required: true,
    description: 'ZIP or Postal Code',
    placeholder: 'ZIP/Postal Code',
    validation: '^[A-Za-z0-9\\s-]{3,12}$',
    pdfFieldName: 'INVESTIGATOR_ZIP'
  },

  // 2. EDUCATION, TRAINING, AND EXPERIENCE (Radio buttons - select one)
  'qualificationType': {
    pdfPlaceholder: '{{QUALIFICATION_TYPE}}',
    fieldType: 'radio',
    required: true,
    description: 'One of the following is provided (Select one of the following)',
    options: ['Curriculum Vitae', 'Other Statement of Qualifications'],
    pdfFieldName: 'QUALIFICATION_TYPE'
  },

  // 3. NAME AND ADDRESS OF ANY MEDICAL SCHOOL, HOSPITAL, OR OTHER RESEARCH FACILITY
  'medicalFacilityName': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_NAME}}',
    fieldType: 'text',
    required: true,
    description: 'Name of Medical School, Hospital, or Other Research Facility',
    placeholder: 'Institution/facility name',
    pdfFieldName: 'MEDICAL_FACILITY_NAME'
  },
  'medicalFacilityAddress1': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_ADDRESS_1}}',
    fieldType: 'text',
    required: true,
    description: 'Medical Facility Address 1',
    placeholder: 'Street address',
    pdfFieldName: 'MEDICAL_FACILITY_ADDRESS_1'
  },
  'medicalFacilityAddress2': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_ADDRESS_2}}',
    fieldType: 'text',
    required: false,
    description: 'Medical Facility Address 2',
    placeholder: 'Apt, suite, etc. (optional)',
    pdfFieldName: 'MEDICAL_FACILITY_ADDRESS_2'
  },
  'medicalFacilityCity': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_CITY}}',
    fieldType: 'text',
    required: true,
    description: 'Medical Facility City',
    placeholder: 'City',
    pdfFieldName: 'MEDICAL_FACILITY_CITY'
  },
  'medicalFacilityState': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_STATE}}',
    fieldType: 'text',
    required: true,
    description: 'Medical Facility State/Province/Region',
    placeholder: 'State/Province/Region',
    pdfFieldName: 'MEDICAL_FACILITY_STATE'
  },
  'medicalFacilityCountry': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_COUNTRY}}',
    fieldType: 'text',
    required: true,
    description: 'Medical Facility Country',
    placeholder: 'Country',
    pdfFieldName: 'MEDICAL_FACILITY_COUNTRY'
  },
  'medicalFacilityZip': {
    pdfPlaceholder: '{{MEDICAL_FACILITY_ZIP}}',
    fieldType: 'text',
    required: true,
    description: 'Medical Facility ZIP or Postal Code',
    placeholder: 'ZIP/Postal Code',
    validation: '^[A-Za-z0-9\\s-]{3,12}$',
    pdfFieldName: 'MEDICAL_FACILITY_ZIP'
  },

  // 4. NAME AND ADDRESS OF ANY CLINICAL LABORATORY FACILITIES TO BE USED IN THE STUDY
  'clinicalLabName': {
    pdfPlaceholder: '{{CLINICAL_LAB_NAME}}',
    fieldType: 'text',
    required: false,
    description: 'Name of Clinical Laboratory Facility',
    placeholder: 'Laboratory facility name',
    pdfFieldName: 'CLINICAL_LAB_NAME'
  },
  'clinicalLabAddress1': {
    pdfPlaceholder: '{{CLINICAL_LAB_ADDRESS_1}}',
    fieldType: 'text',
    required: false,
    description: 'Clinical Laboratory Address 1',
    placeholder: 'Street address',
    pdfFieldName: 'CLINICAL_LAB_ADDRESS_1'
  },
  'clinicalLabAddress2': {
    pdfPlaceholder: '{{CLINICAL_LAB_ADDRESS_2}}',
    fieldType: 'text',
    required: false,
    description: 'Clinical Laboratory Address 2',
    placeholder: 'Apt, suite, etc. (optional)',
    pdfFieldName: 'CLINICAL_LAB_ADDRESS_2'
  },
  'clinicalLabCity': {
    pdfPlaceholder: '{{CLINICAL_LAB_CITY}}',
    fieldType: 'text',
    required: false,
    description: 'Clinical Laboratory City',
    placeholder: 'City',
    pdfFieldName: 'CLINICAL_LAB_CITY'
  },
  'clinicalLabState': {
    pdfPlaceholder: '{{CLINICAL_LAB_STATE}}',
    fieldType: 'text',
    required: false,
    description: 'Clinical Laboratory State/Province/Region',
    placeholder: 'State/Province/Region',
    pdfFieldName: 'CLINICAL_LAB_STATE'
  },
  'clinicalLabCountry': {
    pdfPlaceholder: '{{CLINICAL_LAB_COUNTRY}}',
    fieldType: 'text',
    required: false,
    description: 'Clinical Laboratory Country',
    placeholder: 'Country',
    pdfFieldName: 'CLINICAL_LAB_COUNTRY'
  },
  'clinicalLabZip': {
    pdfPlaceholder: '{{CLINICAL_LAB_ZIP}}',
    fieldType: 'text',
    required: false,
    description: 'Clinical Laboratory ZIP or Postal Code',
    placeholder: 'ZIP/Postal Code',
    validation: '^[A-Za-z0-9\\s-]{3,12}$',
    pdfFieldName: 'CLINICAL_LAB_ZIP'
  },

  // 5. NAME AND ADDRESS OF THE INSTITUTIONAL REVIEW BOARD (IRB)
  'irbName': {
    pdfPlaceholder: '{{IRB_NAME}}',
    fieldType: 'text',
    required: true,
    description: 'Name of IRB that is responsible for review and approval of the study(ies)',
    placeholder: 'IRB name',
    pdfFieldName: 'IRB_NAME'
  },
  'irbAddress1': {
    pdfPlaceholder: '{{IRB_ADDRESS_1}}',
    fieldType: 'text',
    required: true,
    description: 'IRB Address 1',
    placeholder: 'Street address',
    pdfFieldName: 'IRB_ADDRESS_1'
  },
  'irbAddress2': {
    pdfPlaceholder: '{{IRB_ADDRESS_2}}',
    fieldType: 'text',
    required: false,
    description: 'IRB Address 2',
    placeholder: 'Apt, suite, etc. (optional)',
    pdfFieldName: 'IRB_ADDRESS_2'
  },
  'irbCity': {
    pdfPlaceholder: '{{IRB_CITY}}',
    fieldType: 'text',
    required: true,
    description: 'IRB City',
    placeholder: 'City',
    pdfFieldName: 'IRB_CITY'
  },
  'irbState': {
    pdfPlaceholder: '{{IRB_STATE}}',
    fieldType: 'text',
    required: true,
    description: 'IRB State/Province/Region',
    placeholder: 'State/Province/Region',
    pdfFieldName: 'IRB_STATE'
  },
  'irbCountry': {
    pdfPlaceholder: '{{IRB_COUNTRY}}',
    fieldType: 'text',
    required: true,
    description: 'IRB Country',
    placeholder: 'Country',
    pdfFieldName: 'IRB_COUNTRY'
  },
  'irbZip': {
    pdfPlaceholder: '{{IRB_ZIP}}',
    fieldType: 'text',
    required: true,
    description: 'IRB ZIP or Postal Code',
    placeholder: 'ZIP/Postal Code',
    validation: '^[A-Za-z0-9\\s-]{3,12}$',
    pdfFieldName: 'IRB_ZIP'
  },

  // 6. NAMES OF SUBINVESTIGATORS
  'subinvestigators': {
    pdfPlaceholder: '{{SUBINVESTIGATORS}}',
    fieldType: 'textarea',
    required: false,
    description: 'Names of Subinvestigators (If not applicable, enter "None")',
    placeholder: 'List all subinvestigator names, or enter "None"',
    pdfFieldName: 'SUBINVESTIGATORS'
  },

  // 7. NAME AND CODE NUMBER, IF ANY, OF THE PROTOCOL(S)
  'protocolNameAndCode': {
    pdfPlaceholder: '{{PROTOCOL_NAME_AND_CODE}}',
    fieldType: 'textarea',
    required: true,
    description: 'Name and code number, if any, of the protocol(s) in the IND for the study(ies) to be conducted by the investigator',
    placeholder: 'Protocol name and code number',
    pdfFieldName: 'PROTOCOL_NAME_AND_CODE'
  },

  // 8. PROVIDE THE FOLLOWING CLINICAL PROTOCOL INFORMATION (Radio buttons - select one)
  'protocolInformationType': {
    pdfPlaceholder: '{{PROTOCOL_INFORMATION_TYPE}}',
    fieldType: 'radio',
    required: true,
    description: 'Provide the following clinical protocol information (Select one of the following)',
    options: [
      'Phase 1 investigations: General outline with duration and maximum subjects',
      'Phase 2/3 investigations: Detailed outline with subjects, controls, uses, characteristics, observations, tests, duration, and case report forms'
    ],
    pdfFieldName: 'PROTOCOL_INFORMATION_TYPE'
  },

  // 9. COMMITMENTS (Fixed text - investigator agreement)
  'commitmentAcceptance': {
    pdfPlaceholder: '{{COMMITMENT_ACCEPTANCE}}',
    fieldType: 'checkbox',
    required: true,
    description: 'I agree to conduct the study(ies) in accordance with the relevant, current protocol(s)',
    options: ['I agree'],
    pdfFieldName: 'COMMITMENT_ACCEPTANCE'
  },

  // 10. DATE
  'investigatorSignatureDate': {
    pdfPlaceholder: '11/11/1111',
    fieldType: 'date',
    required: true,
    description: 'Date (mm/dd/yyyy)',
    pdfFieldName: 'INVESTIGATOR_SIGNATURE_DATE'
  },

  // 11. SIGNATURE OF INVESTIGATOR
  'investigatorSignature': {
    pdfPlaceholder: '{{INVESTIGATOR_SIGNATURE}}',
    fieldType: 'text',
    required: true,
    description: 'Signature of Investigator',
    placeholder: 'Digital signature or signature field',
    pdfFieldName: 'INVESTIGATOR_SIGNATURE'
  },

  /* CONTINUATION PAGES (Optional fields)
  'continuationPage3': {
    pdfPlaceholder: '{{CONTINUATION_PAGE_3}}',
    fieldType: 'textarea',
    required: false,
    description: 'Continuation page for Item 3 (Additional Medical Facility information)',
    placeholder: 'Additional medical facility information if needed',
    pdfFieldName: 'CONTINUATION_PAGE_3'
  },
  'continuationPage4': {
    pdfPlaceholder: '{{CONTINUATION_PAGE_4}}',
    fieldType: 'textarea',
    required: false,
    description: 'Continuation page for Item 4 (Additional Clinical Laboratory information)',
    placeholder: 'Additional clinical laboratory information if needed',
    pdfFieldName: 'CONTINUATION_PAGE_4'
  },
  'continuationPage5': {
    pdfPlaceholder: '{{CONTINUATION_PAGE_5}}',
    fieldType: 'textarea',
    required: false,
    description: 'Continuation page for Item 5 (Additional IRB information)',
    placeholder: 'Additional IRB information if needed',
    pdfFieldName: 'CONTINUATION_PAGE_5'
  },
  'continuationPage6': {
    pdfPlaceholder: '{{CONTINUATION_PAGE_6}}',
    fieldType: 'textarea',
    required: false,
    description: 'Continuation page for Item 6 (Additional Subinvestigator information)',
    placeholder: 'Additional subinvestigator information if needed',
    pdfFieldName: 'CONTINUATION_PAGE_6'
  },

  // FORM METADATA
  'formVersion': {
    pdfPlaceholder: '{{FORM_VERSION}}',
    fieldType: 'text',
    required: false,
    description: 'FDA Form 1572 version (4/25)',
    placeholder: 'Form version',
    pdfFieldName: 'FORM_VERSION'
  },
  'ombNumber': {
    pdfPlaceholder: '{{OMB_NUMBER}}',
    fieldType: 'text',
    required: false,
    description: 'OMB Control Number (0910-0014)',
    placeholder: 'OMB No. 0910-0014',
    pdfFieldName: 'OMB_NUMBER'
  },
  'expirationDate': {
    pdfPlaceholder: '{{EXPIRATION_DATE}}',
    fieldType: 'text',
    required: false,
    description: 'Form expiration date (September 30, 2026)',
    placeholder: 'September 30, 2026',
    pdfFieldName: 'EXPIRATION_DATE'
  }*/
},

  'INVESTIGATIONAL_PLAN': {
    // Study Information
    'studyTitle': {
      pdfPlaceholder: '{{STUDY_TITLE}}',
      fieldType: 'textarea',
      required: true,
      description: 'Study title',
      placeholder: 'Enter the complete study title',
      pdfFieldName: 'STUDY_TITLE'
    },
    'studyPhase': {
      pdfPlaceholder: '{{STUDY_PHASE}}',
      fieldType: 'select',
      required: true,
      description: 'Study phase',
      options: ['Phase I', 'Phase II', 'Phase III', 'Phase IV', 'Phase I/II', 'Phase II/III'],
      pdfFieldName: 'STUDY_PHASE'
    },
    'primaryObjectives': {
      pdfPlaceholder: '{{PRIMARY_OBJECTIVES}}',
      fieldType: 'textarea',
      required: true,
      description: 'Primary objectives',
      placeholder: 'Describe the primary objectives of the study',
      pdfFieldName: 'PRIMARY_OBJECTIVES'
    },
    'secondaryObjectives': {
      pdfPlaceholder: '{{SECONDARY_OBJECTIVES}}',
      fieldType: 'textarea',
      required: false,
      description: 'Secondary objectives',
      placeholder: 'Describe any secondary objectives',
      pdfFieldName: 'SECONDARY_OBJECTIVES'
    },
    'backgroundRationale': {
      pdfPlaceholder: '{{BACKGROUND_RATIONALE}}',
      fieldType: 'textarea',
      required: true,
      description: 'Background and rationale',
      placeholder: 'Provide background and rationale for the study',
      pdfFieldName: 'BACKGROUND_RATIONALE'
    },
    'studyDesign': {
      pdfPlaceholder: '{{STUDY_DESIGN}}',
      fieldType: 'textarea',
      required: true,
      description: 'Study design',
      placeholder: 'Describe the study design and methodology',
      pdfFieldName: 'STUDY_DESIGN'
    },
    'numberOfSubjects': {
      pdfPlaceholder: '{{NUMBER_OF_SUBJECTS}}',
      fieldType: 'number',
      required: true,
      description: 'Number of subjects',
      placeholder: 'Planned number of subjects',
      pdfFieldName: 'NUMBER_OF_SUBJECTS'
    },
    'inclusionCriteria': {
      pdfPlaceholder: '{{INCLUSION_CRITERIA}}',
      fieldType: 'textarea',
      required: true,
      description: 'Inclusion criteria',
      placeholder: 'List subject inclusion criteria',
      pdfFieldName: 'INCLUSION_CRITERIA'
    },
    'exclusionCriteria': {
      pdfPlaceholder: '{{EXCLUSION_CRITERIA}}',
      fieldType: 'textarea',
      required: true,
      description: 'Exclusion criteria',
      placeholder: 'List subject exclusion criteria',
      pdfFieldName: 'EXCLUSION_CRITERIA'
    },
    'primaryEndpoint': {
      pdfPlaceholder: '{{PRIMARY_ENDPOINT}}',
      fieldType: 'textarea',
      required: true,
      description: 'Primary endpoint',
      placeholder: 'Describe the primary endpoint',
      pdfFieldName: 'PRIMARY_ENDPOINT'
    },
    'secondaryEndpoints': {
      pdfPlaceholder: '{{SECONDARY_ENDPOINTS}}',
      fieldType: 'textarea',
      required: false,
      description: 'Secondary endpoints',
      placeholder: 'Describe any secondary endpoints',
      pdfFieldName: 'SECONDARY_ENDPOINTS'
    },
    'studyProcedures': {
      pdfPlaceholder: '{{STUDY_PROCEDURES}}',
      fieldType: 'textarea',
      required: true,
      description: 'Study procedures',
      placeholder: 'Describe key study procedures and schedule',
      pdfFieldName: 'STUDY_PROCEDURES'
    },
    'statisticalAnalysis': {
      pdfPlaceholder: '{{STATISTICAL_ANALYSIS}}',
      fieldType: 'textarea',
      required: true,
      description: 'Statistical analysis plan',
      placeholder: 'Describe the statistical analysis approach',
      pdfFieldName: 'STATISTICAL_ANALYSIS'
    },
    'riskBenefit': {
      pdfPlaceholder: '{{RISK_BENEFIT}}',
      fieldType: 'textarea',
      required: true,
      description: 'Risk-benefit assessment',
      placeholder: 'Provide risk-benefit analysis',
      pdfFieldName: 'RISK_BENEFIT'
    },
    'principalInvestigator': {
      pdfPlaceholder: '{{PRINCIPAL_INVESTIGATOR}}',
      fieldType: 'text',
      required: true,
      description: 'Principal investigator',
      placeholder: 'Principal investigator name and credentials',
      pdfFieldName: 'PRINCIPAL_INVESTIGATOR'
    },
    'sponsorName': {
      pdfPlaceholder: '{{SPONSOR_NAME}}',
      fieldType: 'text',
      required: true,
      description: 'Sponsor name',
      placeholder: 'Sponsor organization name',
      pdfFieldName: 'SPONSOR_NAME'
    }
  }
};

// New type definition for checkbox field mapping
export interface CheckboxFieldMapping {
  [optionValue: string]: string; // Maps option values to actual PDF field names
}

export interface DocumentCheckboxMappings {
  [documentType: string]: {
    [formFieldKey: string]: CheckboxFieldMapping;
  };
}

// Checkbox field mappings for direct field name access
export const CHECKBOX_FIELD_MAPPINGS: DocumentCheckboxMappings = {
  'FDA_1571': {
    // 6B. PURPOSE (Commercial or Research)
    'sponsorType': {
      'Commercial': 'db_purpose_commercial',
      'Research': 'db_purpose_research'
    },

    // 7A. RARE DISEASE DESIGNATION (Yes/No)
    'isRareDisease': {
      'Yes': 'db_rare_disease_desg_y',
      'No': 'db_rare_disease_desg_n'
    },

    // 7A. ORPHAN DESIGNATION (Yes/No)  
    'hasOrphanDesignation': {
      'Yes': 'db_orphan_desg_y',
      'No': 'db_orphan_desg_n'
    },

    // 8. PHASE OF CLINICAL INVESTIGATION
    'phaseOfInvestigation': {
      'Phase 1': 'db_clin_inves_phases_1',
      'Phase 2': 'db_clin_inves_phases_2',
      'Phase 3': 'db_clin_inves_phases_3',
      'Other (Specify)': 'db_clin_inves_phases_4'
    },

    // 11. SUBMISSION CONTENTS (Multiple checkboxes)
    'submissionContents': {
      'Initial Investigational New Drug Application (IND)': 'db_sbmsn_contains_1',
      'Request For Reactivation Or Reinstatement': 'db_sbmsn_contains_2',
      'Development Safety Update Report (DSUR)': 'db_sbmsn_contains_3',
      'New Protocol': 'db_sbmsn_contains_protocol_1',
      'Protocol Amendment': 'db_sbmsn_contains_protocol_2',
      'Information Amendment': 'db_sbmsn_contains_information_1',
      'Request for Meeting': 'db_sbmsn_contains_request_1',
      'IND Safety Report': 'db_sbmsn_contains_safety_1',
      'Change in Protocol': 'db_sbmsn_contains_protocol_3',
      'New Investigator': 'db_sbmsn_contains_information_2',
      'Human Factors Protocol': 'db_sbmsn_contains_protocol_4',
      'Chemistry/Microbiology': 'db_sbmsn_contains_4',
      'Pharmacology/Toxicology': 'db_sbmsn_contains_5',
      'Clinical/Safety': 'db_sbmsn_contains_safety_2',
      'Statistics': 'db_sbmsn_contains_information_3',
      'Proprietary Name Review': 'db_sbmsn_contains_request_2',
      'Special Protocol Assessment': 'db_sbmsn_contains_protocol_5',
      'PMR/PMC Protocol': 'db_sbmsn_contains_information_4',
      'Clinical Pharmacology': 'db_sbmsn_contains_6',
      'Initial Written Report': 'db_sbmsn_contains_information_5',
      'Follow-up to a Written Report': 'db_sbmsn_contains_request_3',
      'Formal Dispute Resolution': 'db_sbmsn_contains_request_4',
      'Response to Clinical Hold': 'db_sbmsn_contains_7',
      'Annual Report': 'db_sbmsn_contains_8',
      'Response To FDA Request For Information': 'db_sbmsn_contains_request_5',
      'General Correspondence': 'db_sbmsn_contains_request_6'
    },

    // 12. COMBINATION PRODUCT (Yes/No)
    'isCombinationProduct': {
      'Yes': 'db_comb_prod_y',
      'No': 'db_comb_prod_n'
    },

    // 13. EXPANDED ACCESS USE
    'expandedAccessUse': {
      'Individual Patient, NonEmergency 21 CFR 312.310': 'db_select_section_13_1',
      'Individual Patient, Emergency 21 CFR 312.310(d)': 'db_select_section_13_2',
      'Intermediate Size Patient Population, 21 CFR 312.315': 'db_select_section_13_3',
      'Treatment IND or Protocol, 21 CFR 312.320': 'db_select_section_13_4'
    },

    // 13. SPECIAL SELECTIONS
    'specialSelections': {
      'Emergency Research Exception From Informed Consent Requirements, 21 CFR 312.23 (f)': 'db_select_section_13_5',
      'Charge Request, 21 CFR 312.8': 'db_select_section_13_6'
    },

    // 14. CONTENTS OF APPLICATION
    'contentsOfApplication': {
      'Form FDA 1571 (21 CFR 312.23(a)(1))': 'db_contents_of_application_1',
      'Table of Contents (21 CFR 312.23(a)(2))': 'db_contents_of_application_2',
      'Introductory statement (21 CFR 312.23(a)(3))': 'db_contents_of_application_3',
      'General Investigational plan (21 CFR 312.23(a)(3))': 'db_contents_of_application_4',
      'Investigator\'s brochure (21 CFR 312.23(a)(5))': 'db_contents_of_application_5',
      'Study protocol (21 CFR 312.23(a)(6))': 'db_contents_of_application_6',
      'Investigator data (21 CFR 312.23(a)(6)(iii)(b)) or completed Form FDA 1572': 'db_contents_of_application_6_a',
      'Facilities data (21 CFR 312.23(a)(6)(iii)(b)) or completed Form FDA 1572': 'db_contents_of_application_6_b',
      'Institutional Review Board data (21 CFR 312.23(a)(6)(iii)(b)) or completed Form FDA 1572': 'db_contents_of_application_6_c',
      'Chemistry, manufacturing, and control data (21 CFR 312.23(a)(7))': 'db_contents_of_application_7',
      'Environmental assessment or claim for exclusion (21 CFR 312.23(a)(7)(iv)(e))': 'db_contents_of_application_7_a',
      'Pharmacology and toxicology data (21 CFR 312.23(a)(8))': 'db_contents_of_application_8',
      'Previous human experience (21 CFR 312.23(a)(9))': 'db_contents_of_application_9',
      'Additional information (21 CFR 312.23(a)(10))': 'db_contents_of_application_10',
      'Biosimilar User Fee Cover Sheet (Form FDA 3792)': 'db_contents_of_application_11',
      'Clinical Trials Certification of Compliance (Form FDA 3674)': 'db_contents_of_application_12'
    },

    // 15. CONTRACT RESEARCH ORGANIZATION
    'contractResearchOrganization': {
      'Yes': 'db_clin_study_contract_org_1_y',
      'No': 'db_clin_study_contract_org_1_n'
    },

    'sponsorObligationsTransferred': {
      'Yes': 'db_clin_study_contract_org_2_y',
      'No': 'db_clin_study_contract_org_2_n'
    }
  },

  'FDA_1572': {
    // 2. EDUCATION, TRAINING, AND EXPERIENCE (Select one)
    'qualificationType': {
      'Curriculum Vitae': 'db_cv',
      'Other Statement of Qualifications': 'db_oth_qual'
    },

    // 8. PROTOCOL INFORMATION TYPE (Select one)
    'protocolInformationType': {
      'Phase 1 investigations: General outline with duration and maximum subjects': 'db_phase_1',
      'Phase 2/3 investigations: Detailed outline with subjects, controls, uses, characteristics, observations, tests, duration, and case report forms': 'db_phase_2_3'
    },

    // 9. COMMITMENTS (Agreement checkbox)
    'commitmentAcceptance': {
      'I agree': 'db_commitment_agreement'
    }
  }
};


// Helper functions
export function getRequiredFields(documentType: string): string[] {
  const fields = PLACEHOLDER_DICTIONARY[documentType];
  if (!fields) return [];

  return Object.keys(fields).filter(key => fields[key].required);
}

export function getFieldValidation(documentType: string, fieldName: string): string | undefined {
  return PLACEHOLDER_DICTIONARY[documentType]?.[fieldName]?.validation;
}

export function getFieldOptions(documentType: string, fieldName: string): string[] | undefined {
  return PLACEHOLDER_DICTIONARY[documentType]?.[fieldName]?.options;
}

export function validateFieldValue(documentType: string, fieldName: string, value: any): {
  valid: boolean;
  error?: string;
} {
  const field = PLACEHOLDER_DICTIONARY[documentType]?.[fieldName];
  if (!field) {
    return { valid: false, error: 'Field not found in dictionary' };
  }

  // Check required fields
  if (field.required && (!value || value === '')) {
    return { valid: false, error: `${field.description} is required` };
  }

  // Skip validation for empty optional fields
  if (!field.required && (!value || value === '')) {
    return { valid: true };
  }

  // Type-specific validation
  switch (field.fieldType) {
    case 'number':
      if (isNaN(Number(value))) {
        return { valid: false, error: 'Must be a valid number' };
      }
      break;

    case 'text':
    case 'textarea':
      if (field.validation) {
        const regex = new RegExp(field.validation);
        if (!regex.test(value)) {
          return { valid: false, error: `Invalid format for ${field.description}` };
        }
      }
      break;

    case 'select':
      if (field.options && !field.options.includes(value)) {
        return { valid: false, error: 'Please select a valid option' };
      }
      break;
  }

  return { valid: true };
}