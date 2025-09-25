//@ts-nocheck
// @ts-nocheck
// src/components/ind/document-preview-panel.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FDA1571Form } from '@/components/forms/fda-1571-form'
import { FDA1572Form } from '@/components/forms/fda-1572-form'
import { InvestigationalPlanForm } from '@/components/forms/investigational-plan-form'

interface DocumentPreviewPanelProps {
  selectedDocument: string | null
}

const renderForm = (documentType: string) => {
  switch (documentType) {
    case 'FDA_1571':
      return <FDA1571Form />
    case 'FDA_1572':
      return <FDA1572Form />
    case 'INVESTIGATIONAL_PLAN':
      return <InvestigationalPlanForm />
    default:
      return <p>Form not available for {documentType}.</p>
  }
}

export function DocumentPreviewPanel({
  selectedDocument
}: DocumentPreviewPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Document Preview & Form</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedDocument ? (
          <div>
            {renderForm(selectedDocument)}
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Select a document to see the form.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
