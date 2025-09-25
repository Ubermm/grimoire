'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { FDA1571Form } from './forms/fda-1571-form';
import { FDA1572Form } from './forms/fda-1572-form';
import { InvestigationalPlanForm } from './forms/investigational-plan-form';
import DocumentPreview from './document-preview';

import { INDFormData } from '@/types/ind-types';

export type { INDFormData };

interface INDCreationWidgetProps {
  onDocumentCreate: (documentType: string, formData: INDFormData) => void;
  onClose: () => void;
  isCreating?: boolean;
}

export function INDCreationWidget({ onDocumentCreate, onClose, isCreating = false }: INDCreationWidgetProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState<INDFormData>({
    sponsorName: '',
    sponsorAddress: '',
    sponsorCity: '',
    sponsorState: '',
    sponsorZip: '',
    sponsorCountry: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    drugGenericName: '',
    drugTradeName: '',
    activeIngredients: [],
    dosageForm: '',
    routeOfAdministration: [],
    strength: '',
    studyTitle: '',
    studyPhase: 'Phase_I',
    studyObjectives: '',
    backgroundRationale: '',
    studyDesign: '',
    subjectSelection: '',
    therapeuticArea: '',
    investigatorName: '',
    investigatorAddress: '',
    investigatorCity: '',
    investigatorState: '',
    investigatorZip: '',
    investigatorEmail: '',
    investigatorPhone: '',
    educationTraining: '',
    clinicalExperience: '',
    qualifications: '',
    submissionType: 'initial',
    serialNumber: '',
    submissionDate: new Date().toISOString().split('T')[0]
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const documentTypes = [
    {
      id: 'FDA_1571',
      title: 'FDA Form 1571',
      description: 'Investigational New Drug Application (IND)',
      required: true,
      icon: <FileText className="h-4 w-4" />,
      status: selectedDocuments.has('FDA_1571') ? 'selected' : 'available'
    },
    {
      id: 'FDA_1572',
      title: 'FDA Form 1572',
      description: 'Statement of Investigator',
      required: false,
      icon: <FileText className="h-4 w-4" />,
      status: selectedDocuments.has('FDA_1572') ? 'selected' : 'available'
    },
    {
      id: 'INVESTIGATIONAL_PLAN',
      title: 'Investigational Plan',
      description: 'Clinical study protocol summary',
      required: false,
      icon: <FileText className="h-4 w-4" />,
      status: selectedDocuments.has('INVESTIGATIONAL_PLAN') ? 'selected' : 'available'
    }
  ];

  const toggleDocument = (documentId: string, required: boolean) => {
    if (required) return; // Can't deselect required documents

    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Required fields validation
    if (!formData.sponsorName) errors.sponsorName = 'Sponsor name is required';
    if (!formData.contactPerson) errors.contactPerson = 'Contact person is required';
    if (!formData.contactEmail) errors.contactEmail = 'Contact email is required';
    if (!formData.studyTitle) errors.studyTitle = 'Study title is required';
    if (!formData.drugGenericName) errors.drugGenericName = 'Drug name is required';
    if (formData.activeIngredients.length === 0) errors.activeIngredients = 'At least one active ingredient is required';

    // Email validation
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      errors.contactEmail = 'Valid email address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateDocuments = () => {
    if (!validateForm()) {
      return;
    }

    // Always include FDA 1571 (required)
    const documentsToCreate = ['FDA_1571', ...Array.from(selectedDocuments)];

    documentsToCreate.forEach(docType => {
      onDocumentCreate(docType, formData);
    });
  };

  const getCompletionStatus = () => {
    const requiredFields = ['sponsorName', 'contactPerson', 'contactEmail', 'studyTitle', 'drugGenericName'];
    const completedFields = requiredFields.filter(field => formData[field as keyof INDFormData]);
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Create IND Submission Documents</CardTitle>
              <CardDescription>
                Generate FDA-compliant documents for your Investigational New Drug application
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={completionStatus.percentage === 100 ? "default" : "secondary"}>
                {completionStatus.completed}/{completionStatus.total} Required Fields
              </Badge>
              <Button variant="outline" onClick={onClose} disabled={isCreating}>
                Cancel
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
              <TabsTrigger value="overview" className="relative">
                Overview
                {completionStatus.percentage < 100 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </TabsTrigger>
              <TabsTrigger value="forms">Document Forms</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="create">
                <div className="flex items-center gap-1">
                  {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                  Create
                </div>
              </TabsTrigger>
            </TabsList>

            <div className="h-96 overflow-y-auto">
              <TabsContent value="overview" className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Document Selection</h3>
                  <div className="grid gap-3">
                    {documentTypes.map((doc) => (
                      <Card
                        key={doc.id}
                        className={`cursor-pointer transition-all ${
                          doc.required || selectedDocuments.has(doc.id)
                            ? 'border-blue-200 bg-blue-50'
                            : 'hover:border-gray-300'
                        }`}
                        onClick={() => toggleDocument(doc.id, doc.required)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {doc.icon}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{doc.title}</h4>
                                  {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                </div>
                                <p className="text-sm text-gray-600">{doc.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {(doc.required || selectedDocuments.has(doc.id)) && (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {Object.keys(validationErrors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please complete all required fields before creating documents.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="forms" className="p-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="drug">Drug Details</TabsTrigger>
                    <TabsTrigger value="investigator">Investigator Info</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic">
                    <FDA1571Form
                      formData={formData}
                      onChange={setFormData}
                      errors={validationErrors}
                    />
                  </TabsContent>

                  <TabsContent value="drug">
                    <div className="space-y-4 mt-4">
                      <h3 className="text-lg font-semibold">Drug Information</h3>
                      {/* Drug form fields will be here */}
                      <p className="text-sm text-gray-600">Drug information form component goes here</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="investigator">
                    {selectedDocuments.has('FDA_1572') && (
                      <FDA1572Form
                        formData={formData}
                        onChange={setFormData}
                        errors={validationErrors}
                      />
                    )}
                    {!selectedDocuments.has('FDA_1572') && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Select FDA Form 1572 to enter investigator information</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="preview" className="p-6">
                <DocumentPreview
                  documentType="FDA_1571"
                  formData={formData}
                  submissionInfo={{
                    name: "Preview Document",
                    submissionType: "initial",
                    createdAt: new Date().toISOString()
                  }}
                  showPreview={showPreview}
                  setShowPreview={setShowPreview}
                />
              </TabsContent>

              <TabsContent value="create" className="p-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Ready to Create Documents</h3>
                    <p className="text-gray-600">
                      The following documents will be generated:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Badge key="FDA_1571" className="mr-2">FDA Form 1571 (Required)</Badge>
                    {Array.from(selectedDocuments).map(docId => (
                      <Badge key={docId} variant="secondary" className="mr-2">
                        {documentTypes.find(d => d.id === docId)?.title}
                      </Badge>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={handleCreateDocuments}
                      disabled={isCreating || completionStatus.percentage < 100}
                      className="w-full"
                      size="lg"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Documents...
                        </>
                      ) : (
                        <>
                          <FileText className="mr-2 h-4 w-4" />
                          Create IND Documents
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}