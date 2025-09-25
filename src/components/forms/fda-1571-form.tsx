//@ts-nocheck
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { INDFormData } from '@/types/ind-types';

interface FDA1571FormProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
}

export function FDA1571Form({ formData, onChange, errors }: FDA1571FormProps) {
  const updateFormData = (field: keyof INDFormData, value: any) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  const addActiveIngredient = () => {
    const newIngredients = [...(formData.activeIngredients || []), ''];
    updateFormData('activeIngredients', newIngredients);
  };

  const updateActiveIngredient = (index: number, value: string) => {
    const newIngredients = [...(formData.activeIngredients || [])];
    newIngredients[index] = value;
    updateFormData('activeIngredients', newIngredients);
  };

  const removeActiveIngredient = (index: number) => {
    const newIngredients = formData.activeIngredients.filter((_, i) => i !== index);
    updateFormData('activeIngredients', newIngredients);
  };

  const addRouteOfAdministration = () => {
    const newRoutes = [...(formData.routeOfAdministration || []), ''];
    updateFormData('routeOfAdministration', newRoutes);
  };

  const updateRouteOfAdministration = (index: number, value: string) => {
    const newRoutes = [...(formData.routeOfAdministration || [])];
    newRoutes[index] = value;
    updateFormData('routeOfAdministration', newRoutes);
  };

  const removeRouteOfAdministration = (index: number) => {
    const newRoutes = formData.routeOfAdministration.filter((_, i) => i !== index);
    updateFormData('routeOfAdministration', newRoutes);
  };

  const routeOptions = [
    'Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical',
    'Inhalation', 'Nasal', 'Ophthalmic', 'Otic', 'Rectal', 'Vaginal'
  ];

  const dosageFormOptions = [
    'Tablet', 'Capsule', 'Solution', 'Suspension', 'Injection',
    'Cream', 'Ointment', 'Gel', 'Patch', 'Powder', 'Other'
  ];

  return (
    <div className="space-y-6 mt-4">
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
                Sponsor Name <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
              </Label>
              <Input
                id="sponsorName"
                value={formData.sponsorName}
                onChange={(e) => updateFormData('sponsorName', e.target.value)}
                placeholder="Enter sponsor organization name"
                className={errors.sponsorName ? 'border-red-500' : ''}
              />
              {errors.sponsorName && <p className="text-sm text-red-500">{errors.sponsorName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">
                Contact Person <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => updateFormData('contactPerson', e.target.value)}
                placeholder="Primary contact person name"
                className={errors.contactPerson ? 'border-red-500' : ''}
              />
              {errors.contactPerson && <p className="text-sm text-red-500">{errors.contactPerson}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">
                Contact Email <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateFormData('contactEmail', e.target.value)}
                placeholder="contact@example.com"
                className={errors.contactEmail ? 'border-red-500' : ''}
              />
              {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => updateFormData('contactPhone', e.target.value)}
                placeholder="+1-555-123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sponsorAddress">Address</Label>
            <Input
              id="sponsorAddress"
              value={formData.sponsorAddress}
              onChange={(e) => updateFormData('sponsorAddress', e.target.value)}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sponsorCity">City</Label>
              <Input
                id="sponsorCity"
                value={formData.sponsorCity}
                onChange={(e) => updateFormData('sponsorCity', e.target.value)}
                placeholder="City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorState">State</Label>
              <Input
                id="sponsorState"
                value={formData.sponsorState}
                onChange={(e) => updateFormData('sponsorState', e.target.value)}
                placeholder="State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sponsorZip">ZIP Code</Label>
              <Input
                id="sponsorZip"
                value={formData.sponsorZip}
                onChange={(e) => updateFormData('sponsorZip', e.target.value)}
                placeholder="ZIP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drug Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigational Drug Information</CardTitle>
          <CardDescription>Details about the drug being investigated</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drugGenericName">
                Generic Name <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
              </Label>
              <Input
                id="drugGenericName"
                value={formData.drugGenericName}
                onChange={(e) => updateFormData('drugGenericName', e.target.value)}
                placeholder="Enter generic drug name"
                className={errors.drugGenericName ? 'border-red-500' : ''}
              />
              {errors.drugGenericName && <p className="text-sm text-red-500">{errors.drugGenericName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="drugTradeName">Trade Name (Optional)</Label>
              <Input
                id="drugTradeName"
                value={formData.drugTradeName || ''}
                onChange={(e) => updateFormData('drugTradeName', e.target.value)}
                placeholder="Trade name if available"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Active Ingredients <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
            </Label>
            <div className="space-y-2">
              {formData.activeIngredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={ingredient}
                    onChange={(e) => updateActiveIngredient(index, e.target.value)}
                    placeholder={`Active ingredient ${index + 1}`}
                    className={errors.activeIngredients ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeActiveIngredient(index)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addActiveIngredient}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Active Ingredient
              </Button>
              {errors.activeIngredients && <p className="text-sm text-red-500">{errors.activeIngredients}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dosage Form</Label>
              <Select value={formData.dosageForm} onValueChange={(value) => updateFormData('dosageForm', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dosage form" />
                </SelectTrigger>
                <SelectContent>
                  {dosageFormOptions.map((form) => (
                    <SelectItem key={form} value={form}>{form}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pharmacologicalClass">Pharmacological Class (Optional)</Label>
              <Input
                id="pharmacologicalClass"
                value={formData.pharmacologicalClass || ''}
                onChange={(e) => updateFormData('pharmacologicalClass', e.target.value)}
                placeholder="e.g., Antineoplastic agent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Route of Administration</Label>
            <div className="space-y-2">
              {formData.routeOfAdministration.map((route, index) => (
                <div key={index} className="flex gap-2">
                  <Select value={route} onValueChange={(value) => updateRouteOfAdministration(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routeOptions.map((option) => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRouteOfAdministration(index)}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRouteOfAdministration}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Route of Administration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Study Information</CardTitle>
          <CardDescription>Details about the clinical study</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studyTitle">
              Study Title <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
            </Label>
            <Input
              id="studyTitle"
              value={formData.studyTitle}
              onChange={(e) => updateFormData('studyTitle', e.target.value)}
              placeholder="Enter the clinical study title"
              className={errors.studyTitle ? 'border-red-500' : ''}
            />
            {errors.studyTitle && <p className="text-sm text-red-500">{errors.studyTitle}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Study Phase</Label>
              <Select value={formData.studyPhase} onValueChange={(value: any) => updateFormData('studyPhase', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select study phase" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Phase_I">Phase I</SelectItem>
                  <SelectItem value="Phase_II">Phase II</SelectItem>
                  <SelectItem value="Phase_III">Phase III</SelectItem>
                  <SelectItem value="Phase_IV">Phase IV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfSubjects">Number of Subjects (Optional)</Label>
              <Input
                id="numberOfSubjects"
                type="number"
                value={formData.numberOfSubjects || ''}
                onChange={(e) => updateFormData('numberOfSubjects', parseInt(e.target.value) || undefined)}
                placeholder="Estimated number of subjects"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryObjectives">Primary Objectives</Label>
            <Textarea
              id="primaryObjectives"
              value={formData.primaryObjectives}
              onChange={(e) => updateFormData('primaryObjectives', e.target.value)}
              placeholder="Describe the primary objectives of the study"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studyDuration">Study Duration (Optional)</Label>
            <Input
              id="studyDuration"
              value={formData.studyDuration || ''}
              onChange={(e) => updateFormData('studyDuration', e.target.value)}
              placeholder="e.g., 6 months, 1 year"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
