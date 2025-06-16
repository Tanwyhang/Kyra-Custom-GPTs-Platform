# AI Model Hub API Documentation

## Overview

The AI Model Hub provides a comprehensive backend system for publishing, validating, and distributing AI models. The system includes database schema, API endpoints, validation workflows, and download management.

## Database Schema

### Core Tables

#### `published_models`
Main table for storing published AI models with metadata and configuration.

**Columns:**
- `id` (uuid, PK) - Unique model identifier
- `name` (varchar) - Model name (3-100 characters)
- `version` (varchar) - Semantic version (e.g., "1.0.0")
- `description` (text) - Detailed model description
- `category` (varchar) - Model category/type
- `tags` (text[]) - Array of searchable tags
- `license_type` (varchar) - License type (MIT, GPL, Commercial, etc.)
- `license_text` (text) - Full license text
- `documentation_url` (text) - Link to documentation
- `repository_url` (text) - Source code repository
- `system_prompt` (text) - Core AI prompt/context
- `default_temperature` (numeric) - Default temperature (0-1)
- `default_top_p` (numeric) - Default top-p value (0-1)
- `default_max_tokens` (integer) - Default max tokens (1-4096)
- `knowledge_context` (text) - Additional knowledge context
- `knowledge_files` (jsonb) - Metadata for uploaded files
- `validation_status` (varchar) - pending, validating, approved, rejected, needs_revision
- `validation_notes` (text) - Validation feedback
- `accuracy_score` (numeric) - Performance accuracy (0-100)
- `response_time_ms` (integer) - Average response time
- `token_efficiency` (numeric) - Token usage efficiency
- `publisher_name` (varchar) - Publisher name
- `publisher_email` (varchar) - Publisher contact
- `is_public` (boolean) - Public visibility
- `is_featured` (boolean) - Featured status
- `download_count` (integer) - Total downloads
- `rating_average` (numeric) - Average user rating (0-5)
- `rating_count` (integer) - Number of ratings
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Last update timestamp
- `published_at` (timestamptz) - Publication timestamp

#### `model_versions`
Version control for published models.

**Columns:**
- `id` (uuid, PK) - Version identifier
- `model_id` (uuid, FK) - Reference to published_models
- `version` (varchar) - Version string
- `changelog` (text) - Version changes
- `is_current` (boolean) - Current version flag
- `system_prompt` (text) - Version-specific prompt
- `default_config` (jsonb) - Version-specific configuration
- `validation_status` (varchar) - Validation status for this version
- `validation_results` (jsonb) - Validation results
- `created_at` (timestamptz) - Creation timestamp

#### `model_validations`
Validation results and test data.

**Columns:**
- `id` (uuid, PK) - Validation identifier
- `model_id` (uuid, FK) - Reference to published_models
- `version_id` (uuid, FK) - Reference to model_versions
- `validation_type` (varchar) - automated, manual, performance, safety
- `status` (varchar) - pending, running, passed, failed, skipped
- `test_cases_total` (integer) - Total test cases
- `test_cases_passed` (integer) - Passed test cases
- `test_cases_failed` (integer) - Failed test cases
- `avg_response_time_ms` (numeric) - Average response time
- `accuracy_score` (numeric) - Accuracy score (0-100)
- `consistency_score` (numeric) - Consistency score (0-100)
- `safety_score` (numeric) - Safety score (0-100)
- `results` (jsonb) - Detailed results
- `error_details` (text) - Error information
- `recommendations` (text) - Improvement recommendations
- `validator_name` (varchar) - Validator identifier
- `validation_started_at` (timestamptz) - Start timestamp
- `validation_completed_at` (timestamptz) - Completion timestamp
- `created_at` (timestamptz) - Creation timestamp

#### `model_samples`
Sample inputs, outputs, and test cases.

**Columns:**
- `id` (uuid, PK) - Sample identifier
- `model_id` (uuid, FK) - Reference to published_models
- `sample_type` (varchar) - input_output, prompt_template, use_case
- `title` (varchar) - Sample title
- `description` (text) - Sample description
- `input_data` (jsonb) - Input data/prompt
- `expected_output` (jsonb) - Expected response
- `actual_output` (jsonb) - Actual response (if tested)
- `config_used` (jsonb) - Configuration used for sample
- `is_validated` (boolean) - Validation status
- `validation_score` (numeric) - Sample validation score
- `tags` (text[]) - Sample tags
- `difficulty_level` (varchar) - easy, medium, hard
- `execution_time_ms` (integer) - Execution time
- `created_at` (timestamptz) - Creation timestamp
- `updated_at` (timestamptz) - Update timestamp

#### `model_download_logs`
Download tracking and analytics.

**Columns:**
- `id` (uuid, PK) - Download log identifier
- `model_id` (uuid, FK) - Reference to published_models
- `download_type` (varchar) - full_model, config_only, samples_only
- `user_agent` (text) - Browser/client information
- `ip_address` (inet) - Client IP address
- `country_code` (varchar) - Geographic location
- `intended_use` (varchar) - Intended use case
- `user_feedback` (text) - User feedback
- `downloaded_at` (timestamptz) - Download timestamp

#### `model_ratings`
User ratings and reviews.

**Columns:**
- `id` (uuid, PK) - Rating identifier
- `model_id` (uuid, FK) - Reference to published_models
- `rating` (integer) - Rating value (1-5)
- `review_text` (text) - Review content
- `reviewer_hash` (varchar) - Anonymous reviewer identifier
- `use_case` (varchar) - Reviewer's use case
- `helpful_votes` (integer) - Helpful vote count
- `total_votes` (integer) - Total vote count
- `created_at` (timestamptz) - Creation timestamp

## API Endpoints

### Model Submission

#### `POST /functions/v1/model-submission`

Submit a new model for publication.

**Request Body:**
```json
{
  "name": "string (3-100 chars, required)",
  "version": "string (semantic version, optional, default: 1.0.0)",
  "description": "string (50+ chars, required)",
  "category": "string (required)",
  "tags": ["string"] (optional, max 10),
  "licenseType": "string (required)",
  "licenseText": "string (optional)",
  "documentationUrl": "string (optional)",
  "repositoryUrl": "string (optional)",
  "systemPrompt": "string (20+ chars, required)",
  "defaultConfig": {
    "temperature": "number (0-1, required)",
    "topP": "number (0-1, required)",
    "maxTokens": "number (1-4096, required)"
  },
  "knowledgeContext": "string (optional, max 50000 chars)",
  "knowledgeFiles": [
    {
      "name": "string",
      "size": "number",
      "type": "string"
    }
  ] (optional, max 10 files),
  "samplePrompts": ["string"] (optional, max 3),
  "publisherName": "string (optional)",
  "publisherEmail": "string (optional)",
  "isPublic": "boolean (required)"
}
```

**Response:**
```json
{
  "success": true,
  "model": {
    "id": "uuid",
    "name": "string",
    "version": "string",
    "status": "string"
  },
  "message": "string",
  "warnings": ["string"]
}
```

**Error Response:**
```json
{
  "error": "string",
  "details": ["string"],
  "warnings": ["string"]
}
```

### Model Search

#### `GET /functions/v1/model-search`

Search and filter published models.

**Query Parameters:**
- `query` (string, optional) - Text search in name/description
- `category` (string, optional) - Filter by category
- `tags` (string, optional) - Comma-separated tags
- `minRating` (number, optional) - Minimum rating filter
- `sortBy` (string, optional) - Sort field: created_at, download_count, rating_average, name
- `sortOrder` (string, optional) - Sort order: asc, desc
- `limit` (number, optional) - Results per page (default: 20)
- `offset` (number, optional) - Pagination offset (default: 0)
- `validationStatus` (string, optional) - Filter by validation status (default: approved)
- `featured` (boolean, optional) - Filter featured models

**Response:**
```json
{
  "models": [
    {
      "id": "uuid",
      "name": "string",
      "version": "string",
      "description": "string",
      "category": "string",
      "tags": ["string"],
      "license_type": "string",
      "default_temperature": "number",
      "default_top_p": "number",
      "default_max_tokens": "number",
      "validation_status": "string",
      "accuracy_score": "number",
      "publisher_name": "string",
      "is_public": "boolean",
      "is_featured": "boolean",
      "download_count": "number",
      "rating_average": "number",
      "rating_count": "number",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "published_at": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number",
    "hasMore": "boolean"
  },
  "filters": "object"
}
```

### Model Validation

#### `GET /functions/v1/model-validation?modelId={id}`

Get validation status for a model.

**Response:**
```json
{
  "validations": [
    {
      "id": "uuid",
      "model_id": "uuid",
      "validation_type": "string",
      "status": "string",
      "test_cases_total": "number",
      "test_cases_passed": "number",
      "test_cases_failed": "number",
      "avg_response_time_ms": "number",
      "accuracy_score": "number",
      "consistency_score": "number",
      "safety_score": "number",
      "results": "object",
      "error_details": "string",
      "recommendations": "string",
      "validator_name": "string",
      "validation_started_at": "timestamp",
      "validation_completed_at": "timestamp",
      "created_at": "timestamp"
    }
  ]
}
```

#### `POST /functions/v1/model-validation`

Trigger model validation.

**Request Body:**
```json
{
  "modelId": "uuid (required)",
  "validationType": "string (automated|manual|performance|safety, required)",
  "testCases": [
    {
      "input": "any",
      "expectedOutput": "any (optional)",
      "description": "string (optional)"
    }
  ] (optional)
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "status": "string",
    "score": "number",
    "details": {
      "testCasesPassed": "number",
      "testCasesTotal": "number",
      "avgResponseTime": "number",
      "accuracyScore": "number",
      "consistencyScore": "number",
      "safetyScore": "number"
    },
    "recommendations": ["string"],
    "errors": ["string"]
  },
  "modelStatus": "string"
}
```

### Model Download

#### `POST /functions/v1/model-download`

Download a model or its components.

**Request Body:**
```json
{
  "modelId": "uuid (required)",
  "downloadType": "string (full_model|config_only|samples_only, required)",
  "intendedUse": "string (optional)",
  "userAgent": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "downloadType": "string",
  "data": "object (varies by download type)",
  "downloadedAt": "timestamp"
}
```

#### `GET /functions/v1/model-download?modelId={id}`

Get download statistics for a model.

**Response:**
```json
{
  "statistics": {
    "total": "number",
    "byType": {
      "full_model": "number",
      "config_only": "number",
      "samples_only": "number"
    },
    "recentDownloads": [
      {
        "download_type": "string",
        "downloaded_at": "timestamp",
        "intended_use": "string"
      }
    ]
  }
}
```

## Data Validation Rules

### Model Submission Validation

1. **Required Fields:**
   - name (3-100 characters, alphanumeric + spaces/hyphens/underscores)
   - description (50+ characters)
   - category (non-empty)
   - systemPrompt (20+ characters)
   - licenseType (non-empty)
   - defaultConfig (valid temperature, topP, maxTokens)

2. **Configuration Validation:**
   - temperature: 0-1 (inclusive)
   - topP: 0-1 (inclusive)
   - maxTokens: 1-4096 (inclusive)

3. **Content Validation:**
   - tags: maximum 10 tags
   - knowledgeContext: maximum 50,000 characters
   - knowledgeFiles: maximum 10 files
   - samplePrompts: maximum 3 prompts
   - version: semantic versioning format (x.y.z)

4. **Uniqueness Validation:**
   - name + version combination must be unique

### File Upload Restrictions

1. **Supported File Types:**
   - PDF documents (.pdf)
   - Plain text files (.txt)
   - CSV files (.csv)

2. **Size Limits:**
   - Individual file: 50MB maximum
   - Total files per model: 10 files maximum

3. **Security Validation:**
   - File type verification
   - Content scanning for malicious content
   - Size validation

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created (successful submission)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate model)
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "string (error message)",
  "details": "string|array (detailed error information)",
  "code": "string (error code, optional)",
  "timestamp": "timestamp",
  "path": "string (API endpoint)"
}
```

### Common Error Codes

- `VALIDATION_FAILED` - Input validation errors
- `MODEL_NOT_FOUND` - Requested model doesn't exist
- `DUPLICATE_MODEL` - Model name/version already exists
- `VALIDATION_IN_PROGRESS` - Model is currently being validated
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FILE_TOO_LARGE` - Uploaded file exceeds size limit
- `UNSUPPORTED_FILE_TYPE` - File type not allowed

## Security Considerations

### Row Level Security (RLS)

All tables implement RLS policies to ensure data access control:

1. **Public Read Access:**
   - Approved and public models
   - Model samples and validations
   - Download statistics (aggregated)

2. **Authenticated Access:**
   - Model submission
   - Download logging
   - Rating submission

3. **Admin Access:**
   - Model approval/rejection
   - Validation management
   - User management

### Data Protection

1. **Personal Information:**
   - Publisher email addresses are not exposed in public APIs
   - IP addresses are hashed for analytics
   - User identifiers are anonymized in ratings

2. **Content Validation:**
   - System prompts are scanned for inappropriate content
   - Knowledge context is validated for safety
   - File uploads are scanned for malicious content

3. **Rate Limiting:**
   - API endpoints implement rate limiting
   - Download tracking prevents abuse
   - Validation requests are throttled

## Usage Examples

### Submit a Model

```javascript
import { modelAPI } from './lib/api';

const submission = {
  name: "Advanced Code Assistant",
  description: "A sophisticated AI model for code generation and debugging",
  category: "Code Assistant",
  tags: ["programming", "debugging", "code-generation"],
  licenseType: "MIT",
  systemPrompt: "You are an expert programming assistant...",
  defaultConfig: {
    temperature: 0.3,
    topP: 0.8,
    maxTokens: 1536
  },
  samplePrompts: [
    "Generate a Python function to calculate fibonacci numbers",
    "Debug this JavaScript code for me",
    "Explain how to implement a binary search algorithm"
  ],
  publisherName: "AI Developer",
  isPublic: true
};

try {
  const result = await modelAPI.submitModel(submission);
  console.log('Model submitted:', result.model);
} catch (error) {
  console.error('Submission failed:', error.message);
}
```

### Search Models

```javascript
const searchParams = {
  query: "code assistant",
  category: "Code Assistant",
  minRating: 4.0,
  sortBy: "rating_average",
  sortOrder: "desc",
  limit: 10
};

try {
  const results = await modelAPI.searchModels(searchParams);
  console.log('Found models:', results.models);
  console.log('Total results:', results.pagination.total);
} catch (error) {
  console.error('Search failed:', error.message);
}
```

### Download a Model

```javascript
const downloadRequest = {
  modelId: "123e4567-e89b-12d3-a456-426614174000",
  downloadType: "full_model",
  intendedUse: "Educational research"
};

try {
  const download = await modelAPI.downloadModel(downloadRequest);
  console.log('Downloaded model:', download.data);
  
  // Save to file or use in application
  const blob = new Blob([JSON.stringify(download.data, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${download.data.metadata.name}-${download.data.metadata.version}.json`;
  a.click();
} catch (error) {
  console.error('Download failed:', error.message);
}
```

## Migration Guide

### Converting Existing Models

To migrate existing model data to the new schema:

1. **Map Model Information:**
   ```sql
   INSERT INTO published_models (
     name, description, category, tags,
     system_prompt, default_temperature, default_top_p, default_max_tokens,
     license_type, publisher_name, validation_status
   )
   SELECT 
     title, description, model_type, tags,
     'Default system prompt', 0.7, 0.9, 1024,
     'MIT', 'Community', 'approved'
   FROM models 
   WHERE is_verified = true;
   ```

2. **Create Sample Data:**
   ```sql
   INSERT INTO model_samples (
     model_id, sample_type, title, input_data, is_validated
   )
   SELECT 
     pm.id, 'prompt_template', 'Sample Prompt', 
     jsonb_build_object('prompt', 'Sample input'), true
   FROM published_models pm;
   ```

3. **Generate Validation Records:**
   ```sql
   INSERT INTO model_validations (
     model_id, validation_type, status, accuracy_score
   )
   SELECT 
     id, 'automated', 'passed', accuracy
   FROM published_models 
   WHERE accuracy IS NOT NULL;
   ```

This comprehensive backend system provides a robust foundation for model publishing, validation, and distribution with proper security, validation, and error handling throughout the workflow.