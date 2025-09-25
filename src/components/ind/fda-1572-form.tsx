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

interface FDA1572FormProps {
  document: INDDocument;
  onUpdate: (document: INDDocument) => void;
}

export const FDA1572Form: React.FC<FDA1572FormProps> = ({ document, onUpdate }) => {
  const [formData, setFormData] = useState<Record<string, any>>(document.formData || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get field configuration from dictionary
  const fields = PLACEHOLDER_DICTIONARY['FDA_1572'];

  // Initialize form with default values
  useEffect(() => {
    const initialData = { ...document.formData };

    // Set default values for empty fields
    if (!initialData.submissionDate) {
      initialData.submissionDate = new Date().toISOString().split('T')[0];
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
          <h4 className="text-lg font-semibold">FDA Form 1572</h4>
          <p className="text-sm text-muted-foreground">
            Statement of Investigator
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

      {/* IND Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">IND Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="indNumber">
                IND Number {isRequired('indNumber') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="indNumber"
                value={formData.indNumber || ''}
                onChange={(e) => updateField('indNumber', e.target.value)}
                placeholder={fields.indNumber?.placeholder}
                className={getFieldError('indNumber') ? 'border-red-500' : ''}
              />
              {getFieldError('indNumber') && (
                <p className="text-sm text-red-500">{getFieldError('indNumber')}</p>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigator Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigator Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investigatorName">
              Investigator Name {isRequired('investigatorName') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Input
              id="investigatorName"
              value={formData.investigatorName || ''}
              onChange={(e) => updateField('investigatorName', e.target.value)}
              placeholder={fields.investigatorName?.placeholder}
              className={getFieldError('investigatorName') ? 'border-red-500' : ''}
            />
            {getFieldError('investigatorName') && (
              <p className="text-sm text-red-500">{getFieldError('investigatorName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigatorAddressLine1">Address</Label>
            <Input
              id="investigatorAddressLine1"
              value={formData.investigatorAddressLine1 || ''}
              onChange={(e) => updateField('investigatorAddressLine1', e.target.value)}
              placeholder={fields.investigatorAddressLine1?.placeholder}
              className={getFieldError('investigatorAddressLine1') ? 'border-red-500' : ''}
            />
            <Input
              id="investigatorAddressLine2"
              value={formData.investigatorAddressLine2 || ''}
              onChange={(e) => updateField('investigatorAddressLine2', e.target.value)}
              placeholder={fields.investigatorAddressLine2?.placeholder}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investigatorCity">City</Label>
              <Input
                id="investigatorCity"
                value={formData.investigatorCity || ''}
                onChange={(e) => updateField('investigatorCity', e.target.value)}
                placeholder={fields.investigatorCity?.placeholder}
                className={getFieldError('investigatorCity') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investigatorState">State</Label>
              <Input
                id="investigatorState"
                value={formData.investigatorState || ''}
                onChange={(e) => updateField('investigatorState', e.target.value)}
                placeholder={fields.investigatorState?.placeholder}
                className={getFieldError('investigatorState') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investigatorZip">ZIP Code</Label>
              <Input
                id="investigatorZip"
                value={formData.investigatorZip || ''}
                onChange={(e) => updateField('investigatorZip', e.target.value)}
                placeholder={fields.investigatorZip?.placeholder}
                className={getFieldError('investigatorZip') ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investigatorPhone">
                Phone Number {isRequired('investigatorPhone') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="investigatorPhone"
                value={formData.investigatorPhone || ''}
                onChange={(e) => updateField('investigatorPhone', e.target.value)}
                placeholder={fields.investigatorPhone?.placeholder}
                className={getFieldError('investigatorPhone') ? 'border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investigatorEmail">
                Email Address {isRequired('investigatorEmail') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="investigatorEmail"
                type="email"
                value={formData.investigatorEmail || ''}
                onChange={(e) => updateField('investigatorEmail', e.target.value)}
                placeholder={fields.investigatorEmail?.placeholder}
                className={getFieldError('investigatorEmail') ? 'border-red-500' : ''}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education and Training */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Education and Training</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investigatorEducation">
              Education {isRequired('investigatorEducation') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="investigatorEducation"
              value={formData.investigatorEducation || ''}
              onChange={(e) => updateField('investigatorEducation', e.target.value)}
              placeholder={fields.investigatorEducation?.placeholder}
              className={getFieldError('investigatorEducation') ? 'border-red-500' : ''}
              rows={3}
            />
            {getFieldError('investigatorEducation') && (
              <p className="text-sm text-red-500">{getFieldError('investigatorEducation')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigatorTraining">
              Training {isRequired('investigatorTraining') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="investigatorTraining"
              value={formData.investigatorTraining || ''}
              onChange={(e) => updateField('investigatorTraining', e.target.value)}
              placeholder={fields.investigatorTraining?.placeholder}
              className={getFieldError('investigatorTraining') ? 'border-red-500' : ''}
              rows={3}
            />
            {getFieldError('investigatorTraining') && (
              <p className="text-sm text-red-500">{getFieldError('investigatorTraining')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigatorExperience">
              Experience {isRequired('investigatorExperience') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="investigatorExperience"
              value={formData.investigatorExperience || ''}
              onChange={(e) => updateField('investigatorExperience', e.target.value)}
              placeholder={fields.investigatorExperience?.placeholder}
              className={getFieldError('investigatorExperience') ? 'border-red-500' : ''}
              rows={4}
            />
            {getFieldError('investigatorExperience') && (
              <p className="text-sm text-red-500">{getFieldError('investigatorExperience')}</p>
            )}
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
              Protocol Title {isRequired('studyTitle') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
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
              <Label htmlFor="protocolNumber">Protocol Number</Label>
              <Input
                id="protocolNumber"
                value={formData.protocolNumber || ''}
                onChange={(e) => updateField('protocolNumber', e.target.value)}
                placeholder={fields.protocolNumber?.placeholder}
              />
            </div>

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clinical Site Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clinicalSiteName">
              Institution Name {isRequired('clinicalSiteName') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Input
              id="clinicalSiteName"
              value={formData.clinicalSiteName || ''}
              onChange={(e) => updateField('clinicalSiteName', e.target.value)}
              placeholder={fields.clinicalSiteName?.placeholder}
              className={getFieldError('clinicalSiteName') ? 'border-red-500' : ''}
            />
            {getFieldError('clinicalSiteName') && (
              <p className="text-sm text-red-500">{getFieldError('clinicalSiteName')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clinicalSiteAddress">
              Institution Address {isRequired('clinicalSiteAddress') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
            </Label>
            <Textarea
              id="clinicalSiteAddress"
              value={formData.clinicalSiteAddress || ''}
              onChange={(e) => updateField('clinicalSiteAddress', e.target.value)}
              placeholder={fields.clinicalSiteAddress?.placeholder}
              className={getFieldError('clinicalSiteAddress') ? 'border-red-500' : ''}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facilityRegistration">Facility Registration Number</Label>
            <Input
              id="facilityRegistration"
              value={formData.facilityRegistration || ''}
              onChange={(e) => updateField('facilityRegistration', e.target.value)}
              placeholder={fields.facilityRegistration?.placeholder}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sub-Investigators */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sub-Investigators</CardTitle>
          <CardDescription>List any sub-investigators who will assist in conducting the study</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subInvestigators">Sub-Investigators</Label>
            <Textarea
              id="subInvestigators"
              value={formData.subInvestigators || ''}
              onChange={(e) => updateField('subInvestigators', e.target.value)}
              placeholder={fields.subInvestigators?.placeholder}
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
              <Label htmlFor="investigatorSignatureName">
                Investigator Signature Name {isRequired('investigatorSignatureName') && <Badge variant="destructive" className="text-xs ml-1">Required</Badge>}
              </Label>
              <Input
                id="investigatorSignatureName"
                value={formData.investigatorSignatureName || ''}
                onChange={(e) => updateField('investigatorSignatureName', e.target.value)}
                placeholder={fields.investigatorSignatureName?.placeholder}
                className={getFieldError('investigatorSignatureName') ? 'border-red-500' : ''}
              />
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="witnessName">Witness Name</Label>
              <Input
                id="witnessName"
                value={formData.witnessName || ''}
                onChange={(e) => updateField('witnessName', e.target.value)}
                placeholder={fields.witnessName?.placeholder}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="witnessDate">Witness Date</Label>
              <Input
                id="witnessDate"
                type="date"
                value={formData.witnessDate || ''}
                onChange={(e) => updateField('witnessDate', e.target.value)}
              />
            </div>
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