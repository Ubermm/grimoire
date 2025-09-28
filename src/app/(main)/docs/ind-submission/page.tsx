//@ts-nocheck
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Bot, Eye, CheckCircle2, Upload, FormInput } from "lucide-react";
import Image from 'next/image';

const Section = ({ title, children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    {children}
  </div>
);

const INDSubmissionPage = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-4">IND Submission System</h1>
            <p className="text-xl text-gray-400">
              Streamlined FDA form preparation with AI-powered automation
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Overview Card */}
            <Card className="bg-black border border-white/10">
              <CardContent className="p-6 space-y-6 text-white/80">
                <Section title="System Overview">
                  <p className="text-gray-300">
                    Our IND submission system simplifies the complex process of preparing FDA forms 1571 and 1572 for Investigational New Drug applications. Through intelligent form handling, AI-powered autofill, and comprehensive preview capabilities, we streamline the entire submission workflow.
                  </p>
                  
                  <Alert className="bg-blue-500/10 border-blue-500/20 mt-4">
                    <Info className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-white/80">
                      The system provides an intuitive interface for form completion, leverages AI to intelligently populate fields, and generates submission-ready documents that meet FDA requirements.
                    </AlertDescription>
                  </Alert>

                </Section>

                {/* Submission Process */}
                <Section title="Submission Process">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <FormInput className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">1. Form Selection</h4>
                      </div>
                      <p className="text-sm text-gray-400">Choose FDA 1571 or 1572 forms for completion</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">2. AI Autofill</h4>
                      </div>
                      <p className="text-sm text-gray-400">Intelligent field population based on context and data</p>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">3. Preview & Submit</h4>
                      </div>
                      <p className="text-sm text-gray-400">Review submission-ready documents before filing</p>
                    </div>
                  </div>
                </Section>

                {/* Key Features */}
                <Section title="Key Features">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Intuitive Form Interface</h4>
                      <ul className="list-disc pl-6 text-gray-400 space-y-1">
                        <li>Clean, user-friendly form layouts</li>
                        <li>Field validation and error checking</li>
                        <li>Progressive form completion</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-white font-medium">AI-Powered Automation</h4>
                      <ul className="list-disc pl-6 text-gray-400 space-y-1">
                        <li>Intelligent field population</li>
                        <li>Context-aware suggestions</li>
                        <li>Data consistency verification</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Document Management</h4>
                      <ul className="list-disc pl-6 text-gray-400 space-y-1">
                        <li>Real-time document preview</li>
                        <li>PDF generation for submission</li>
                        <li>Version control and tracking</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white font-medium">Compliance Assurance</h4>
                      <ul className="list-disc pl-6 text-gray-400 space-y-1">
                        <li>FDA format compliance</li>
                        <li>Required field verification</li>
                        <li>Submission readiness checks</li>
                      </ul>
                    </div>
                  </div>
                </Section>

                {/* Supported Forms */}
                <Section title="Supported FDA Forms">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">FDA Form 1571</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Investigational New Drug Application
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Sponsor information</li>
                        <li>• Drug product details</li>
                        <li>• Manufacturing information</li>
                        <li>• Clinical protocol summary</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <h4 className="font-medium text-white">FDA Form 1572</h4>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Statement of Investigator
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Investigator qualifications</li>
                        <li>• Site information</li>
                        <li>• Protocol commitments</li>
                        <li>• Regulatory compliance</li>
                      </ul>
                    </div>
                  </div>
                </Section>

                {/* Usage Guide */}
                <Section title="Using the System">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/10 w-6 h-6 flex items-center justify-center text-sm text-blue-400 mt-1">1</div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Select Form Type</h4>
                        <p className="text-gray-400">Choose between FDA Form 1571 or 1572 based on your submission needs</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/10 w-6 h-6 flex items-center justify-center text-sm text-blue-400 mt-1">2</div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Complete Form Fields</h4>
                        <p className="text-gray-400">Fill out required fields manually or use AI autofill to populate sections intelligently</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/10 w-6 h-6 flex items-center justify-center text-sm text-blue-400 mt-1">3</div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Review and Preview</h4>
                        <p className="text-gray-400">Use the preview function to review your submission-ready document</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-4">
                      <div className="rounded-full bg-blue-500/10 w-6 h-6 flex items-center justify-center text-sm text-blue-400 mt-1">4</div>
                      <div>
                        <h4 className="text-white font-medium mb-1">Generate Final Documents</h4>
                        <p className="text-gray-400">Export completed forms as submission-ready PDFs for FDA filing</p>
                      </div>
                    </li>
                  </ol>
                </Section>

                {/* AI Autofill Guide */}
                <Section title="AI Autofill Features">
                  <div className="bg-blue-500/5 p-4 rounded-lg border border-blue-500/20">
                    <h4 className="text-white font-medium mb-3">How AI Autofill Works</h4>
                    <ul className="list-disc pl-6 text-gray-400 space-y-2">
                      <li>Analyzes existing form data and context to suggest appropriate field values</li>
                      <li>Learns from previous submissions to improve accuracy over time</li>
                      <li>Maintains data consistency across related fields and sections</li>
                      <li>Provides intelligent suggestions while allowing manual override</li>
                      <li>Validates populated data against FDA requirements and formats</li>
                    </ul>
                  </div>
                </Section>

                {/* Best Practices */}
                <Section title="Best Practices">
                  <ul className="list-disc pl-6 text-gray-400 space-y-2">
                    <li>Always review AI-populated fields for accuracy and completeness</li>
                    <li>Use the preview feature to verify document formatting before submission</li>
                    <li>Save your progress regularly during form completion</li>
                    <li>Maintain consistent data formats across all form fields</li>
                    <li>Keep supporting documentation organized for easy reference</li>
                    <li>Verify all required fields are completed before generating final documents</li>
                  </ul>
                </Section>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default INDSubmissionPage;