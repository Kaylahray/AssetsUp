# Policy Documents Module

A comprehensive module for managing company-wide asset usage policies and guidelines with PDF document upload, version control, and public access capabilities.

## Features

- **Document Upload**: Secure PDF file upload with validation and storage
- **Version Control**: Complete version history and latest version tracking
- **Document Management**: Create, update, and archive policy documents
- **Public Access**: Expose documents for public viewing without authentication
- **Document Preview**: In-browser PDF preview functionality
- **Advanced Filtering**: Search and filter documents by various criteria
- **Statistics**: Comprehensive document usage analytics
- **Role-based Access**: Secure access control with different permission levels
- **Approval Workflow**: Document approval and status management

## Entity Structure

### PolicyDocument Entity

The core entity includes the following key fields:

- **Basic Information**: title, description, version
- **Document Type**: asset_usage, security, maintenance, procurement, disposal, general
- **Status Management**: draft, active, archived, expired
- **File Information**: filePath, fileName, fileType, fileSize, originalFileName
- **Author Information**: author relationship with User entity
- **Dates**: effectiveDate, expiryDate, approvedDate
- **Content**: summary, keyPoints, complianceNotes
- **Metadata**: department, category, tags
- **Access Control**: requiresAcknowledgment, isPublic
- **Usage Tracking**: downloadCount, viewCount
- **Version Control**: previousVersionId, isLatestVersion, changeLog

## API Endpoints

### Document Management

- `POST /policy-documents` - Create a new policy document
- `POST /policy-documents/upload` - Upload PDF document with metadata
- `GET /policy-documents` - List documents with filtering and pagination
- `GET /policy-documents/:id` - Get document by ID
- `PATCH /policy-documents/:id` - Update document information
- `DELETE /policy-documents/:id` - Remove document

### Document Access

- `GET /policy-documents/public` - Get all public documents (no auth required)
- `GET /policy-documents/active` - Get all active documents
- `GET /policy-documents/:id/download` - Download document file
- `GET /policy-documents/:id/preview` - Preview document (public endpoint)

### Version Management

- `GET /policy-documents/latest/:title` - Get latest version of document
- `GET /policy-documents/title/:title/version/:version` - Get specific version
- `GET /policy-documents/version-history/:title` - Get version history

### Document Organization

- `GET /policy-documents/by-type/:documentType` - Get documents by type
- `GET /policy-documents/by-author/:authorId` - Get documents by author
- `GET /policy-documents/by-department/:department` - Get documents by department

### Status Management

- `PATCH /policy-documents/:id/status` - Update document status
- `PATCH /policy-documents/:id/approve` - Approve document
- `PATCH /policy-documents/:id/archive` - Archive document

### Reporting & Analytics

- `GET /policy-documents/statistics` - Get document statistics
- `GET /policy-documents/expiring` - Get documents expiring soon

## Query Parameters

The main listing endpoint supports extensive filtering:

- `search` - Search in title, description, summary, keyPoints
- `status` - Filter by document status
- `documentType` - Filter by document type
- `authorId` - Filter by author
- `department` - Filter by department
- `category` - Filter by category
- `tags` - Filter by tags
- `requiresAcknowledgment` - Filter by acknowledgment requirement
- `isPublic` - Filter by public status
- `isLatestVersion` - Filter by latest version
- `effectiveDateBefore/After` - Filter by effective date range
- `expiryDateBefore/After` - Filter by expiry date range
- `page` - Page number for pagination
- `limit` - Items per page
- `sortBy` - Sort field
- `sortOrder` - Sort direction (ASC/DESC)

## File Upload

### Upload Endpoint

The module provides a dedicated upload endpoint for PDF documents:

```typescript
POST /policy-documents/upload
Content-Type: multipart/form-data

Form Data:
- file: PDF file (required)
- title: Document title (required)
- version: Document version (required)
- description: Document description (optional)
- documentType: Document type (optional)
- effectiveDate: Effective date (optional)
- expiryDate: Expiry date (optional)
- summary: Document summary (optional)
- keyPoints: Key points (optional)
- department: Department (optional)
- category: Category (optional)
- tags: Tags (optional)
- requiresAcknowledgment: Boolean (optional)
- isPublic: Boolean (optional)
```

### File Validation

- **File Type**: Only PDF files are allowed
- **File Size**: Maximum 10MB per file
- **Storage**: Files are stored in `./uploads/policy-documents/`
- **Naming**: Unique filenames with timestamps to prevent conflicts

## Public Access

### Document Preview

The module provides a public endpoint for document preview:

```
GET /policy-documents/:id/preview
```

This endpoint:
- Requires no authentication
- Serves PDF files inline for browser preview
- Increments view count for analytics
- Handles errors gracefully

### Public Documents

Documents marked as `isPublic: true` can be accessed without authentication:

```
GET /policy-documents/public
```

## Usage Examples

### Upload a New Policy Document

```typescript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('title', 'Asset Usage Policy');
formData.append('version', '1.0');
formData.append('description', 'Comprehensive asset usage guidelines');
formData.append('documentType', 'asset_usage');
formData.append('effectiveDate', '2024-01-01');
formData.append('expiryDate', '2025-01-01');
formData.append('summary', 'Key asset usage guidelines for employees');
formData.append('keyPoints', '1. Proper asset handling\n2. Security protocols\n3. Maintenance requirements');
formData.append('department', 'IT');
formData.append('category', 'Security');
formData.append('tags', 'asset,security,guidelines');
formData.append('requiresAcknowledgment', 'true');
formData.append('isPublic', 'true');
```

### Create Document Programmatically

```typescript
const newDocument = {
  title: "Asset Usage Policy",
  version: "1.0",
  filePath: "policy-123.pdf",
  fileName: "policy-123.pdf",
  fileType: "application/pdf",
  fileSize: 1024000,
  authorId: "user-uuid",
  documentType: "asset_usage",
  status: "draft",
  effectiveDate: "2024-01-01",
  expiryDate: "2025-01-01",
  summary: "Key asset usage guidelines",
  keyPoints: "1. Proper handling\n2. Security protocols",
  department: "IT",
  category: "Security",
  tags: "asset,security,guidelines",
  requiresAcknowledgment: true,
  isPublic: true
};
```

### Update Document Status

```typescript
const statusUpdate = {
  status: "active",
  approvedBy: "admin"
};
```

## Security & Permissions

The module implements role-based access control:

- **Admin**: Full access to all operations including upload, update, delete
- **Manager**: Can view, download, and manage documents
- **Employee**: Can view and download assigned documents
- **Public**: Access to public documents without authentication

## File Storage

### Directory Structure

```
uploads/
└── policy-documents/
    ├── file-1234567890-123456789.pdf
    ├── file-1234567891-123456790.pdf
    └── ...
```

### File Management

- **Automatic Cleanup**: Files are deleted when documents are removed
- **Unique Naming**: Prevents filename conflicts
- **Size Limits**: 10MB maximum file size
- **Type Validation**: Only PDF files accepted

## Database Schema

The module creates a `policy_documents` table with:

- Unique indexes on title and version combination
- Foreign key relationship to users table for authors
- Comprehensive audit fields (created_at, updated_at)
- Enum fields for status and document type
- Full-text search capabilities

## Testing

The module includes comprehensive test coverage:

- **Unit Tests**: Service method testing with mocked repository
- **E2E Tests**: Complete API endpoint testing
- **Integration Tests**: Database integration testing

## Dependencies

- TypeORM for database operations
- Multer for file upload handling
- Class-validator for DTO validation
- Class-transformer for data transformation
- NestJS guards for authentication and authorization

## Future Enhancements

- Document conversion (PDF to HTML for better preview)
- Document signing and digital signatures
- Automated document expiration notifications
- Bulk document import/export
- Document templates and standardization
- Integration with document management systems
- Advanced search with full-text indexing
- Document collaboration and commenting 