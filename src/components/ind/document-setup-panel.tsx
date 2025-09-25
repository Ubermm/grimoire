'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle } from 'lucide-react';

interface DocumentType {
  id: string;
  title: string;
  description: string;
  required: boolean;
  icon: React.ReactNode;
  details: string[];
}

interface DocumentSetupPanelProps {
  selectedDocuments: Set<string>;
  onSelectionChange: (documents: Set<string>) => void;
}

export function DocumentSetupPanel({ selectedDocuments, onSelectionChange }: DocumentSetupPanelProps) {
  const documentTypes: DocumentType[] = [
    {
      id: 'FDA_1571',
      title: 'FDA Form 1571',
      description: 'Investigational New Drug Application (IND)',
      required: true,
      icon: <FileText className="h-5 w-5" />,
      details: [
        'Required for all IND submissions',
        'Contains sponsor and drug information',
        'Includes study objectives and design',
        'Required FDA approval before study initiation'
      ]
    },
    {
      id: 'FDA_1572',
      title: 'FDA Form 1572',
      description: 'Statement of Investigator',
      required: false,
      icon: <FileText className="h-5 w-5" />,
      details: [
        'Required for each clinical investigator',
        'Contains investigator qualifications',
        'Includes institutional information',
        'Commitment to protocol compliance'
      ]
    },
    {
      id: 'INVESTIGATIONAL_PLAN',
      title: 'Investigational Plan',
      description: 'Clinical study protocol summary',
      required: false,
      icon: <FileText className="h-5 w-5" />,
      details: [
        'Detailed study protocol',
        'Primary and secondary endpoints',
        'Subject inclusion/exclusion criteria',
        'Statistical analysis plan'
      ]
    },
    {
      id: 'CMC_SUMMARY',
      title: 'CMC Summary',
      description: 'Chemistry, Manufacturing, and Controls',
      required: false,
      icon: <FileText className="h-5 w-5" />,
      details: [
        'Drug substance information',
        'Manufacturing process details',
        'Quality control specifications',
        'Stability data summary'
      ]
    }
  ];

  const toggleDocument = (documentId: string, required: boolean) => {
    if (required) return; // Can't deselect required documents

    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    onSelectionChange(newSelected);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Document Selection</h2>
        <p className="text-gray-600 mb-6">
          Choose the documents you need for your IND submission. FDA Form 1571 is required for all submissions.
        </p>
      </div>

      <div className="grid gap-4">
        {documentTypes.map((doc) => {
          const isSelected = doc.required || selectedDocuments.has(doc.id);

          return (
            <Card
              key={doc.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              } ${doc.required ? 'ring-2 ring-blue-200' : ''}`}
              onClick={() => toggleDocument(doc.id, doc.required)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {doc.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{doc.title}</h3>
                        {doc.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {!doc.required && isSelected && (
                          <Badge variant="default" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{doc.description}</p>
                      <ul className="space-y-1">
                        {doc.details.map((detail, index) => (
                          <li key={index} className="text-sm text-gray-500 flex items-start gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isSelected && (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Selected Documents Summary</h4>
        <div className="flex flex-wrap gap-2">
          <Badge key="FDA_1571" className="bg-blue-600">
            FDA Form 1571 (Required)
          </Badge>
          {Array.from(selectedDocuments).map(docId => (
            <Badge key={docId} variant="secondary">
              {documentTypes.find(d => d.id === docId)?.title}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-blue-700 mt-2">
          {selectedDocuments.size + 1} document{selectedDocuments.size !== 0 ? 's' : ''} will be created
        </p>
      </div>
    </div>
  );
}