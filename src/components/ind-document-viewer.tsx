//@ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
  pdf
} from '@react-pdf/renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Eye, Loader2 } from 'lucide-react';
import { PLACEHOLDER_DICTIONARY } from '@/lib/ind/placeholder-dictionary';

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
  signatures: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureBlock: {
    width: '40%',
    textAlign: 'center',
  },
  signatureLine: {
    borderBottom: 1,
    borderBottomColor: '#000',
    marginBottom: 5,
    height: 30,
  },
  signatureText: {
    fontSize: 10,
    marginTop: 5,
  },
});

interface INDDocumentPDFProps {
  documentType: string;
  formData: Record<string, any>;
  submissionInfo?: {
    name: string;
    submissionType: string;
    createdAt: string;
  };
}

// PDF Document Component
const INDDocumentPDF: React.FC<INDDocumentPDFProps> = ({ documentType, formData, submissionInfo }) => {
  const fields = PLACEHOLDER_DICTIONARY[documentType];

  const getDocumentTitle = (docType: string) => {
    const titles = {
      'FDA_1571': 'FDA Form 1571 - INVESTIGATIONAL NEW DRUG APPLICATION (IND)',
      'FDA_1572': 'FDA Form 1572 - Statement of Investigator',
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

        {submissionInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Submission Information</Text>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Submission Name:</Text>
              <Text style={styles.fieldValue}>{submissionInfo.name}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Submission Type:</Text>
              <Text style={styles.fieldValue}>{submissionInfo.submissionType}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Generated Date:</Text>
              <Text style={styles.fieldValue}>{new Date().toLocaleDateString()}</Text>
            </View>
          </View>
        )}

        {Object.entries(sections).map(([sectionName, sectionFields]) => (
          <View style={styles.section} key={sectionName} wrap={false}>
            <Text style={styles.sectionTitle}>{sectionName}</Text>
            {sectionFields.map(fieldName =>
              fields[fieldName] ? renderField(fieldName, fields[fieldName]) : null
            )}
          </View>
        ))}

        {documentType.includes('157') && (
          <View style={styles.signatures}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Signature</Text>
              <Text style={styles.signatureText}>Date: _______________</Text>
            </View>
            {documentType === 'FDA_1572' && (
              <View style={styles.signatureBlock}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Witness Signature</Text>
                <Text style={styles.signatureText}>Date: _______________</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          Generated by Grimoire - FDA IND Submission System | {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

// Main Viewer Component
interface INDDocumentViewerProps {
  documentType: string;
  formData: Record<string, any>;
  submissionInfo?: {
    name: string;
    submissionType: string;
    createdAt: string;
  };
}

export default function INDDocumentViewer({ documentType, formData, submissionInfo }: INDDocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generatePDF = async () => {
    setIsLoading(true);
    try {
      const blob = await pdf(
        <INDDocumentPDF
          documentType={documentType}
          formData={formData}
          submissionInfo={submissionInfo}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${documentType}_${submissionInfo?.name || 'Document'}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPDFInNewTab = async () => {
    setIsLoading(true);
    try {
      const blob = await pdf(
        <INDDocumentPDF
          documentType={documentType}
          formData={formData}
          submissionInfo={submissionInfo}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening PDF:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {documentType.replace('_', ' ')} Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </Button>

            <Button
              onClick={openPDFInNewTab}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              View PDF
            </Button>

            <Button
              onClick={generatePDF}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
          <PDFViewer className="w-full h-full">
            <INDDocumentPDF
              documentType={documentType}
              formData={formData}
              submissionInfo={submissionInfo}
            />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}
