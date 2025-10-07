# Phase 4: Lab Results & OCR - Requirements

## What to Ask in New Chat
**"Continue Phase 4: Implement lab results upload with AWS S3, Tesseract.js OCR processing, and biomarker parsing"**

## Context for Next Session
- Phases 1-3 are complete and working
- All tests passing (4/4)
- Database has lab_results and biomarkers tables ready
- Tesseract.js and AWS S3 client already installed
- Bull queue system configured with Redis

## Phase 4 Implementation Plan

### 1. Labs Module Structure
Create these files:
- `src/labs/labs.module.ts`
- `src/labs/labs.service.ts`
- `src/labs/labs.controller.ts`
- `src/labs/labs.controller.spec.ts`

### 2. DTOs
- `upload-lab.dto.ts` - File upload validation
- `lab-result.dto.ts` - Lab result response
- `biomarker.dto.ts` - Biomarker response
- `parse-biomarker.dto.ts` - Manual biomarker entry

### 3. Services
- **S3Service** - Handle file uploads to AWS S3
  - Upload PDF with unique key
  - Generate presigned URLs
  - Delete files if needed

- **OcrService** - Tesseract.js integration
  - Extract text from PDF
  - Background processing with Bull queue
  - Update lab_results.raw_ocr_text
  - Update processing_status

- **BiomarkerParserService** - Pattern matching
  - Parse common lab formats
  - Extract test names, values, units
  - Extract reference ranges
  - Handle multiple formats

- **LabsService** - Main business logic
  - Upload and process labs
  - Retrieve user's lab results
  - Get biomarkers by lab result
  - Tenant isolation enforcement

### 4. Queue Jobs
- `ocr-processing.processor.ts`
  - Process OCR in background
  - Parse biomarkers after OCR
  - Update database status

### 5. Endpoints
```
POST   /labs/upload           - Upload PDF lab result
GET    /labs                  - Get user's lab results
GET    /labs/:id              - Get specific lab result
GET    /labs/:id/biomarkers   - Get parsed biomarkers
DELETE /labs/:id              - Delete lab result
```

### 6. Security & Isolation
- All endpoints protected with JwtAuthGuard
- TenantIsolationGuard on all routes
- Users can only access their own lab results
- S3 files scoped by systemId and userId

### 7. Testing
- Unit tests for controller
- Unit tests for services
- Integration tests for upload flow
- Mock S3 and Tesseract in tests

### 8. Pattern Matching Examples
Common lab formats to parse:
```
Test Name: Glucose          Value: 95  Unit: mg/dL  Range: 70-100
Hemoglobin A1c    5.6%                  Reference: <5.7%
TSH: 2.3 mIU/L (Normal: 0.4-4.0)
```

Parser should handle:
- Different separators (colon, tab, spaces)
- Values with or without units
- Reference ranges in various formats
- Multiple tests per line or separate lines

### 9. Environment Variables Required
Already in .env:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-key>
AWS_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET_NAME=health-platform-lab-results
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 10. Dependencies Already Installed
- @aws-sdk/client-s3
- tesseract.js
- @nestjs/bull
- bull

## Database Tables Available

### lab_results
- id, user_id, system_id
- file_name, s3_key, s3_url
- uploaded_at, processing_status
- raw_ocr_text
- created_at, updated_at

### biomarkers
- id, lab_result_id
- test_name, value, unit
- reference_range_low, reference_range_high
- test_date, notes
- created_at, updated_at

## Success Criteria

Phase 4 is complete when:
1. ✅ File upload to S3 works
2. ✅ OCR extracts text from PDFs
3. ✅ Background queue processes OCR
4. ✅ Basic biomarker parser works for common formats
5. ✅ All endpoints protected with auth + tenant isolation
6. ✅ Users can view their lab results
7. ✅ Biomarkers are parsed and retrievable
8. ✅ Unit tests pass
9. ✅ Swagger docs updated
10. ✅ Build succeeds with no errors

## Notes for Implementation
- Start with file upload first
- Then add OCR processing
- Then add biomarker parsing
- Keep parser simple - pattern matching only
- Handle errors gracefully (OCR failures, parse failures)
- Log processing steps for debugging
- Update processing_status: pending -> processing -> completed/failed
