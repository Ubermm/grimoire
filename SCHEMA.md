# IND Creation System - Implementation Schema

## Overview

The IND (Investigational New Drug) Creation System is a standalone feature that generates FDA-compliant IND submissions by directly manipulating official FDA PDF forms with placeholder substitution. The system operates independently from the chat system with its own routes, models, and blob storage integration.

## Core Architecture

### 1. Independent System Design
- **Separate from Chat**: Complete separation from chat routes and models
- **Own API Routes**: Dedicated `/api/ind/*` routes
- **Independent Models**: Separate mongoose collections for IND data
- **Blob Storage**: Direct PDF storage and manipulation in Azure Blob
- **Model**: Use `claude-3-haiku-20240307` for all IND operations

### 2. PDF-First Approach
- **Official FDA Forms**: Work directly with FDA PDF templates (not text templates)
- **Placeholder Dictionary**: Field mappings for PDF form substitution
- **Blob Management**: Upload, edit, and version official PDF forms
- **Rendering**: Leverage existing audit component PDF rendering logic

## Data Structure

### 1. IND Models (Independent Collection)

```typescript
// New independent collection: `ind_submissions`
interface INDSubmission {
  _id: string;
  userId: string;
  submissionName: string;
  status: 'draft' | 'in_progress' | 'ready' | 'submitted';
  submissionType: 'initial' | 'amendment' | 'annual_report';

  // Document tracking
  documents: INDDocument[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

interface INDDocument {
  _id: string;
  documentType: 'FDA_1571' | 'FDA_1572' | 'INVESTIGATIONAL_PLAN' | 'CMC_SUMMARY';
  status: 'draft' | 'validating' | 'ready';

  // PDF Management
  originalPdfUrl: string;        // Blob URL to original FDA PDF
  editedPdfUrl?: string;         // Blob URL to PDF with placeholders
  renderedPdfUrl?: string;       // Blob URL to final PDF with data

  // Data and validation
  formData: Record<string, any>;
  placeholderMapping: Record<string, string>; // field -> PDF placeholder mapping
  validationReport: ValidationReport;

  createdAt: Date;
  updatedAt: Date;
}

interface ValidationReport {
  structureValid: boolean;
  contentValid: boolean;
  regulatoryCompliant: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completionPercentage: number;
}
```

### 2. Placeholder Dictionary Structure

```typescript
// Dictionary stored in database or config file
interface PlaceholderDictionary {
  [documentType: string]: {
    [formField: string]: {
      pdfPlaceholder: string;      // What you'll manually insert in PDF
      fieldType: 'text' | 'checkbox' | 'date' | 'number';
      required: boolean;
      validation?: string;         // Regex or validation rule
      description: string;         // Human-readable description
    }
  }
}

// Example structure:
const PLACEHOLDER_DICTIONARY: PlaceholderDictionary = {
  'FDA_1571': {
    'sponsorName': {
      pdfPlaceholder: '{{SPONSOR_NAME}}',
      fieldType: 'text',
      required: true,
      description: 'Sponsor organization name'
    },
    'contactPerson': {
      pdfPlaceholder: '{{CONTACT_PERSON}}',
      fieldType: 'text',
      required: true,
      description: 'Primary contact person name'
    },
    'initialIND': {
      pdfPlaceholder: '{{CHECKBOX_INITIAL_IND}}',
      fieldType: 'checkbox',
      required: false,
      description: 'Initial IND submission checkbox'
    },
    // ... more field mappings
  },
  'FDA_1572': {
    // FDA 1572 specific mappings
  }
}
```

## Implementation Plan

### Phase 1: Database & Models Setup

#### 1.1 Create Independent Models
**File**: `/src/lib/db/ind-models.ts`
```typescript
// Completely separate from existing models.ts
// Use separate collection names: ind_submissions, ind_documents
// No references to chat collections
```

#### 1.2 Database Queries
**File**: `/src/lib/db/ind-queries.ts`
```typescript
// CRUD operations for IND submissions
// Validation helpers
// Status management functions
```

#### 1.3 Placeholder Dictionary
**File**: `/src/lib/ind/placeholder-dictionary.ts`
```typescript
// Central dictionary for all FDA form mappings
// Field validation rules
// Type definitions for form data
```

### Phase 2: API Routes (Independent)

#### 2.1 Main IND Routes
**Directory**: `/src/app/api/ind/`

- **`/api/ind/submissions`** - CRUD for IND submissions
- **`/api/ind/documents`** - Document management
- **`/api/ind/validate`** - Form validation
- **`/api/ind/generate-pdf`** - PDF generation with data substitution
- **`/api/ind/upload-template`** - Upload official FDA PDFs

#### 2.2 Route Structure
```typescript
// /src/app/api/ind/submissions/route.ts
GET    /api/ind/submissions        // List user's submissions
POST   /api/ind/submissions        // Create new submission
PATCH  /api/ind/submissions/[id]   // Update submission
DELETE /api/ind/submissions/[id]   // Delete submission

// /src/app/api/ind/documents/route.ts
GET    /api/ind/documents/[id]     // Get document
POST   /api/ind/documents          // Create document
PATCH  /api/ind/documents/[id]     // Update document
DELETE /api/ind/documents/[id]     // Delete document

// /src/app/api/ind/generate-pdf/route.ts
POST   /api/ind/generate-pdf       // Generate filled PDF
```

### Phase 3: PDF Management System

#### 3.1 Blob Storage Integration
**File**: `/src/lib/ind/pdf-manager.ts`
```typescript
class INDPdfManager {
  // Upload official FDA PDF templates
  async uploadTemplate(file: File, documentType: string): Promise<string>

  // Create editable version with placeholders
  async createEditableTemplate(templateUrl: string): Promise<string>

  // Substitute data into PDF placeholders
  async generateFilledPDF(templateUrl: string, data: Record<string, any>): Promise<string>

  // Version management
  async createVersion(documentId: string): Promise<string>
}
```

#### 3.2 PDF Processing
- Use libraries like `pdf-lib` or `PDFtk` for PDF manipulation
- Maintain original, editable, and filled versions
- Support for form field detection and substitution

### Phase 4: Form Components (Styled like Audit)

#### 4.1 Form Styling
**Reference**: Copy styling patterns from `/src/components/Audit.tsx`
- Card-based layout with sections
- Badge indicators for required fields
- Input validation styling (red borders for errors)
- Progress indicators
- Form field grouping

#### 4.2 Component Structure
**Directory**: `/src/components/ind/`

```typescript
// /src/components/ind/ind-submission-manager.tsx
// Main component - similar structure to Audit.tsx

// /src/components/ind/fda-1571-form.tsx
// Form component using audit styling patterns

// /src/components/ind/pdf-viewer.tsx
// PDF rendering using audit report logic

// /src/components/ind/validation-panel.tsx
// Validation display using audit validation styling
```

#### 4.3 Styled Components
```tsx
// Use existing audit styling patterns:
<Card className="w-full max-w-6xl mx-auto min-h-[700px]">
  <CardHeader>
    <CardTitle>IND Document Creation</CardTitle>
    <CardDescription>Create FDA-compliant IND submissions</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Form sections with Badge indicators */}
    <Label htmlFor="field">
      Field Name <Badge variant="destructive" className="text-xs ml-1">Required</Badge>
    </Label>
    <Input
      className={errors.field ? 'border-red-500' : ''}
      // ...
    />
  </CardContent>
</Card>
```

### Phase 5: PDF Rendering Integration

#### 5.1 Audit Component Analysis
**Reference Files**:
- `/src/components/Audit.tsx` - Main component structure
- `/src/components/AuditReport.tsx` - PDF report generation
- Look for PDF generation/viewing logic

#### 5.2 PDF Viewer Component
```tsx
// /src/components/ind/pdf-viewer.tsx
// Borrow PDF rendering logic from audit components
// Display filled PDF forms
// Print/download functionality
```

### Phase 6: Frontend Pages

#### 6.1 Main IND Page
**File**: `/src/app/(main)/ind-creation/page.tsx`
```tsx
// Independent page - not under (chat) routes
// Lists existing submissions
// Create new submission functionality
// Document management interface
```

#### 6.2 Page Structure
```tsx
// Similar to audit page layout
return (
  <div className="container mx-auto p-6">
    <Card>
      <CardHeader>
        <CardTitle>IND Submissions</CardTitle>
        <div className="flex space-x-4">
          <Button onClick={() => createNew('FDA_1571')}>
            New FDA 1571
          </Button>
          <Button onClick={() => createNew('FDA_1572')}>
            New FDA 1572
          </Button>
          // ...
        </div>
      </CardHeader>
      <CardContent>
        {/* Submission list with status indicators */}
      </CardContent>
    </Card>
  </div>
);
```

## File Structure Summary

```
src/
├── app/
│   ├── api/
│   │   └── ind/                    # Independent API routes
│   │       ├── submissions/
│   │       ├── documents/
│   │       ├── validate/
│   │       ├── generate-pdf/
│   │       └── upload-template/
│   └── (main)/
│       └── ind-creation/           # Main IND page (NOT under chat)
│           └── page.tsx
├── components/
│   └── ind/                        # IND-specific components
│       ├── ind-submission-manager.tsx
│       ├── fda-1571-form.tsx
│       ├── fda-1572-form.tsx
│       ├── pdf-viewer.tsx
│       └── validation-panel.tsx
└── lib/
    ├── db/
    │   ├── ind-models.ts          # Independent models
    │   └── ind-queries.ts         # IND database operations
    └── ind/                       # IND-specific utilities
        ├── placeholder-dictionary.ts
        ├── pdf-manager.ts
        ├── validation.ts
        └── form-utils.ts
```

## Development Steps

### Step 1: Prepare FDA PDFs
1. **You manually add placeholders** to official FDA PDF forms
2. Upload to blob storage as templates
3. Create placeholder dictionary mapping

### Step 2: Database Setup
1. Create independent IND models (separate collections)
2. Implement IND-specific queries
3. Set up placeholder dictionary

### Step 3: API Routes
1. Build independent API routes under `/api/ind/`
2. Implement CRUD operations
3. Add PDF generation endpoints

### Step 4: Components
1. Copy styling patterns from audit components
2. Build IND form components with audit styling
3. Implement PDF viewer using audit PDF logic

### Step 5: Integration & Testing
1. Test PDF manipulation workflow
2. Validate placeholder substitution
3. Test end-to-end submission process

## Key Technical Notes

1. **Model ID**: Use `claude-3-haiku-20240307` for all IND operations
2. **Styling**: Copy exact patterns from audit components (Card layout, badges, validation styling)
3. **PDF Processing**: Direct manipulation of official FDA PDFs only
4. **Independence**: Complete separation from chat system
5. **Blob Storage**: Manage PDF versions (original, editable, filled)
6. **Dictionary**: Central mapping system you'll populate with manual placeholders

This approach gives you a production-ready, independent IND system that works directly with official FDA forms while maintaining the proven UI/UX patterns from your audit feature.