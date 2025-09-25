//@ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Eye, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

// PDF Manager
import { pdfManager } from '@/lib/ind/pdf-manager';

interface INDDocument {
  _id: string;
  documentType: string;
  formData: Record<string, any>;
  validationReport: {
    completionPercentage: number;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
  originalPdfUrl: string;
  renderedPdfUrl?: string;
}

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  document: INDDocument;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ isOpen, onClose, document }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && document) {
      // If we already have a rendered PDF, use it
      if (document.renderedPdfUrl) {
        setPdfUrl(document.renderedPdfUrl);
      } else {
        // Generate preview data showing what would be filled in the PDF
        generatePreviewData();
      }
    }
  }, [isOpen, document]);

  const generatePreviewData = () => {
    try {
      const prepared = pdfManager.prepareFormDataForPdf(
        document.documentType,
        document.formData
      );
      setPreviewData(prepared);
    } catch (error) {
      console.error('Error generating preview data:', error);
      toast.error('Failed to generate PDF preview');
    }
  };

  const generatePDF = async () => {
    if (!document) return;

    setIsGenerating(true);
    try {
      // In a real implementation, this would call the PDF generation service
      const filledPdfUrl = await pdfManager.generateFilledPDF({
        documentType: document.documentType,
        formData: document.formData,
        originalPdfUrl: document.originalPdfUrl
      });

      // Update the document with the new PDF URL
      const response = await fetch('/api/ind/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: document._id,
          renderedPdfUrl: filledPdfUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update document with PDF URL');
      }

      setPdfUrl(filledPdfUrl);
      toast.success('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (pdfUrl) {
      // In a real implementation, this would trigger the PDF download
      const link = window.document.createElement('a');
      link.href = pdfUrl;
      link.download = `${document.documentType}_${document._id}.pdf`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success('PDF download started');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document?.documentType.replace('_', ' ')} PDF Preview
              </DialogTitle>
              <DialogDescription>
                Preview of the filled FDA form document
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {document?.validationReport?.completionPercentage || 0}% Complete
              </Badge>
              {pdfUrl ? (
                <Button variant="outline" onClick={downloadPDF}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              ) : (
                <Button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isGenerating ? 'Generating...' : 'Generate PDF'}
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {pdfUrl ? (
            // Show actual PDF (in a real implementation)
            <div className="h-full border rounded-lg bg-gray-50 flex items-center justify-center">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  PDF would be displayed here
                </p>
                <p className="text-xs text-gray-500">
                  In production, this would show the actual PDF viewer
                </p>
                <Button variant="outline" onClick={() => window.open(pdfUrl, '_blank')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
              </div>
            </div>
          ) : (
            // Show preview of what would be filled
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Form Data Preview
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      This shows how the data would appear in the filled PDF form:
                    </p>

                    {Object.keys(previewData).length > 0 ? (
                      <div className="space-y-3">
                        {Object.entries(previewData).map(([placeholder, value]) => (
                          <div key={placeholder} className="border-l-2 border-blue-200 pl-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="font-mono text-sm text-blue-600">
                                  {placeholder}
                                </div>
                                <div className="text-sm mt-1">
                                  {value || <span className="text-gray-400 italic">[Empty]</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p>No form data available for preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Instructions</h3>
                    <div className="space-y-2 text-sm">
                      <p>1. Complete the form fields in the left panel</p>
                      <p>2. Click "Generate PDF" to create the filled document</p>
                      <p>3. Review the generated PDF for accuracy</p>
                      <p>4. Download the PDF for submission or printing</p>
                    </div>
                  </CardContent>
                </Card>

                {document?.validationReport && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Validation Status</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Completion</span>
                          <Badge variant={document.validationReport.completionPercentage === 100 ? "default" : "secondary"}>
                            {document.validationReport.completionPercentage}%
                          </Badge>
                        </div>

                        {document.validationReport.errors.length > 0 && (
                          <div className="text-sm text-red-600">
                            <strong>Errors:</strong> {document.validationReport.errors.length}
                          </div>
                        )}

                        {document.validationReport.warnings.length > 0 && (
                          <div className="text-sm text-yellow-600">
                            <strong>Warnings:</strong> {document.validationReport.warnings.length}
                          </div>
                        )}

                        {document.validationReport.completionPercentage === 100 &&
                         document.validationReport.errors.length === 0 && (
                          <div className="text-sm text-green-600">
                            ✓ Document is ready for PDF generation
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
