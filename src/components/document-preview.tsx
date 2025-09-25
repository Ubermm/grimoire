//@ts-nocheck
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Eye, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { PLACEHOLDER_DICTIONARY } from '@/lib/ind/placeholder-dictionary';
import { EnhancedPDFFormFiller } from '@/lib/ind/pdf-form-filler';
import { toast } from 'sonner';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  PDFViewer
} from '@react-pdf/renderer';

interface DocumentPreviewProps {
  documentType: string;
  formData: Record<string, any>;
  submissionInfo?: {
    name: string;
    submissionType: string;
    createdAt: string;
  };
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

// FDA Form types that have official forms
const FDA_FORM_TYPES = ['FDA_1571', 'FDA_1572'] as const;

type DocumentType = typeof FDA_FORM_TYPES[number];

// Register fonts for PDF generation
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.woff2', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    borderBottom: 2,
    borderBottomColor: '#000',
    paddingBottom: 10,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: 1,
    borderColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    width: '40%',
    color: '#333',
  },
  fieldValue: {
    fontSize: 10,
    width: '60%',
    color: '#000',
    textAlign: 'left',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  checkboxSymbol: {
    fontSize: 12,
    marginRight: 5,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
    borderTop: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
});

// PDF Service for handling forms with placeholders
class PDFService {
  static async getFilledForm(documentType: string, formData: Record<string, any>): Promise<Blob> {
    try {
      // Use the new filled PDF API endpoint
      const response = await fetch('/api/fda-forms/filled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentType,
          formData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to generate filled form: ${response.statusText}`);
      }

      const filledPdfBlob = await response.blob();

      // Log success for debugging
      console.log('Successfully generated filled PDF for', documentType, 'with data:', Object.keys(formData));

      return filledPdfBlob;
    } catch (error) {
      console.log('Error getting filled form:', error);
      throw error;
    }
  }

  static validateFormData(documentType: string, formData: Record<string, any>) {
    // Basic validation - check if required fields exist
    const fields = PLACEHOLDER_DICTIONARY[documentType];
    if (!fields) {
      return { isValid: false, missingRequired: ['Document type not supported'] };
    }

    const requiredFields = Object.entries(fields)
      .filter(([_, config]) => config.required)
      .map(([fieldName, config]) => config.description);

    const missingRequired = requiredFields.filter(description => {
      const fieldName = Object.keys(fields).find(key => fields[key].description === description);
      return !fieldName || !formData[fieldName] || formData[fieldName] === '';
    });

    return {
      isValid: missingRequired.length === 0,
      missingRequired
    };
  }

  static getPlaceholderDocumentation(documentType: string) {
    const fields = PLACEHOLDER_DICTIONARY[documentType];
    if (!fields) return [];

    return Object.entries(fields).map(([fieldName, config]) => ({
      fieldName,
      description: config.description,
      required: config.required,
      fieldType: config.fieldType
    }));
  }
}

// Custom PDF Document Component (fallback for non-FDA forms)
const CustomINDDocument: React.FC<{ documentType: string; formData: Record<string, any>; submissionInfo?: any }> = ({
  documentType,
  formData
}) => {
  const fields = PLACEHOLDER_DICTIONARY[documentType];

  const getDocumentTitle = (docType: string) => {
    const titles = {
      'FDA_1571': 'FDA Form 1571 - INVESTIGATIONAL NEW DRUG APPLICATION (IND)',
      'FDA_1572': 'FDA Form 1572 - Statement of Investigator',
      'INVESTIGATIONAL_PLAN': 'Investigational Plan',
      'CMC_SUMMARY': 'Chemistry, Manufacturing, and Controls Summary'
    };
    return titles[docType as keyof typeof titles] || docType;
  };

  const groupFieldsBySection = () => {
    if (!fields) return {};

    const sections: { [key: string]: string[] } = {};

    Object.keys(fields).forEach(fieldName => {
      let sectionName = 'General Information';

      if (fieldName.includes('sponsor') || fieldName.includes('contact')) {
        sectionName = 'Sponsor Information';
      } else if (fieldName.includes('drug') || fieldName.includes('active') || fieldName.includes('dosage') || fieldName.includes('route') || fieldName.includes('pharmacological')) {
        sectionName = 'Drug Information';
      } else if (fieldName.includes('study') || fieldName.includes('protocol') || fieldName.includes('investigator') || fieldName.includes('principal')) {
        sectionName = 'Study Information';
      } else if (fieldName.includes('signature') || fieldName.includes('witness')) {
        sectionName = 'Signatures';
      }

      if (!sections[sectionName]) {
        sections[sectionName] = [];
      }
      sections[sectionName].push(fieldName);
    });

    return sections;
  };

  const renderField = (fieldName: string, field: any) => {
    const value = formData[fieldName] || '';

    if (field.fieldType === 'checkbox') {
      return (
        <View style={styles.checkbox} key={fieldName}>
          <Text style={styles.checkboxSymbol}>
            {value ? '☑' : '☐'}
          </Text>
          <Text style={styles.checkboxLabel}>{field.description}</Text>
        </View>
      );
    }

    return (
      <View style={styles.field} key={fieldName}>
        <Text style={styles.fieldLabel}>{field.description}:</Text>
        <Text style={styles.fieldValue}>
          {value || '[Not provided]'}
        </Text>
      </View>
    );
  };

  const sections = groupFieldsBySection();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>{getDocumentTitle(documentType)}</Text>

        {Object.entries(sections).map(([sectionName, sectionFields]) => (
          <View style={styles.section} key={sectionName} wrap={false}>
            <Text style={styles.sectionTitle}>{sectionName}</Text>
            {sectionFields.map(fieldName =>
              fields[fieldName] ? renderField(fieldName, fields[fieldName]) : null
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          Generated by Grimoire - FDA IND Submission System | {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default function DocumentPreview({ documentType, formData, submissionInfo, showPreview, setShowPreview }: DocumentPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOfficialFDAForm = FDA_FORM_TYPES.includes(documentType as DocumentType);

  // Validate form data
  const validation = PDFService.validateFormData(documentType, formData);

  // Clean up preview URL when component unmounts or when hiding preview
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const generatePDF = useCallback(async (type: 'official' | 'custom'): Promise<Blob> => {
    if (type === 'official' && isOfficialFDAForm) {
      return await PDFService.getFilledForm(documentType, formData);
    } else {
      // Generate custom PDF using react-pdf
      const pdfBlob = await pdf(
        <CustomINDDocument
          documentType={documentType}
          formData={formData}
          submissionInfo={submissionInfo}
        />
      ).toBlob();
      return pdfBlob;
    }
  }, [isOfficialFDAForm, documentType, formData, submissionInfo]);

  const handlePreview = async () => {
    if (showPreview) {
      setShowPreview(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfBlob = isOfficialFDAForm ?
        await generatePDF('official') :
        await generatePDF('custom');

      const url = URL.createObjectURL(pdfBlob);
      setPreviewUrl(url);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating preview:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate preview');
      toast.error('Failed to generate PDF preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let downloadUrl: string;
      let shouldRevoke = false;

      if (previewUrl) {
        downloadUrl = previewUrl;
      } else {
        const pdfBlob = isOfficialFDAForm
          ? await generatePDF('official')
          : await generatePDF('custom');
        downloadUrl = URL.createObjectURL(pdfBlob);
        shouldRevoke = true;
      }

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${documentType}_${submissionInfo?.name || 'Document'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (shouldRevoke) {
        URL.revokeObjectURL(downloadUrl);
      }

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to download PDF');
      toast.error('Failed to download PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const getDocumentTitle = () => {
    const titles = {
      'FDA_1571': 'FDA Form 1571 - INVESTIGATIONAL NEW DRUG APPLICATION (IND)',
      'FDA_1572': 'FDA Form 1572 - Statement of Investigator',
    };
    return titles[documentType as keyof typeof titles] || documentType;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {getDocumentTitle()}
          </CardTitle>
          {isOfficialFDAForm && (
            <p className="text-sm text-muted-foreground">
              Official FDA Form - Data will be populated into the official PDF template (original template is not modified)
            </p>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Form Validation Display */}
          {!validation.isValid && validation.missingRequired.length > 0 && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-orange-800">Missing Required Fields</h4>
                  <ul className="text-xs text-orange-700 mt-1 list-disc list-inside">
                    {validation.missingRequired.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {validation.isValid && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                <span className="text-green-800 text-sm font-medium">Form is ready for PDF generation</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handlePreview}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>

            <Button
              onClick={handleViewInNewTab}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
              View in New Tab
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>

            {isOfficialFDAForm && (
              <Button
                onClick={() => window.open(`/api/fda-forms?type=${encodeURIComponent(documentType)}`, '_blank')}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Blank Form
              </Button>
            )}
          </div>

          {!isOfficialFDAForm && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-800 text-sm">
                  This document type does not have an official FDA form. A custom PDF will be generated.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showPreview && previewUrl && (
        <Card>
          <CardHeader>
            <CardTitle>PDF Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
              <iframe
                src={previewUrl}
                className="w-full h-full"
                title="PDF Preview"
                style={{ border: 'none' }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
