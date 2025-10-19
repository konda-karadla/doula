# API Reference - Health Platform Backend

Complete API documentation for all endpoints.

**Base URL:** `http://localhost:3000`
**Swagger UI:** `http://localhost:3000/api`

> **📌 Admin API:** For admin-specific endpoints (user management, system configuration, analytics), see [ADMIN_API_REFERENCE.md](./ADMIN_API_REFERENCE.md)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Lab Results](#lab-results)
3. [Action Plans](#action-plans)
4. [Action Items](#action-items)
5. [Health Insights](#health-insights)
6. [User Profile](#user-profile)
7. [Admin Endpoints](./ADMIN_API_REFERENCE.md) ⭐ NEW
8. [Error Handling](#error-handling)

---

## Authentication

All endpoints except registration and login require JWT authentication.

**Header Format:**
```
Authorization: Bearer <access_token>
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "systemId": "doula-system-id"
}
```

**Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "systemId": "doula-system-id"
  }
}
```

### POST /auth/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout
Revoke refresh token. Requires authentication.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## Lab Results

### POST /labs/upload
Upload a PDF lab result for OCR processing.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file` (file, required): PDF file containing lab results

**Response (201):**
```json
{
  "id": "uuid",
  "fileName": "lab_results_2025.pdf",
  "s3Url": "https://s3.amazonaws.com/bucket/...",
  "processingStatus": "pending",
  "uploadedAt": "2025-10-03T..."
}
```

### GET /labs
Get all lab results for authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "fileName": "lab_results_2025.pdf",
    "s3Url": "https://s3.amazonaws.com/bucket/...",
    "processingStatus": "completed",
    "uploadedAt": "2025-10-03T...",
    "createdAt": "2025-10-03T..."
  }
]
```

### GET /labs/:id
Get specific lab result by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "fileName": "lab_results_2025.pdf",
  "s3Url": "https://s3.amazonaws.com/bucket/...",
  "processingStatus": "completed",
  "rawOcrText": "Extracted text from PDF...",
  "uploadedAt": "2025-10-03T...",
  "createdAt": "2025-10-03T..."
}
```

### GET /labs/:id/biomarkers
Get parsed biomarkers from lab result.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "testName": "Glucose",
    "value": "95",
    "unit": "mg/dL",
    "referenceRangeLow": "70",
    "referenceRangeHigh": "100",
    "testDate": "2025-09-15T...",
    "createdAt": "2025-10-03T..."
  }
]
```

### DELETE /labs/:id
Delete lab result and associated biomarkers.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Lab result deleted successfully"
}
```

---

## Action Plans

### POST /action-plans
Create a new action plan.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Improve Blood Sugar Levels",
  "description": "Action plan to reduce glucose and A1c"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Improve Blood Sugar Levels",
  "description": "Action plan to reduce glucose and A1c",
  "status": "active",
  "createdAt": "2025-10-03T...",
  "updatedAt": "2025-10-03T..."
}
```

### GET /action-plans
Get all action plans with their items.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Improve Blood Sugar Levels",
    "description": "Action plan to reduce glucose and A1c",
    "status": "active",
    "createdAt": "2025-10-03T...",
    "updatedAt": "2025-10-03T...",
    "actionItems": [
      {
        "id": "uuid",
        "title": "Reduce sugar intake",
        "priority": "high",
        "completedAt": null
      }
    ]
  }
]
```

### GET /action-plans/:id
Get specific action plan.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Improve Blood Sugar Levels",
  "description": "Action plan to reduce glucose and A1c",
  "status": "active",
  "createdAt": "2025-10-03T...",
  "updatedAt": "2025-10-03T..."
}
```

### PUT /action-plans/:id
Update action plan.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed",
  "updatedAt": "2025-10-03T..."
}
```

### DELETE /action-plans/:id
Delete action plan and all associated items.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Action plan deleted successfully"
}
```

---

## Action Items

### POST /action-plans/:planId/items
Create action item in a plan.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Exercise 30 minutes daily",
  "description": "Walk, run, or bike for at least 30 minutes",
  "priority": "high",
  "dueDate": "2025-10-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "title": "Exercise 30 minutes daily",
  "description": "Walk, run, or bike for at least 30 minutes",
  "priority": "high",
  "dueDate": "2025-10-31T23:59:59Z",
  "completedAt": null,
  "createdAt": "2025-10-03T..."
}
```

### GET /action-plans/:planId/items
Get all items in action plan.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Exercise 30 minutes daily",
    "description": "Walk, run, or bike for at least 30 minutes",
    "priority": "high",
    "dueDate": "2025-10-31T23:59:59Z",
    "completedAt": null,
    "createdAt": "2025-10-03T..."
  }
]
```

### GET /action-plans/:planId/items/:itemId
Get specific action item.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Exercise 30 minutes daily",
  "description": "Walk, run, or bike for at least 30 minutes",
  "priority": "high",
  "dueDate": "2025-10-31T23:59:59Z",
  "completedAt": null,
  "createdAt": "2025-10-03T..."
}
```

### PUT /action-plans/:planId/items/:itemId
Update action item.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated title",
  "priority": "medium"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated title",
  "priority": "medium",
  "updatedAt": "2025-10-03T..."
}
```

### PATCH /action-plans/:planId/items/:itemId/complete
Mark action item as completed.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "completedAt": "2025-10-03T12:30:00Z"
}
```

### PATCH /action-plans/:planId/items/:itemId/uncomplete
Mark action item as not completed.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "completedAt": null
}
```

### DELETE /action-plans/:planId/items/:itemId
Delete action item.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Action item deleted successfully"
}
```

---

## Health Insights

### GET /insights/summary
Get health insights from latest lab results.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "totalInsights": 5,
  "criticalCount": 1,
  "highPriorityCount": 2,
  "normalCount": 2,
  "insights": [
    {
      "id": "uuid",
      "biomarkerId": "uuid",
      "testName": "Glucose",
      "currentValue": "110",
      "type": "high",
      "priority": "medium",
      "message": "Your Glucose is above the optimal range at 110 mg/dL.",
      "recommendation": "Your blood glucose is elevated. Consider reducing sugar intake...",
      "createdAt": "2025-10-03T..."
    }
  ],
  "lastAnalyzedAt": "2025-10-03T..."
}
```

### GET /insights/lab-result/:labResultId
Get insights for specific lab result.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "biomarkerId": "uuid",
    "testName": "Glucose",
    "currentValue": "95",
    "type": "normal",
    "priority": "low",
    "message": "Your Glucose is within the healthy range at 95 mg/dL.",
    "recommendation": "Your glucose levels are within optimal range...",
    "createdAt": "2025-10-03T..."
  }
]
```

### GET /insights/trends/:testName
Get biomarker trends over time.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `testName`: Name of biomarker (e.g., "glucose", "cholesterol")

**Response (200):**
```json
[
  {
    "value": "95",
    "unit": "mg/dL",
    "date": "2025-01-15T...",
    "testName": "Glucose"
  },
  {
    "value": "110",
    "unit": "mg/dL",
    "date": "2025-10-03T...",
    "testName": "Glucose"
  }
]
```

---

## User Profile

### GET /profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "johndoe",
  "profileType": "patient",
  "journeyType": "prenatal",
  "systemId": "uuid",
  "createdAt": "2024-01-15T...",
  "updatedAt": "2025-10-03T..."
}
```

### GET /profile/stats
Get user health statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "totalLabResults": 8,
  "totalActionPlans": 4,
  "completedActionItems": 15,
  "pendingActionItems": 7,
  "criticalInsights": 2,
  "lastLabUpload": "2025-10-01T...",
  "lastActionPlanUpdate": "2025-10-02T...",
  "memberSince": "2024-01-15T..."
}
```

---

## Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### HTTP Status Codes

**2xx Success**
- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully

**4xx Client Errors**
- `400 Bad Request` - Invalid request format or data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Insufficient permissions or tenant isolation violation
- `404 Not Found` - Resource doesn't exist
- `409 Conflict` - Resource already exists (e.g., duplicate email)

**5xx Server Errors**
- `500 Internal Server Error` - Unexpected server error

### Common Error Messages

**Authentication Errors:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**Validation Errors:**
```json
{
  "statusCode": 400,
  "message": ["email must be a valid email address"],
  "error": "Bad Request"
}
```

**Not Found Errors:**
```json
{
  "statusCode": 404,
  "message": "Lab result not found",
  "error": "Not Found"
}
```

**Tenant Isolation Errors:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider implementing in production.

## Pagination

Currently no pagination is implemented. All list endpoints return complete results.

## Versioning

API version: v1 (implicit, no version prefix required)

---

**For interactive API testing, visit:** http://localhost:3000/api
