//@ts-nocheck
'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Users, Clock, Target } from 'lucide-react';
import { INDFormData } from '@/types/ind-types';

interface StudyInfoPanelProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
}

export function StudyInfoPanel({ formData, onChange, errors }: StudyInfoPanelProps) {
  const updateField = (field: keyof INDFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const studyPhases = [
    { value: 'Phase_I', label: 'Phase I', description: 'First-in-human studies, safety and dosage' },
    { value: 'Phase_II', label: 'Phase II', description: 'Efficacy studies in target population' },
    { value: 'Phase_III', label: 'Phase III', description: 'Large-scale efficacy and safety studies' },
    { value: 'Phase_IV', label: 'Phase IV', description: 'Post-marketing surveillance studies' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Study Information</h2>
        <p className="text-gray-600 mb-6">
          Provide details about the clinical study design and objectives.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Study Title and Phase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Study Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="studyTitle" className="text-sm font-medium">
                Study Title *
              </Label>
              <Input
                id="studyTitle"
                value={formData.studyTitle}
                onChange={(e) => updateField('studyTitle', e.target.value)}
                placeholder="e.g., A Phase I Safety Study of Investigational Drug XYZ-123 in Healthy Volunteers"
                className={errors.studyTitle ? 'border-red-500' : ''}
              />
              {errors.studyTitle && (
                <p className="text-red-500 text-sm mt-1">{errors.studyTitle}</p>
              )}
            </div>

            <div>
              <Label htmlFor="studyPhase" className="text-sm font-medium">
                Study Phase *
              </Label>
              <Select
                value={formData.studyPhase}
                onValueChange={(value) => updateField('studyPhase', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select study phase" />
                </SelectTrigger>
                <SelectContent>
                  {studyPhases.map((phase) => (
                    <SelectItem key={phase.value} value={phase.value}>
                      <div>
                        <div className="font-medium">{phase.label}</div>
                        <div className="text-sm text-gray-600">{phase.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Study Design Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Study Objectives
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="primaryObjectives" className="text-sm font-medium">
                Primary Objectives *
              </Label>
              <Textarea
                id="primaryObjectives"
                value={formData.primaryObjectives}
                onChange={(e) => updateField('primaryObjectives', e.target.value)}
                placeholder="Describe the primary objectives of the study..."
                rows={4}
                className={errors.primaryObjectives ? 'border-red-500' : ''}
              />
              {errors.primaryObjectives && (
                <p className="text-red-500 text-sm mt-1">{errors.primaryObjectives}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Study Logistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Study Logistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numberOfSubjects" className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Number of Subjects
                  </div>
                </Label>
                <Input
                  id="numberOfSubjects"
                  type="number"
                  value={formData.numberOfSubjects || ''}
                  onChange={(e) => updateField('numberOfSubjects', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 24"
                />
              </div>
              <div>
                <Label htmlFor="studyDuration" className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Study Duration
                  </div>
                </Label>
                <Input
                  id="studyDuration"
                  value={formData.studyDuration || ''}
                  onChange={(e) => updateField('studyDuration', e.target.value)}
                  placeholder="e.g., 12 weeks"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Phase Information */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">Study Phase Guidelines</h4>
          <div className="text-sm text-purple-700 space-y-2">
            {studyPhases.map((phase) => (
              <div key={phase.value} className={`p-2 rounded ${
                formData.studyPhase === phase.value ? 'bg-purple-100 border border-purple-300' : ''
              }`}>
                <div className="font-medium">{phase.label}:</div>
                <div>{phase.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Study Information Requirements</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Study title should be descriptive and include the study phase</li>
            <li>• Primary objectives must clearly state what the study aims to achieve</li>
            <li>• Consider regulatory guidance for your specific study phase</li>
            <li>• Ensure objectives align with the selected study phase</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
