'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Plus, X, Beaker, Route, Package } from 'lucide-react';
import { INDFormData } from '@/types/ind-types';

interface DrugInfoPanelProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
}

export function DrugInfoPanel({ formData, onChange, errors }: DrugInfoPanelProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const [newRoute, setNewRoute] = useState('');

  const updateField = (field: keyof INDFormData, value: any) => {
    onChange({ ...formData, [field]: value });
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      updateField('activeIngredients', [...formData.activeIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    const updated = formData.activeIngredients.filter((_, i) => i !== index);
    updateField('activeIngredients', updated);
  };

  const addRoute = () => {
    if (newRoute && !formData.routeOfAdministration.includes(newRoute)) {
      updateField('routeOfAdministration', [...formData.routeOfAdministration, newRoute]);
      setNewRoute('');
    }
  };

  const removeRoute = (route: string) => {
    const updated = formData.routeOfAdministration.filter(r => r !== route);
    updateField('routeOfAdministration', updated);
  };

  const dosageForms = [
    'Tablet', 'Capsule', 'Injection', 'Oral Solution', 'Topical Cream',
    'Inhalation', 'Transdermal Patch', 'Suppository', 'Nasal Spray', 'Other'
  ];

  const routeOptions = [
    'Oral', 'Intravenous', 'Intramuscular', 'Subcutaneous', 'Topical',
    'Inhalation', 'Intranasal', 'Rectal', 'Transdermal', 'Other'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Drug Information</h2>
        <p className="text-gray-600 mb-6">
          Provide detailed information about the investigational drug product.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Drug Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Drug Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="drugGenericName" className="text-sm font-medium">
                Generic Name *
              </Label>
              <Input
                id="drugGenericName"
                value={formData.drugGenericName}
                onChange={(e) => updateField('drugGenericName', e.target.value)}
                placeholder="e.g., investigational-compound-123"
                className={errors.drugGenericName ? 'border-red-500' : ''}
              />
              {errors.drugGenericName && (
                <p className="text-red-500 text-sm mt-1">{errors.drugGenericName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="drugTradeName" className="text-sm font-medium">
                Trade Name (if applicable)
              </Label>
              <Input
                id="drugTradeName"
                value={formData.drugTradeName || ''}
                onChange={(e) => updateField('drugTradeName', e.target.value)}
                placeholder="e.g., DrugBrand™"
              />
            </div>

            <div>
              <Label htmlFor="pharmacologicalClass" className="text-sm font-medium">
                Pharmacological Class
              </Label>
              <Input
                id="pharmacologicalClass"
                value={formData.pharmacologicalClass || ''}
                onChange={(e) => updateField('pharmacologicalClass', e.target.value)}
                placeholder="e.g., Protein kinase inhibitor"
              />
            </div>
          </CardContent>
        </Card>

        {/* Active Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Active Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add active ingredient"
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
              />
              <Button onClick={addIngredient} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.activeIngredients.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Active Ingredients:</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.activeIngredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {ingredient}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {errors.activeIngredients && (
              <p className="text-red-500 text-sm">{errors.activeIngredients}</p>
            )}
          </CardContent>
        </Card>

        {/* Dosage Form and Route */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Dosage Form & Administration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dosageForm" className="text-sm font-medium">
                Dosage Form *
              </Label>
              <Select
                value={formData.dosageForm}
                onValueChange={(value) => updateField('dosageForm', value)}
              >
                <SelectTrigger className={errors.dosageForm ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select dosage form" />
                </SelectTrigger>
                <SelectContent>
                  {dosageForms.map((form) => (
                    <SelectItem key={form} value={form}>
                      {form}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dosageForm && (
                <p className="text-red-500 text-sm mt-1">{errors.dosageForm}</p>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium flex items-center gap-1">
                <Route className="h-4 w-4" />
                Routes of Administration
              </Label>
              <div className="flex gap-2 mt-2">
                <Select value={newRoute} onValueChange={setNewRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routeOptions.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addRoute} size="sm" disabled={!newRoute}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.routeOfAdministration.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.routeOfAdministration.map((route) => (
                    <Badge key={route} variant="outline" className="flex items-center gap-1">
                      {route}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0"
                        onClick={() => removeRoute(route)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Helpful Information */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Drug Information Tips</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Use standard nomenclature for drug names and ingredients</li>
            <li>• Include all active pharmaceutical ingredients (APIs)</li>
            <li>• Select the primary dosage form for your study</li>
            <li>• Consider all planned routes of administration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}