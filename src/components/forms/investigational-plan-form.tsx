'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { INDFormData } from '@/types/ind-types';

interface InvestigationalPlanFormProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
}

export function InvestigationalPlanForm({ formData, onChange, errors }: InvestigationalPlanFormProps) {
  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Investigational Plan</CardTitle>
          <CardDescription>Detailed protocol information for the clinical study</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            The investigational plan will be generated based on the information provided in the Basic Information and Drug Details tabs.
            Additional protocol-specific details can be added after document creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}