//@ts-nocheck
'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PLACEHOLDER_DICTIONARY, type PlaceholderField } from '@/lib/ind/placeholder-dictionary';

interface INDFormRendererProps {
  documentType: string;
  onFieldChange?: (fieldName: string, value: any) => void;
}

export default function INDFormRenderer({ documentType, onFieldChange }: INDFormRendererProps) {
  const form = useFormContext();
  const fields = PLACEHOLDER_DICTIONARY[documentType];

  if (!fields) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">No form fields available for {documentType}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderField = (fieldName: string, field: PlaceholderField) => {
    const fieldPath = `responses.${fieldName}`;

    const handleFieldChange = (value: any) => {
      form.setValue(fieldPath, value);
      onFieldChange?.(fieldName, value);
    };

    return (
      <FormField
        key={fieldName}
        control={form.control}
        name={fieldPath}
        rules={{
          required: field.required ? `${field.description} is required` : false,
          pattern: field.validation ? {
            value: new RegExp(field.validation),
            message: `Invalid format for ${field.description}`
          } : undefined
        }}
        render={({ field: formField }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                {field.description}
                {field.required && <span className="text-red-500">*</span>}
              </span>
            </FormLabel>

            <div className="space-y-2">
              {/* Does not apply checkbox - matching audit form style */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formField.value === "Does not apply"}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      formField.onChange("Does not apply");
                      handleFieldChange("Does not apply");
                    } else {
                      // Reset to default value when unchecked
                      const defaultValue = getDefaultValue(field);
                      formField.onChange(defaultValue);
                      handleFieldChange(defaultValue);
                    }
                  }}
                />
                <Label className="text-sm">Does not apply</Label>
              </div>

              {/* Only show the actual form field if "Does not apply" is not checked */}
              {formField.value !== "Does not apply" && (
                <FormControl>
                  {renderInputByType(field, formField, handleFieldChange)}
                </FormControl>
              )}
            </div>

            <FormDescription className="text-xs text-muted-foreground hidden">
              {field.placeholder && (
                <span>Placeholder: {field.placeholder}</span>
              )}
            </FormDescription>

            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const getDefaultValue = (field: PlaceholderField) => {
    switch (field.fieldType) {
      case 'number':
        return '0';
      case 'date':
        return new Date().toISOString().split('T')[0];
      case 'checkbox':
        return field.options && field.options.length > 2 ? [] : false;
      case 'select':
      case 'radio':
        return field.options?.[0] || '';
      case 'textarea':
      case 'text':
      default:
        return '';
    }
  };

  const renderInputByType = (field: PlaceholderField, formField: any, handleChange: (value: any) => void) => {
    const commonInputProps = {
      className: "w-full",
      value: formField.value || '',
    };

    switch (field.fieldType) {
      case 'text':
        return (
          <Input
            {...formField}
            {...commonInputProps}
            placeholder={field.placeholder}
            onChange={(e) => {
              formField.onChange(e);
              handleChange(e.target.value);
            }}
          />
        );

      case 'textarea':
        return (
          <Textarea
            {...formField}
            {...commonInputProps}
            placeholder={field.placeholder}
            onChange={(e) => {
              formField.onChange(e);
              handleChange(e.target.value);
            }}
            className="w-full min-h-[100px] resize-vertical"
            rows={4}
          />
        );

      case 'number':
        return (
          <Input
            {...formField}
            type="number"
            placeholder={field.placeholder}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : '';
              formField.onChange(value);
              handleChange(value);
            }}
            className="w-full"
            value={formField.value || ''}
          />
        );

      case 'date':
        return (
          <Input
            {...formField}
            type="date"
            onChange={(e) => {
              formField.onChange(e);
              handleChange(e.target.value);
            }}
            className="w-full"
            value={formField.value || ''}
          />
        );

      case 'select':
        return (
          <Select
            value={formField.value || ''}
            onValueChange={(value) => {
              formField.onChange(value);
              handleChange(value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.description.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        // For multiple selection checkboxes
        if (field.options && field.options.length > 2) {
          return (
            <div className="space-y-3">
              {field.options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    checked={Array.isArray(formField.value) ? formField.value.includes(option) : false}
                    onCheckedChange={(checked) => {
                      const currentValues = Array.isArray(formField.value) ? formField.value : [];
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter(v => v !== option);
                      formField.onChange(newValues);
                      handleChange(newValues);
                    }}
                    id={`${formField.name}-${option}`}
                  />
                  <Label
                    htmlFor={`${formField.name}-${option}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          );
        }
        // Single checkbox (Yes/No style matching audit form)
        return (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formField.value === true}
                onCheckedChange={(checked) => {
                  formField.onChange(checked);
                  handleChange(checked);
                }}
                id={`${formField.name}-yes`}
              />
              <Label
                htmlFor={`${formField.name}-yes`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formField.value === false || !formField.value}
                onCheckedChange={(checked) => {
                  formField.onChange(checked ? false : true);
                  handleChange(checked ? false : true);
                }}
                id={`${formField.name}-no`}
              />
              <Label
                htmlFor={`${formField.name}-no`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                No
              </Label>
            </div>
          </div>
        );

      case 'radio':
        return (
          <RadioGroup
            value={formField.value || ''}
            onValueChange={(value) => {
              formField.onChange(value);
              handleChange(value);
            }}
            className="flex flex-col space-y-3"
          >
            {field.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${formField.name}-${option}`} />
                <Label
                  htmlFor={`${formField.name}-${option}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      default:
        return (
          <Input
            {...formField}
            {...commonInputProps}
            placeholder={field.placeholder}
            onChange={(e) => {
              formField.onChange(e);
              handleChange(e.target.value);
            }}
          />
        );
    }
  };

  // Group fields into logical sections with improved styling
  const getFieldSections = () => {
    const sections: { [key: string]: string[] } = {};

    Object.keys(fields).forEach(fieldName => {
      // Determine section based on field name patterns
      let sectionName = 'General Information';

      if (fieldName.includes('sponsor') || fieldName.includes('contact')) {
        sectionName = 'Sponsor Information';
      } else if (fieldName.includes('drug') || fieldName.includes('active') || fieldName.includes('dosage') || fieldName.includes('route') || fieldName.includes('pharmacological')) {
        sectionName = 'Drug Information';
      } else if (fieldName.includes('study') || fieldName.includes('protocol') || fieldName.includes('investigator') || fieldName.includes('principal')) {
        sectionName = 'Study Information';
      } else if (fieldName.includes('signature') || fieldName.includes('witness')) {
        sectionName = 'Signatures';
      } else if (fieldName.includes('monitor')) {
        sectionName = 'Monitor Information';
      } else if (fieldName.includes('clinical') || fieldName.includes('facility')) {
        sectionName = 'Clinical Site Information';
      } else if (fieldName.includes('education') || fieldName.includes('training') || fieldName.includes('experience') || fieldName.includes('sub')) {
        sectionName = 'Investigator Qualifications';
      } else if (fieldName.includes('objective') || fieldName.includes('endpoint') || fieldName.includes('criteria') || fieldName.includes('procedure') || fieldName.includes('statistical') || fieldName.includes('risk')) {
        sectionName = 'Study Design & Analysis';
      }

      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(fieldName);
    });

    return sections;
  };

  const sections = getFieldSections();

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white-900">
            {documentType} Form
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(sections).map(([sectionName, sectionFields]) => (
              <Card key={sectionName} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-white-900 flex items-center gap-2">
                    {sectionName}
                    <span className="text-sm font-normal text-muted-foreground">
                      ({sectionFields.length} fields)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    {sectionFields.map(fieldName => renderField(fieldName, fields[fieldName]))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
