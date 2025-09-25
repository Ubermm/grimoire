//@ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  FileX,
  Eye
} from 'lucide-react';

// UI Components (copying audit styling patterns)
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';

// IND Components
import { FDA1571Form } from './fda-1571-form';
import { FDA1572Form } from './fda-1572-form';
import { PDFViewer } from './pdf-viewer';

// Import types from database models
import type { INDDocument as DBINDDocument } from '@/lib/db/ind-models';

// Types
interface INDSubmission {
  _id: string;
  submissionName: string;
  status: 'draft' | 'in_progress' | 'ready' | 'submitted';
  submissionType: 'initial' | 'amendment' | 'annual_report';
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

// Component-specific document interface
interface ComponentINDDocument {
  _id: string;
  submissionId: string;
  documentType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  status: 'draft' | 'validating' | 'ready';
  formData: Record<string, any>;
  validationReport: {
    completionPercentage: number;
    structureValid: boolean;
    contentValid: boolean;
    errors: Array<{ field: string; message: string }>;
    warnings: Array<{ field: string; message: string }>;
  };
  originalPdfUrl: string;
  renderedPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const INDSubmissionManager: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const submissionId = searchParams.get('id');

  // State Management (similar to Audit component)
  const [submissions, setSubmissions] = useState<INDSubmission[]>([]);
  const [currentSubmission, setCurrentSubmission] = useState<INDSubmission | null>(null);
  const [documents, setDocuments] = useState<ComponentINDDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<ComponentINDDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [showExistingSubmissions, setShowExistingSubmissions] = useState(!submissionId);

  // Form states
  const [newSubmissionName, setNewSubmissionName] = useState('');
  const [submissionType, setSubmissionType] = useState<'initial' | 'amendment' | 'annual_report'>('initial');
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadSubmissions();

    if (submissionId) {
      loadSubmissionDetails(submissionId);
      setShowExistingSubmissions(false);
    }
  }, [submissionId]);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ind/submissions');

      if (!response.ok) {
        throw new Error('Failed to load submissions');
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load IND submissions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSubmissionDetails = async (id: string) => {
    try {
      setIsLoading(true);

      // Load submission details
      const submissionResponse = await fetch(`/api/ind/submissions?id=${id}`);
      if (!submissionResponse.ok) {
        throw new Error('Failed to load submission');
      }

      const submissionData = await submissionResponse.json();
      setCurrentSubmission(submissionData);

      // Load documents for this submission
      const documentsResponse = await fetch(`/api/ind/documents?submissionId=${id}`);
      if (!documentsResponse.ok) {
        throw new Error('Failed to load documents');
      }

      const documentsData = await documentsResponse.json();
      setDocuments(documentsData);
    } catch (error) {
      console.error('Error loading submission details:', error);
      toast.error('Failed to load submission details');
    } finally {
      setIsLoading(false);
    }
  };

  const createSubmission = async () => {
    if (!newSubmissionName.trim()) {
      toast.error('Please enter a submission name');
      return;
    }

    try {
      const response = await fetch('/api/ind/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionName: newSubmissionName.trim(),
          submissionType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create submission');
      }

      const newSubmission = await response.json();
      setSubmissions(prev => [newSubmission, ...prev]);
      setShowCreateDialog(false);
      setNewSubmissionName('');
      toast.success('IND submission created successfully');

      // Navigate to the new submission
      router.push(`/ind-creation?id=${newSubmission._id}`);
    } catch (error) {
      console.error('Error creating submission:', error);
      toast.error('Failed to create submission');
    }
  };

  const deleteSubmission = async () => {
    if (!submissionToDelete) return;

    try {
      const response = await fetch(`/api/ind/submissions?id=${submissionToDelete}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      setSubmissions(prev => prev.filter(s => s._id !== submissionToDelete));
      setShowDeleteDialog(false);
      setSubmissionToDelete(null);
      toast.success('Submission deleted successfully');

      // If we're viewing the deleted submission, go back to list
      if (currentSubmission?._id === submissionToDelete) {
        router.push('/ind-creation');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      toast.error('Failed to delete submission');
    }
  };

  const createDocument = async (documentType: string) => {
    if (!currentSubmission) return;

    try {
      // For demo purposes, use placeholder PDF URL
      const originalPdfUrl = `https://example.com/templates/${documentType}.pdf`;

      const response = await fetch('/api/ind/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: currentSubmission._id,
          documentType,
          originalPdfUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDocument = await response.json();
      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      toast.success(`${documentType} document created successfully`);
    } catch (error) {
      console.error('Error creating document:', error);
      toast.error('Failed to create document');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Ready</Badge>;
      case 'submitted':
        return <Badge variant="default" className="bg-blue-500">Submitted</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <FileX className="h-4 w-4 text-gray-500" />;
    }
  };

  // Loading state (similar to audit component)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="py-6">
            <div className="space-y-4">
              <div className="text-center font-medium">Loading IND submissions...</div>
              <Progress value={undefined} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show existing submissions list (similar to audit component)
  if (showExistingSubmissions) {
    return (
      <div className="container mx-auto p-6">
        <Card className="w-full max-w-6xl mx-auto min-h-[700px]">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>IND Submissions</CardTitle>
                <CardDescription>Create and manage FDA IND submissions</CardDescription>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New IND Submission
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-full">
              {submissions.length > 0 ? (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission._id} className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="space-y-2 flex-grow">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(submission.status)}
                              <h3 className="font-medium">{submission.submissionName}</h3>
                              {getStatusBadge(submission.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Type: {submission.submissionType.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(submission.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Documents: {submission.documentIds.length}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                setSubmissionToDelete(submission._id);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => router.push(`/ind-creation?id=${submission._id}`)}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium">No IND Submissions Yet</h3>
                    <p className="text-muted-foreground">Create your first IND submission to get started</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Create Submission Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New IND Submission</DialogTitle>
              <DialogDescription>
                Start a new FDA IND submission package
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submissionName">Submission Name</Label>
                <Input
                  id="submissionName"
                  placeholder="Enter submission name"
                  value={newSubmissionName}
                  onChange={(e) => setNewSubmissionName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submissionType">Submission Type</Label>
                <Select value={submissionType} onValueChange={(value: any) => setSubmissionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial IND</SelectItem>
                    <SelectItem value="amendment">Protocol Amendment</SelectItem>
                    <SelectItem value="annual_report">Annual Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={createSubmission}>
                Create Submission
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this IND submission? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteSubmission}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Main submission workspace (when viewing specific submission)
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <CardTitle>{currentSubmission?.submissionName}</CardTitle>
                {currentSubmission && getStatusBadge(currentSubmission.status)}
              </div>
              <CardDescription>
                {currentSubmission?.submissionType.replace('_', ' ')} submission • {documents.length} documents
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExistingSubmissions(true)}
              >
                View All Submissions
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => createDocument('FDA_1571')}
                  className="bg-white text-black"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  New FDA 1571
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createDocument('FDA_1572')}
                  className="bg-white text-black"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  New FDA 1572
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documents List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documents</h3>
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((document) => (
                    <Card
                      key={document._id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        selectedDocument?._id === document._id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.status)}
                          <div>
                            <div className="font-medium">{document.documentType.replace('_', ' ')}</div>
                            <div className="text-sm text-muted-foreground">
                              {document.validationReport.completionPercentage}% complete
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(document.status)}
                          {document.renderedPdfUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPDFViewer(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <Progress value={document.validationReport.completionPercentage} className="mt-2" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No documents created yet. Click "New FDA 1571" or "New FDA 1572" to get started.
                </div>
              )}
            </div>

            {/* Document Form */}
            <div className="space-y-4">
              {selectedDocument ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {selectedDocument.documentType.replace('_', ' ')} Form
                  </h3>
                  {selectedDocument.documentType === 'FDA_1571' && (
                    <FDA1571Form
                      document={selectedDocument}
                      onUpdate={(updatedDocument) => {
                        setDocuments(prev =>
                          prev.map(doc => doc._id === updatedDocument._id ? updatedDocument : doc)
                        );
                        setSelectedDocument(updatedDocument);
                      }}
                    />
                  )}
                  {selectedDocument.documentType === 'FDA_1572' && (
                    <FDA1572Form
                      document={selectedDocument}
                      onUpdate={(updatedDocument) => {
                        setDocuments(prev =>
                          prev.map(doc => doc._id === updatedDocument._id ? updatedDocument : doc)
                        );
                        setSelectedDocument(updatedDocument);
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a document from the left to begin editing
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF Viewer Dialog */}
      {selectedDocument && (
        <PDFViewer
          isOpen={showPDFViewer}
          onClose={() => setShowPDFViewer(false)}
          document={selectedDocument}
        />
      )}
    </div>
  );
};

export default INDSubmissionManager;