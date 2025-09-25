'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, FileText, Plus, Eye, Download } from 'lucide-react';
import { INDFormData } from '@/types/ind-types';

interface CreatedDocument {
  id: string;
  type: string;
  title: string;
  status: string;
  preview?: string;
}

interface ValidationPanelProps {
  formData: INDFormData;
  selectedDocuments: string[];
  createdDocuments: CreatedDocument[];
  isCreating: boolean;
  onCreateDocuments: () => void;
}

export function ValidationPanel({
  formData,
  selectedDocuments,
  createdDocuments,
  isCreating,
  onCreateDocuments
}: ValidationPanelProps) {
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const getRequiredFields = () => [
    { field: 'sponsorName', label: 'Sponsor Name', value: formData.sponsorName },
    { field: 'contactPerson', label: 'Contact Person', value: formData.contactPerson },
    { field: 'contactEmail', label: 'Contact Email', value: formData.contactEmail },
    { field: 'studyTitle', label: 'Study Title', value: formData.studyTitle },
    { field: 'drugGenericName', label: 'Drug Name', value: formData.drugGenericName },
    { field: 'dosageForm', label: 'Dosage Form', value: formData.dosageForm },
    { field: 'primaryObjectives', label: 'Primary Objectives', value: formData.primaryObjectives },
    { field: 'activeIngredients', label: 'Active Ingredients', value: formData.activeIngredients.length > 0 }
  ];

  const runValidation = async () => {
    setIsValidating(true);

    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000));

    const requiredFields = getRequiredFields();
    const missingFields = requiredFields.filter(field => !field.value || (Array.isArray(field.value) && field.value.length === 0));

    setValidationResults({
      isValid: missingFields.length === 0,
      missingFields,
      completedFields: requiredFields.filter(field => field.value && (!Array.isArray(field.value) || field.value.length > 0)),
      warnings: [
        ...(selectedDocuments.includes('FDA_1572') && !formData.investigatorName ? ['Investigator information incomplete for FDA 1572'] : []),
        ...(formData.routeOfAdministration.length === 0 ? ['Routes of administration not specified'] : [])
      ]
    });

    setIsValidating(false);
  };

  useEffect(() => {
    if (validationResults === null) {
      runValidation();
    }
  }, []);

  const getDocumentTitle = (docType: string) => {
    switch (docType) {
      case 'FDA_1571': return 'FDA Form 1571';
      case 'FDA_1572': return 'FDA Form 1572';
      case 'INVESTIGATIONAL_PLAN': return 'Investigational Plan';
      case 'CMC_SUMMARY': return 'CMC Summary';
      default: return docType;
    }
  };

  const documentsToCreate = ['FDA_1571', ...selectedDocuments.filter(doc => doc !== 'FDA_1571')];

  if (createdDocuments.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Documents Created Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Your IND documents have been generated and are ready for review.
          </p>
        </div>

        <div className="grid gap-4">
          {createdDocuments.map((doc) => (
            <Card key={doc.id} className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="font-semibold">{doc.title}</h3>
                      <p className="text-sm text-gray-600">Status: {doc.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Review each document for accuracy and completeness</li>
            <li>• Make any necessary edits or corrections</li>
            <li>• Run final validation before submission</li>
            <li>• Submit to FDA Electronic Submissions Gateway (ESG)</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Validate & Create Documents</h2>
        <p className="text-gray-600 mb-6">
          Review your information and create the IND documents.
        </p>
      </div>

      {/* Validation Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isValidating ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : validationResults?.isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            )}
            Form Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isValidating ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Validating form data...</span>
            </div>
          ) : validationResults ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress
                    value={(validationResults.completedFields.length / (validationResults.completedFields.length + validationResults.missingFields.length)) * 100}
                    className="w-full"
                  />
                </div>
                <Badge variant={validationResults.isValid ? "default" : "secondary"}>
                  {validationResults.completedFields.length}/{validationResults.completedFields.length + validationResults.missingFields.length} Complete
                </Badge>
              </div>

              {validationResults.missingFields.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Missing required fields:</p>
                      <ul className="list-disc list-inside text-sm">
                        {validationResults.missingFields.map((field: any) => (
                          <li key={field.field}>{field.label}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResults.warnings.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-semibold">Warnings:</p>
                      <ul className="list-disc list-inside text-sm">
                        {validationResults.warnings.map((warning: string, index: number) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {validationResults.isValid && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    All required fields are complete. Ready to create documents.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Documents to Create */}
      <Card>
        <CardHeader>
          <CardTitle>Documents to Create</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {documentsToCreate.map((docType) => (
              <div key={docType} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">{getDocumentTitle(docType)}</h4>
                    <p className="text-sm text-gray-600">
                      {docType === 'FDA_1571' && 'Required for all IND submissions'}
                      {docType === 'FDA_1572' && 'Statement of Investigator'}
                      {docType === 'INVESTIGATIONAL_PLAN' && 'Clinical study protocol summary'}
                      {docType === 'CMC_SUMMARY' && 'Chemistry, Manufacturing, and Controls'}
                    </p>
                  </div>
                </div>
                <Badge variant={docType === 'FDA_1571' ? 'default' : 'secondary'}>
                  {docType === 'FDA_1571' ? 'Required' : 'Selected'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onCreateDocuments}
          disabled={isCreating || !validationResults?.isValid}
          size="lg"
          className="min-w-[200px]"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Documents...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-5 w-5" />
              Create {documentsToCreate.length} Document{documentsToCreate.length > 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Information */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">How Documents Are Created</h4>
        <ul className="text-sm text-purple-700 space-y-1">
          <li>• <strong>eCTD Structure Agent:</strong> Validates document structure and regulatory compliance</li>
          <li>• <strong>IND Content Agent:</strong> Generates content using FDA templates and regulatory language</li>
          <li>• <strong>Quality Review Agent:</strong> Performs final quality checks and package validation</li>
          <li>• Documents are created using official FDA templates with AI-enhanced content</li>
        </ul>
      </div>
    </div>
  );
}