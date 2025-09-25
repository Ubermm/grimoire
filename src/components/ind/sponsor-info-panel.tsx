'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, User, Mail, Phone, MapPin } from 'lucide-react';
import { INDFormData } from '@/types/ind-types';

interface SponsorInfoPanelProps {
  formData: INDFormData;
  onChange: (data: INDFormData) => void;
  errors: Record<string, string>;
}

export function SponsorInfoPanel({ formData, onChange, errors }: SponsorInfoPanelProps) {
  const updateField = (field: keyof INDFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Sponsor Information</h2>
        <p className="text-gray-600 mb-6">
          Provide details about the organization sponsoring this IND application.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sponsorName" className="text-sm font-medium">
                Sponsor Name *
              </Label>
              <Input
                id="sponsorName"
                value={formData.sponsorName}
                onChange={(e) => updateField('sponsorName', e.target.value)}
                placeholder="e.g., Acme Pharmaceuticals Inc."
                className={errors.sponsorName ? 'border-red-500' : ''}
              />
              {errors.sponsorName && (
                <p className="text-red-500 text-sm mt-1">{errors.sponsorName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsorAddress" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="sponsorAddress"
                  value={formData.sponsorAddress}
                  onChange={(e) => updateField('sponsorAddress', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div>
                <Label htmlFor="sponsorCity" className="text-sm font-medium">
                  City
                </Label>
                <Input
                  id="sponsorCity"
                  value={formData.sponsorCity}
                  onChange={(e) => updateField('sponsorCity', e.target.value)}
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsorState" className="text-sm font-medium">
                  State
                </Label>
                <Input
                  id="sponsorState"
                  value={formData.sponsorState}
                  onChange={(e) => updateField('sponsorState', e.target.value)}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="sponsorZip" className="text-sm font-medium">
                  ZIP Code
                </Label>
                <Input
                  id="sponsorZip"
                  value={formData.sponsorZip}
                  onChange={(e) => updateField('sponsorZip', e.target.value)}
                  placeholder="ZIP code"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Primary Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactPerson" className="text-sm font-medium">
                Contact Person *
              </Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => updateField('contactPerson', e.target.value)}
                placeholder="e.g., Dr. Jane Smith"
                className={errors.contactPerson ? 'border-red-500' : ''}
              />
              {errors.contactPerson && (
                <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </div>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contactPhone" className="text-sm font-medium">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </div>
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="+1-555-123-4567"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Requirements
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• The sponsor is legally responsible for the IND application</li>
            <li>• Contact person should be available for FDA communications</li>
            <li>• All correspondence will be sent to the provided address</li>
            <li>• Ensure contact information is accurate and up-to-date</li>
          </ul>
        </div>
      </div>
    </div>
  );
}