'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { INDCreationWidget, INDFormData } from './ind-creation-widget';

interface INDDocumentTriggerProps {
  onDocumentCreate?: (documentType: string, formData: INDFormData) => Promise<void>;
  className?: string;
}

export function INDDocumentTrigger({ onDocumentCreate, className = '' }: INDDocumentTriggerProps) {
  const [showWidget, setShowWidget] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleDocumentCreate = async (documentType: string, formData: INDFormData) => {
    if (!onDocumentCreate) return;

    try {
      setIsCreating(true);
      await onDocumentCreate(documentType, formData);
      setShowWidget(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Trigger Button/Card */}
      <Card className={`cursor-pointer hover:shadow-md transition-all ${className}`} onClick={() => setShowWidget(true)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Create IND Documents</h3>
                <p className="text-xs text-gray-600">Generate FDA-compliant submission forms</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Plus className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creation Widget Modal */}
      {showWidget && (
        <INDCreationWidget
          onDocumentCreate={handleDocumentCreate}
          onClose={() => setShowWidget(false)}
          isCreating={isCreating}
        />
      )}
    </>
  );
}

// Alternative simple button trigger
export function INDDocumentButton({ onDocumentCreate, className = '' }: INDDocumentTriggerProps) {
  const [showWidget, setShowWidget] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleDocumentCreate = async (documentType: string, formData: INDFormData) => {
    if (!onDocumentCreate) return;

    try {
      setIsCreating(true);
      await onDocumentCreate(documentType, formData);
      setShowWidget(false);
    } catch (error) {
      console.error('Failed to create document:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowWidget(true)}
        variant="outline"
        className={`${className}`}
      >
        <FileText className="h-4 w-4 mr-2" />
        Create IND Documents
      </Button>

      {showWidget && (
        <INDCreationWidget
          onDocumentCreate={handleDocumentCreate}
          onClose={() => setShowWidget(false)}
          isCreating={isCreating}
        />
      )}
    </>
  );
}