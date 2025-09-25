//@ts-nocheck
'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Building2, GraduationCap, Award, Mail, Phone, Info } from 'lucide-react';
import { INDFormData } from '@/types/ind-types';

interface InvestigatorInfoPanelProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
  isRequired: boolean;
}

export function InvestigatorInfoPanel({ formData, onChange, errors, isRequired }: InvestigatorInfoPanelProps) {
  const updateField = (field: keyof INDFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  if (!isRequired) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Investigator Information</h2>
          <p className="text-gray-600 mb-6">
            This section is optional since FDA Form 1572 was not selected.
          </p>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            FDA Form 1572 (Statement of Investigator) was not selected in the document setup.
            If you need to include investigator information, go back to the Document Setup panel
            and select FDA Form 1572.
          </AlertDescription>
        </Alert>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">Investigator information not required for selected documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Investigator Information</h2>
        <p className="text-gray-600 mb-6">
          Provide information about the principal investigator for FDA Form 1572.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Investigator Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Investigator Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="investigatorName" className="text-sm font-medium">
                Investigator Name *
              </Label>
              <Input
                id="investigatorName"
                value={formData.investigatorName || ''}
                onChange={(e) => updateField('investigatorName', e.target.value)}
                placeholder="e.g., Dr. Sarah Johnson, MD, PhD"
                className={errors.investigatorName ? 'border-red-500' : ''}
              />
              {errors.investigatorName && (
                <p className="text-red-500 text-sm mt-1">{errors.investigatorName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investigatorEmail" className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </div>
                </Label>
                <Input
                  id="investigatorEmail"
                  type="email"
                  value={formData.investigatorEmail || ''}
                  onChange={(e) => updateField('investigatorEmail', e.target.value)}
                  placeholder="investigator@hospital.org"
                />
              </div>
              <div>
                <Label htmlFor="investigatorPhone" className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                </Label>
                <Input
                  id="investigatorPhone"
                  type="tel"
                  value={formData.investigatorPhone || ''}
                  onChange={(e) => updateField('investigatorPhone', e.target.value)}
                  placeholder="+1-555-987-6543"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institution Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Institution Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="investigatorInstitution" className="text-sm font-medium">
                Institution Name *
              </Label>
              <Input
                id="investigatorInstitution"
                value={formData.investigatorInstitution || ''}
                onChange={(e) => updateField('investigatorInstitution', e.target.value)}
                placeholder="e.g., University Medical Center"
                className={errors.investigatorInstitution ? 'border-red-500' : ''}
              />
              {errors.investigatorInstitution && (
                <p className="text-red-500 text-sm mt-1">{errors.investigatorInstitution}</p>
              )}
            </div>

            <div>
              <Label htmlFor="investigatorAddress" className="text-sm font-medium">
                Institution Address
              </Label>
              <Input
                id="investigatorAddress"
                value={formData.investigatorAddress || ''}
                onChange={(e) => updateField('investigatorAddress', e.target.value)}
                placeholder="Complete institutional address"
              />
            </div>
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="investigatorEducation" className="text-sm font-medium">
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Education & Training
                </div>
              </Label>
              <Textarea
                id="investigatorEducation"
                value={formData.investigatorEducation || ''}
                onChange={(e) => updateField('investigatorEducation', e.target.value)}
                placeholder="Describe educational background, degrees, certifications..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="investigatorExperience" className="text-sm font-medium">
                Clinical Research Experience
              </Label>
              <Textarea
                id="investigatorExperience"
                value={formData.investigatorExperience || ''}
                onChange={(e) => updateField('investigatorExperience', e.target.value)}
                placeholder="Describe relevant clinical research experience, previous studies..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* FDA 1572 Requirements */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            FDA Form 1572 Requirements
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Investigator must be qualified by education, training, and experience</li>
            <li>• Must agree to conduct the study in accordance with the protocol</li>
            <li>• Required to maintain adequate records and make them available for inspection</li>
            <li>• Must report adverse events to the sponsor</li>
            <li>• Institution must have adequate facilities to conduct the study safely</li>
          </ul>
        </div>

        {/* Helpful Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Investigator Information Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Include full name with all relevant degrees and titles</li>
            <li>• Provide current institutional affiliation and complete address</li>
            <li>• Detail education, board certifications, and training relevant to the study</li>
            <li>• Highlight previous clinical research experience, especially in related therapeutic areas</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
