//@ts-nocheck
// src/components/INDSubmission.tsx - Main IND Component (following audit patterns)
'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from "react-hook-form";
import { toast } from 'sonner';
import {
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  XCircle,
  AlertCircle,
  Info,
  Trash2,
  Download,
  Loader2,
  Save,
  Edit,
  Eye,
  HomeIcon
} from 'lucide-react';

// UI Components (borrowing from audit styling)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Import AutoFill component for form pre-population
import AutoFill from '@/components/AutoFill';
import INDFormRenderer from '@/components/forms/INDFormRenderer';
import DocumentPreview from '@/components/document-preview';
import { set } from 'mongoose';

// Type definitions following audit patterns
interface INDFormResponse {
  questionId: string;
  fieldName: string;
  value: any;
  lastModified: Date;
}

interface INDFormSection {
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

interface INDSubmission {
  _id: string;
  name: string;
  userId: string;
  status: 'draft' | 'in_progress' | 'under_review' | 'completed' | 'submitted' | 'archived';
  submissionType: 'initial' | 'amendment' | 'annual_report' | 'safety_report';
  checkpoint: number;
  sections: INDFormSection[];
  metadata: {
    sponsorInfo?: any;
    drugInfo?: any;
    studyInfo?: any;
    investigatorInfo?: any;
  };
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

interface FormValues {
  responses: Record<string, string>;
}

const INDSubmissionComponent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');

  // State Management (following audit patterns)
  const [existingSubmissions, setExistingSubmissions] = useState<INDSubmission[]>([]);
  const [submission, setSubmission] = useState<INDSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showAddSubmission, setShowAddSubmission] = useState(false);
  const [showExistingSubmissions, setShowExistingSubmissions] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const [newSubmissionName, setNewSubmissionName] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Creation flow state
  const [creationStep, setCreationStep] = useState(1);
  const [submissionMetadata, setSubmissionMetadata] = useState({
    sponsorInfo: {
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: ''
    },
    drugInfo: {
      genericName: '',
      tradeName: '',
      activeIngredients: [] as string[],
      dosageForm: '',
      routeOfAdministration: [] as string[]
    },
    studyInfo: {
      title: '',
      phase: 'Phase_I' as const,
      objectives: '',
      therapeuticArea: ''
    },
    investigatorInfo: {
      name: '',
      email: '',
      phone: '',
      qualifications: ''
    }
  });

  // Form Management (following audit patterns)
  const methods = useForm({
    defaultValues: {
      responses: {},
      submissionName: submission?.name || `IND Submission ${new Date().toLocaleDateString()}`
    },
    mode: "onChange",
  });

  // Load existing submissions
  useEffect(() => {
    const loadExistingSubmissions = async () => {
      try {
        const response = await fetch('/api/ind-submissions');
        if (!response.ok) throw new Error('Failed to fetch existing submissions');
        const submissions = await response.json();
        setExistingSubmissions(submissions);
      } catch (error) {
        console.error('Error loading existing submissions:', error);
        toast.error('Failed to load existing submissions');
      }
    };

    if (showExistingSubmissions) {
      loadExistingSubmissions();
    }
  }, [showExistingSubmissions]);

  // Load specific submission
  useEffect(() => {
    const loadSubmission = async () => {
      if (!submissionId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/ind-submissions?id=${submissionId}`);
        if (!response.ok) throw new Error('Failed to load submission');

        const submissionData = await response.json();
        setSubmission(submissionData);
        setShowExistingSubmissions(false);
        setCurrentStep(submissionData.checkpoint || 0);

        // Initialize form with existing responses
        if (submissionData.sections?.[submissionData.checkpoint || 0]?.responses) {
          const responses = {};
          submissionData.sections[submissionData.checkpoint || 0].responses.forEach(r => {
            responses[r.fieldName] = r.value;
          });
          methods.reset({ responses });
        }
      } catch (error) {
        console.error('Error loading submission:', error);
        toast.error('Failed to load submission data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSubmission();
  }, [submissionId, methods]);

  // Available document types
  const documentTypeOptions = [
    { value: 'FDA_1571', label: 'Form FDA 1571 - Notice of Claimed Investigational Exemption' },
    { value: 'FDA_1572', label: 'Form FDA 1572 - Statement of Investigator' },
    { value: 'INVESTIGATIONAL_PLAN', label: 'Investigational Plan' },
    { value: 'CMC_SUMMARY', label: 'Chemistry, Manufacturing, and Controls Summary' }
  ];

  // Handle form field changes
  const getFormFields = useCallback(() => {
    if (!submission?.sections?.[currentStep]) return {};

    const currentSection = submission.sections[currentStep];
    const docType = currentSection.documentType;

    // Return form schema based on document type
    return getFormSchemaForDocType(docType);
  }, [submission, currentStep]);

  // Generate and store filled PDF for the current section
  const generateFilledPDF = async (formValues: Record<string, any>, documentType: string) => {
    try {
      // Check if this is an FDA form that supports filling
      const fdaForms = ['FDA_1571', 'FDA_1572'];
      if (!fdaForms.includes(documentType)) {
        return; // Skip PDF generation for non-FDA forms
      }

      // Generate filled PDF using the new API endpoint
      const response = await fetch('/api/fda-forms/filled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType,
          formData: formValues
        })
      });

      if (response.ok) {
        console.log(`✅ Filled PDF generated successfully for ${documentType}`);
        toast.success(`Filled PDF generated for ${documentType.replace('_', ' ')}`);
      } else {
        console.warn(`⚠️ Failed to generate filled PDF for ${documentType}`);
      }
    } catch (error) {
      console.error('Error generating filled PDF:', error);
      // Don't throw - PDF generation is supplementary to the main save operation
    }
  };

  // Form submission and validation
  const handleSave = async () => {
    if (!submission) return;

    setIsSaving(true);
    try {
      const formValues = methods.getValues().responses;

      // Convert form values to INDFormResponse format
      const responses: INDFormResponse[] = Object.entries(formValues).map(([fieldName, value]) => ({
        questionId: `${fieldName}_${Date.now()}`,
        fieldName,
        value,
        lastModified: new Date()
      }));

      const updatedSubmission = {
        ...submission,
        checkpoint: currentStep,
        sections: submission.sections.map((s, idx) =>
          idx === currentStep
            ? {
                ...s,
                responses,
                status: 'in_progress' as const
              }
            : s
        )
      };

      const response = await fetch(`/api/ind-submissions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubmission)
      });

      if (!response.ok) throw new Error('Failed to save submission');

      const savedSubmission = await response.json();
      setSubmission(savedSubmission);

      // Generate filled PDF after successful save
      await generateFilledPDF(formValues, submission.sections[currentStep].documentType);

      toast.success('Progress saved successfully');
    } catch (error) {
      console.error('Error saving submission:', error);
      toast.error('Failed to save progress');
    } finally {
      setIsSaving(false);
    }
  };

  const validateAndContinue = async () => {
    if (!submission) return;

    setIsValidating(true);
    try {
      const formValues = methods.getValues().responses;

      const response = await fetch('/api/ind-submissions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: submission._id,
          sectionIndex: currentStep,
          responses: formValues,
          documentType: submission.sections[currentStep].documentType
        })
      });

      if (!response.ok) throw new Error('Validation failed');

      const validationResult = await response.json();

      // Update submission with validation results
      const updatedSubmission = await fetch(`/api/ind-submissions?id=${submission._id}`).then(r => r.json());
      setSubmission(updatedSubmission);

      if (validationResult.validationResults.passed.every(p => p === true)) {
        // Generate filled PDF after successful validation
        await generateFilledPDF(formValues, submission.sections[currentStep].documentType);

        toast.success('Section validated successfully');
        // Move to next section if available
        if (currentStep < submission.sections.length - 1) {
          setCurrentStep(prev => prev + 1);
        }
      } else {
        toast.error('Validation found issues. Please review.');
      }
    } catch (error) {
      console.error('Error during validation:', error);
      toast.error('Failed to validate section');
    } finally {
      setIsValidating(false);
    }
  };

  // Create new submission
  const handleCreateSubmission = async () => {
    if (selectedDocTypes.length === 0 || !newSubmissionName.trim()) {
      toast.error('Please provide a submission name and select at least one document type');
      return;
    }

    try {
      const response = await fetch('/api/ind-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubmissionName.trim(),
          submissionType: 'initial',
          documentTypes: selectedDocTypes,
          metadata: submissionMetadata
        })
      });

      if (!response.ok) throw new Error('Failed to create submission');

      const createdSubmission = await response.json();
      setSubmission(createdSubmission);
      setShowAddSubmission(false);
      setShowExistingSubmissions(false);
      router.replace(`/ind-creation?id=${createdSubmission._id}`);
    } catch (error) {
      console.error('Error creating submission:', error);
      toast.error('Failed to create submission');
    }
  };

  const handleNewInitialSubmission = async () => {
    try {
      const response = await fetch('/api/ind-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New IND Initial Submission',
          submissionType: 'initial',
          documentTypes: ['FDA_1571', 'FDA_1572'],
          metadata: submissionMetadata
        })
      });

      if (!response.ok) throw new Error('Failed to create submission');

      const createdSubmission = await response.json();
      router.push(`/ind-forms/FDA_1571?submissionId=${createdSubmission._id}`);
    } catch (error) {
      console.error('Error creating submission:', error);
      toast.error('Failed to create submission');
    }
  };

  // Loading state
  if (isLoading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="text-center font-medium">
                {isLoading ? 'Loading submission data...' : 'Validating section...'}
              </div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show existing submissions view (following audit pattern)
  if (showExistingSubmissions) {
    return (
      <div className="container mx-auto p-6 bg-black">
        <Card className="w-full max-w-6xl mx-auto min-h-[700px]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Your IND Submissions</CardTitle>
                <CardDescription>Continue an existing submission or start a new one</CardDescription>
              </div>
              <div className='flex space-x-4'>
                <Button onClick={handleNewInitialSubmission}
                className='bg-black text-white hover:bg-gray-800'>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Initial Submission
                </Button>
                <Button onClick={() => {
                  setShowExistingSubmissions(false);
                  setSelectedDocTypes(['FDA_1571', 'INVESTIGATIONAL_PLAN']);
                  setNewSubmissionName('New IND Amendment');
                  setShowAddSubmission(true);
                }}
                className='bg-black text-white hover:bg-gray-800 hidden'>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Amendment
                </Button>
                <Button onClick={() => {
                  setShowExistingSubmissions(false);
                  setSelectedDocTypes([]);
                  setNewSubmissionName('New IND Submission');
                  setShowAddSubmission(true);
                }}
                className='bg-black text-white hover:bg-gray-800 hidden'>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Custom Submission
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-full">
              {existingSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {existingSubmissions.map((existingSubmission) => (
                    <Card key={existingSubmission._id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2 flex-grow">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{existingSubmission.name}</h3>
                              <Badge variant="secondary">{existingSubmission.submissionType}</Badge>
                              <Badge
                                variant={existingSubmission.status === 'completed' ? 'default' : 'outline'}
                              >
                                {existingSubmission.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(existingSubmission.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {existingSubmission.sections.map((section) => (
                                <span
                                  key={section.id}
                                  className={`text-sm rounded-full px-3 py-1 ${
                                    section.status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : section.status === 'in_progress'
                                      ? 'bg-blue-100 text-blue-800'
                                      : section.status === 'flagged'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {section.documentType.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                setSubmissionToDelete(existingSubmission._id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.replace(`/ind-creation?id=${existingSubmission._id}`)}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium">No Submissions Yet</h3>
                    <p className="text-muted-foreground">Create your first IND submission to get started</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto p-6 space-y-6 bg-black min-h-screen">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{submission?.name}</CardTitle>
                <CardDescription>
                  Section {currentStep + 1} of {submission?.sections.length} -
                  <span className="text-purple-700 text-xl">
                    {" "}{submission?.sections[currentStep]?.documentType?.replace('_', ' ')}
                  </span>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {window.location.href = "/ind-creation";}}
                  disabled={isSaving}
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Return to Submissions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Progress
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {setCurrentStep(prev => Math.max(0, prev - 1)); setShowPreview(false);}}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {setCurrentStep(prev => Math.min(prev + 1, (submission?.sections.length || 1) - 1)); setShowPreview(false);}}
                  disabled={currentStep === (submission?.sections.length || 1) - 1}
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center pt-6">
              <AutoFill
                formFields={getFormFields()}
                onAutofill={(values) => {
                  Object.entries(values).forEach(([fieldId, value]) => {
                    methods.setValue(`responses.${fieldId}` as any, value);
                  });
                  toast.success('Form fields updated');
                }}
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-6">
              {submission?.sections[currentStep] && (
                <>
                  <INDFormRenderer
                    documentType={submission.sections[currentStep].documentType}
                    onFieldChange={(fieldName, value) => {
                      // Auto-save on field change
                      const currentResponses = methods.getValues().responses || {};
                      currentResponses[fieldName] = value;
                      methods.setValue('responses', currentResponses);
                    }}
                  />

                  <div className="mt-8 border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Document Preview & Export</h3>
                    <DocumentPreview
                      documentType={submission.sections[currentStep].documentType}
                      formData={methods.getValues().responses || {}}
                      submissionInfo={{
                        name: submission.name,
                        submissionType: submission.submissionType,
                        createdAt: submission.createdAt
                      }}
                      showPreview={showPreview}
                      setShowPreview={setShowPreview}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
};

// Helper function to get form schema for document types
function getFormSchemaForDocType(docType: string): Record<string, any> {
  // Import from placeholder dictionary for AutoFill compatibility
  const { PLACEHOLDER_DICTIONARY } = require('@/lib/ind/placeholder-dictionary');
  const fields = PLACEHOLDER_DICTIONARY[docType];

  if (!fields) return {};

  // Convert placeholder dictionary format to AutoFill format
  const formFields: Record<string, any> = {};
  Object.entries(fields).forEach(([fieldName, field]: [string, any]) => {
    formFields[fieldName] = {
      id: fieldName,
      type: field.fieldType === 'textarea' ? 'text' : field.fieldType,
      question: field.description,
      value: ''
    };
  });

  return formFields;
}

export default INDSubmissionComponent;
