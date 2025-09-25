'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { INDFormData } from '@/types/ind-types';

interface FDA1572FormProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
}

export function FDA1572Form({ formData, onChange, errors }: FDA1572FormProps) {
  const updateFormData = (field: keyof INDFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Investigator Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Principal Investigator Information</CardTitle>
          <CardDescription>Information about the principal investigator conducting the study</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investigatorName">
                Investigator Name <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
              </Label>
              <Input
                id="investigatorName"
                value={formData.investigatorName || ''}
                onChange={(e) => updateFormData('investigatorName', e.target.value)}
                placeholder="Dr. Jane Smith"
                className={errors.investigatorName ? 'border-red-500' : ''}
              />
              {errors.investigatorName && <p className="text-sm text-red-500">{errors.investigatorName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="investigatorInstitution">Institution</Label>
              <Input
                id="investigatorInstitution"
                value={formData.investigatorInstitution || ''}
                onChange={(e) => updateFormData('investigatorInstitution', e.target.value)}
                placeholder="University Medical Center"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigatorAddress">Address</Label>
            <Textarea
              id="investigatorAddress"
              value={formData.investigatorAddress || ''}
              onChange={(e) => updateFormData('investigatorAddress', e.target.value)}
              placeholder="Street address, City, State, ZIP"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investigatorPhone">Phone Number</Label>
              <Input
                id="investigatorPhone"
                value={formData.investigatorPhone || ''}
                onChange={(e) => updateFormData('investigatorPhone', e.target.value)}
                placeholder="+1-555-123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investigatorEmail">Email Address</Label>
              <Input
                id="investigatorEmail"
                type="email"
                value={formData.investigatorEmail || ''}
                onChange={(e) => updateFormData('investigatorEmail', e.target.value)}
                placeholder="investigator@institution.edu"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education and Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Education and Training</CardTitle>
          <CardDescription>Investigator's educational background and clinical experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="investigatorEducation">Education</Label>
            <Textarea
              id="investigatorEducation"
              value={formData.investigatorEducation || ''}
              onChange={(e) => updateFormData('investigatorEducation', e.target.value)}
              placeholder="MD, University of Medicine (1995)&#10;PhD, Pharmacology, University of Science (1990)&#10;Residency in Internal Medicine (1995-1998)"
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Include degrees, institutions, years, residency, fellowship, board certifications
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investigatorExperience">Clinical Research Experience</Label>
            <Textarea
              id="investigatorExperience"
              value={formData.investigatorExperience || ''}
              onChange={(e) => updateFormData('investigatorExperience', e.target.value)}
              placeholder="• Principal Investigator on 15+ Phase II/III oncology trials (2010-present)&#10;• Co-Investigator on FDA pivotal studies for drug X and Y&#10;• 25+ publications in peer-reviewed journals&#10;• Current Good Clinical Practice (GCP) certified"
              rows={4}
            />
            <p className="text-xs text-gray-500">
              Include relevant clinical trial experience, publications, certifications
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regulatory Commitments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigator Commitments</CardTitle>
          <CardDescription>FDA regulatory commitments (automatically included in Form 1572)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">By signing Form 1572, the investigator agrees to:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside text-gray-700">
              <li>Conduct the study according to the protocol and FDA regulations</li>
              <li>Obtain informed consent from all subjects</li>
              <li>Report adverse experiences to the sponsor</li>
              <li>Maintain adequate and accurate records</li>
              <li>Ensure IRB review and approval before study initiation</li>
              <li>Allow FDA inspection of records and facilities</li>
            </ul>
            <p className="text-xs text-gray-600 mt-2">
              These commitments will be automatically included in the generated Form 1572 document.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}