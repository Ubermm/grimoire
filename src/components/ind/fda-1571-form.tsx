'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, AlertCircle, CheckCircle, FileText } from 'lucide-react';

// UI Components (audit styling)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Dictionary for field info
import { PLACEHOLDER_DICTIONARY } from '@/lib/ind/placeholder-dictionary';

interface INDDocument {
  _id: string;
  documentType: string;
  formData: Record<string, any>;
  validationReport: {
    completionPercentage: number;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
}

interface FDA1571FormProps {
  document: INDDocument;
  onUpdate: (document: INDDocument) => void;
}

export const FDA1571Form: React.FC<FDA1571FormProps> = ({ document, onUpdate }) => {
  const [formData, setFormData] = useState<Record<string, any>>(document.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get field configuration from dictionary
  const fields = PLACEHOLDER_DICTIONARY['FDA_1571'];

  // Initialize form with default values
  useEffect(() => {
    const initialData = { ...document.formData };

    // Set default values for empty fields
    if (!initialData.submissionDate) {
      initialData.submissionDate = new Date().toISOString().split('T')[0];
    }
    if (!initialData.initialIND) {
      initialData.initialIND = true;
    }
    if (!initialData.signatureDate) {
      initialData.signatureDate = new Date().toISOString().split('T')[0];
    }

    setFormData(initialData);
  }, [document.formData]);

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const saveFormData = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/ind/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: document._id,
          formData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save form data');
      }

      const updatedDocument = await response.json();
      onUpdate(updatedDocument);
      toast.success('Form data saved successfully');
    } catch (error) {
      console.error('Error saving form data:', error);
      toast.error('Failed to save form data');
    } finally {
      setIsSaving(false);
    }
  };

  const validateDocument = async () => {
    setIsValidating(true);
    try {
      const response = await fetch('/api/ind/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to validate document');
      }

      const result = await response.json();
      const updatedDocument = {
        ...document,
        validationReport: result.validationReport,
        status: result.status
      };

      onUpdate(updatedDocument);

      if (result.validationReport.structureValid && result.validationReport.contentValid) {
        toast.success('Document validation completed successfully');
      } else {
        toast.error('Document validation found issues');
      }
    } catch (error) {
      console.error('Error validating document:', error);
      toast.error('Failed to validate document');
    } finally {
      setIsValidating(false);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return document.validationReport?.errors?.find(e => e.field === fieldName)?.message;
  };

  const isRequired = (fieldName: string): boolean => {
    return fields[fieldName]?.required || false;
  };

  return (
    <div className="space-y-6">
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold">FDA Form 1571</h4>
          <p className="text-sm text-muted-foreground">
            Investigational New Drug Application
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={saveFormData}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            onClick={validateDocument}
            disabled={isValidating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
        </div>
      </div>

      {/* Submission Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submission Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">
                Serial Number {isRequired('serialNumber') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber || ''}
                onChange={(e) => updateField('serialNumber', e.target.value)}
                placeholder={fields.serialNumber?.placeholder}
                className={getFieldError('serialNumber') ? 'border-red-500' : ''}
              />
              {getFieldError('serialNumber') && (
                <p className="text-sm text-red-500">{getFieldError('serialNumber')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="submissionDate">
                Submission Date {isRequired('submissionDate') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="submissionDate"
                type="date"
                value={formData.submissionDate || ''}
                onChange={(e) => updateField('submissionDate', e.target.value)}
                className={getFieldError('submissionDate') ? 'border-red-500' : ''}
              />
              {getFieldError('submissionDate') && (
                <p className="text-sm text-red-500">{getFieldError('submissionDate')}</p>
              )}
            </div>
          </div>

          {/* Submission Type Checkboxes */}
          <div className="space-y-2">
            <Label>Submission Type</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="initialIND"
                  checked={formData.initialIND || false}
                  onCheckedChange={(checked) => updateField('initialIND', checked)}
                />
                <Label htmlFor="initialIND">Initial IND</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="protocolAmendment"
                  checked={formData.protocolAmendment || false}
                  onCheckedChange={(checked) => updateField('protocolAmendment', checked)}
                />
                <Label htmlFor="protocolAmendment">Protocol Amendment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="annualReport"
                  checked={formData.annualReport || false}
                  onCheckedChange={(checked) => updateField('annualReport', checked)}
                />
                <Label htmlFor="annualReport">Annual Report</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sponsor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sponsor Information</CardTitle>
          <CardDescription>Information about the organization sponsoring the IND</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorName">
                Sponsor Name {isRequired('sponsorName') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="sponsorName"
                value={formData.sponsorName || ''}
                onChange={(e) => updateField('sponsorName', e.target.value)}
                placeholder={fields.sponsorName?.placeholder}
                className={getFieldError('sponsorName') ? 'border-red-500' : ''}
              />
              {getFieldError('sponsorName') && (
                <p className="text-sm text-red-500">{getFieldError('sponsorName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">
                Contact Person {isRequired('contactPerson') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson || ''}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                placeholder={fields.contactPerson?.placeholder}
                className={getFieldError('contactPerson') ? 'border-red-500' : ''}
              />
              {getFieldError('contactPerson') && (
                <p className="text-sm text-red-500">{getFieldError('contactPerson')}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">
                Contact Email {isRequired('contactEmail') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail || ''}
                onChange={(e) => updateField('contactEmail', e.target.value)}
                placeholder={fields.contactEmail?.placeholder}
                className={getFieldError('contactEmail') ? 'border-red-500' : ''}
              />
              {getFieldError('contactEmail') && (
                <p className="text-sm text-red-500">{getFieldError('contactEmail')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">
                Contact Phone {isRequired('contactPhone') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone || ''}
                onChange={(e) => updateField('contactPhone', e.target.value)}
                placeholder={fields.contactPhone?.placeholder}
                className={getFieldError('contactPhone') ? 'border-red-500' : ''}
              />
              {getFieldError('contactPhone') && (
                <p className="text-sm text-red-500">{getFieldError('contactPhone')}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsorAddressLine1">Address</Label>
            <Input
              id="sponsorAddressLine1"
              value={formData.sponsorAddressLine1 || ''}
              onChange={(e) => updateField('sponsorAddressLine1', e.target.value)}
              placeholder={fields.sponsorAddressLine1?.placeholder}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorCity">City</Label>
              <Input
                id="sponsorCity"
                value={formData.sponsorCity || ''}
                onChange={(e) => updateField('sponsorCity', e.target.value)}
                placeholder={fields.sponsorCity?.placeholder}
                className={getFieldError('sponsorCity') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorState">State</Label>
              <Input
                id="sponsorState"
                value={formData.sponsorState || ''}
                onChange={(e) => updateField('sponsorState', e.target.value)}
                placeholder={fields.sponsorState?.placeholder}
                className={getFieldError('sponsorState') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorZip">ZIP Code</Label>
              <Input
                id="sponsorZip"
                value={formData.sponsorZip || ''}
                onChange={(e) => updateField('sponsorZip', e.target.value)}
                placeholder={fields.sponsorZip?.placeholder}
                className={getFieldError('sponsorZip') ? 'border-red-500' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigational Drug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drugGenericName">
                Generic Name {isRequired('drugGenericName') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="drugGenericName"
                value={formData.drugGenericName || ''}
                onChange={(e) => updateField('drugGenericName', e.target.value)}
                placeholder={fields.drugGenericName?.placeholder}
                className={getFieldError('drugGenericName') ? 'border-red-500' : ''}
              />
              {getFieldError('drugGenericName') && (
                <p className="text-sm text-red-500">{getFieldError('drugGenericName')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="drugTradeName">Trade Name</Label>
              <Input
                id="drugTradeName"
                value={formData.drugTradeName || ''}
                onChange={(e) => updateField('drugTradeName', e.target.value)}
                placeholder={fields.drugTradeName?.placeholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activeIngredients">
              Active Ingredients {isRequired('activeIngredients') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="activeIngredients"
              value={formData.activeIngredients || ''}
              onChange={(e) => updateField('activeIngredients', e.target.value)}
              placeholder={fields.activeIngredients?.placeholder}
              className={getFieldError('activeIngredients') ? 'border-red-500' : ''}
              rows={3}
            />
            {getFieldError('activeIngredients') && (
              <p className="text-sm text-red-500">{getFieldError('activeIngredients')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosageForm">Dosage Form</Label>
              <Select
                value={formData.dosageForm || ''}
                onValueChange={(value) => updateField('dosageForm', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dosage form" />
                </SelectTrigger>
                <SelectContent>
                  {fields.dosageForm?.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacologicalClass">Pharmacological Class</Label>
              <Input
                id="pharmacologicalClass"
                value={formData.pharmacologicalClass || ''}
                onChange={(e) => updateField('pharmacologicalClass', e.target.value)}
                placeholder={fields.pharmacologicalClass?.placeholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeOfAdministration">
              Route of Administration {isRequired('routeOfAdministration') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="routeOfAdministration"
              value={formData.routeOfAdministration || ''}
              onChange={(e) => updateField('routeOfAdministration', e.target.value)}
              placeholder={fields.routeOfAdministration?.placeholder}
              className={getFieldError('routeOfAdministration') ? 'border-red-500' : ''}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Study Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Study Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studyTitle">
              Study Title {isRequired('studyTitle') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="studyTitle"
              value={formData.studyTitle || ''}
              onChange={(e) => updateField('studyTitle', e.target.value)}
              placeholder={fields.studyTitle?.placeholder}
              className={getFieldError('studyTitle') ? 'border-red-500' : ''}
              rows={3}
            />
            {getFieldError('studyTitle') && (
              <p className="text-sm text-red-500">{getFieldError('studyTitle')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studyPhase">Study Phase</Label>
              <Select
                value={formData.studyPhase || ''}
                onValueChange={(value) => updateField('studyPhase', value)}
              >
                <SelectTrigger className={getFieldError('studyPhase') ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select study phase" />
                </SelectTrigger>
                <SelectContent>
                  {fields.studyPhase?.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalInvestigator">
                Principal Investigator {isRequired('principalInvestigator') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="principalInvestigator"
                value={formData.principalInvestigator || ''}
                onChange={(e) => updateField('principalInvestigator', e.target.value)}
                placeholder={fields.principalInvestigator?.placeholder}
                className={getFieldError('principalInvestigator') ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfSubjects">Number of Subjects</Label>
              <Input
                id="numberOfSubjects"
                type="number"
                value={formData.numberOfSubjects || ''}
                onChange={(e) => updateField('numberOfSubjects', parseInt(e.target.value) || '')}
                placeholder={fields.numberOfSubjects?.placeholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyDuration">Study Duration</Label>
              <Input
                id="studyDuration"
                value={formData.studyDuration || ''}
                onChange={(e) => updateField('studyDuration', e.target.value)}
                placeholder={fields.studyDuration?.placeholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studyObjectives">
              Study Objectives {isRequired('studyObjectives') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="studyObjectives"
              value={formData.studyObjectives || ''}
              onChange={(e) => updateField('studyObjectives', e.target.value)}
              placeholder={fields.studyObjectives?.placeholder}
              className={getFieldError('studyObjectives') ? 'border-red-500' : ''}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signature Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorSignatureName">
                Signatory Name {isRequired('sponsorSignatureName') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="sponsorSignatureName"
                value={formData.sponsorSignatureName || ''}
                onChange={(e) => updateField('sponsorSignatureName', e.target.value)}
                placeholder={fields.sponsorSignatureName?.placeholder}
                className={getFieldError('sponsorSignatureName') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorTitle">
                Title {isRequired('sponsorTitle') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="sponsorTitle"
                value={formData.sponsorTitle || ''}
                onChange={(e) => updateField('sponsorTitle', e.target.value)}
                placeholder={fields.sponsorTitle?.placeholder}
                className={getFieldError('sponsorTitle') ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="signatureDate">
              Signature Date {isRequired('signatureDate') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Input
              id="signatureDate"
              type="date"
              value={formData.signatureDate || ''}
              onChange={(e) => updateField('signatureDate', e.target.value)}
              className={getFieldError('signatureDate') ? 'border-red-500' : ''}
            />
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {document.validationReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Validation Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Completion Status</span>
                <Badge variant={document.validationReport.completionPercentage === 100 ? "default" : "secondary"}>
                  {document.validationReport.completionPercentage}% Complete
                </Badge>
              </div>

              {document.validationReport.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Errors ({document.validationReport.errors.length})</span>
                  </div>
                  <div className="space-y-1">
                    {document.validationReport.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 ml-6">
                        {error.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {document.validationReport.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Warnings ({document.validationReport.warnings.length})</span>
                  </div>
                  <div className="space-y-1">
                    {document.validationReport.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-yellow-600 ml-6">
                        {warning.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {document.validationReport.completionPercentage === 100 &&
               document.validationReport.errors.length === 0 && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Document is ready for submission</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};