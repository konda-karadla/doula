# Admin API Reference

This document details all admin-specific API endpoints for managing users, system configuration, and viewing analytics.

## Authentication

All admin endpoints require:
- Valid JWT token in Authorization header
- User role must be `admin`

```
Authorization: Bearer <your_jwt_token>
```

## Table of Contents

- [User Management](#user-management)
- [System Configuration](#system-configuration)
- [Analytics](#analytics)

---

## User Management

### Get All Users

Retrieve a list of all users in the system.

**Endpoint:** `GET /admin/users`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "username",
    "role": "user",
    "system": "doula",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-15T00:00:00.000Z"
  }
]
```

---

### Get User By ID

Retrieve detailed information about a specific user.

**Endpoint:** `GET /admin/users/:id`

**Parameters:**
- `id` (path): User UUID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "role": "user",
  "language": "en",
  "profileType": "individual",
  "journeyType": "optimizer",
  "systemId": "system-uuid",
  "system": {
    "id": "system-uuid",
    "name": "Doula Care System",
    "slug": "doula"
  },
  "labResults": [...],
  "actionPlans": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

### Create User

Create a new user account.

**Endpoint:** `POST /admin/users`

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "password": "securepassword123",
  "role": "user",
  "language": "en",
  "profileType": "individual",
  "journeyType": "optimizer",
  "systemId": "system-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "email": "newuser@example.com",
  "username": "newuser",
  "role": "user",
  "language": "en",
  "profileType": "individual",
  "journeyType": "optimizer",
  "systemId": "system-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- `409 Conflict`: User with this email or username already exists
- `400 Bad Request`: Invalid input data

---

### Update User

Update an existing user's information.

**Endpoint:** `PUT /admin/users/:id`

**Parameters:**
- `id` (path): User UUID

**Request Body (all fields optional):**
```json
{
  "email": "updated@example.com",
  "username": "updatedusername",
  "password": "newpassword123",
  "role": "admin",
  "language": "es",
  "profileType": "couple",
  "journeyType": "preconception",
  "systemId": "new-system-uuid"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "updated@example.com",
  "username": "updatedusername",
  "role": "admin",
  "language": "es",
  "profileType": "couple",
  "journeyType": "preconception",
  "systemId": "new-system-uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `400 Bad Request`: Invalid input data

---

### Delete User

Permanently delete a user and all associated data.

**Endpoint:** `DELETE /admin/users/:id`

**Parameters:**
- `id` (path): User UUID

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: User not found

---

## System Configuration

### Get System Configuration

Retrieve the current system configuration.

**Endpoint:** `GET /admin/system-config`

**Response:** `200 OK`
```json
{
  "general": {
    "platformName": "Health Platform",
    "supportEmail": "support@healthplatform.com",
    "maxFileSize": "10",
    "sessionTimeout": "30"
  },
  "features": {
    "userRegistration": true,
    "labUpload": true,
    "actionPlans": true,
    "notifications": true,
    "analytics": true,
    "darkMode": false
  },
  "systems": {
    "doula": {
      "enabled": true,
      "name": "Doula Care System",
      "description": "Comprehensive doula and fertility care platform",
      "primaryColor": "#3B82F6"
    },
    "functional_health": {
      "enabled": true,
      "name": "Functional Health System",
      "description": "Advanced functional medicine and wellness platform",
      "primaryColor": "#8B5CF6"
    },
    "elderly_care": {
      "enabled": true,
      "name": "Elderly Care System",
      "description": "Specialized care platform for elderly patients",
      "primaryColor": "#F59E0B"
    }
  }
}
```

---

### Update System Configuration

Update system configuration settings.

**Endpoint:** `PUT /admin/system-config`

**Request Body (all nested fields optional):**
```json
{
  "general": {
    "platformName": "Updated Name",
    "supportEmail": "newsupport@example.com",
    "maxFileSize": "20",
    "sessionTimeout": "60"
  },
  "features": {
    "darkMode": true
  },
  "systems": {
    "doula": {
      "enabled": false
    }
  }
}
```

**Response:** `200 OK`
```json
{
  "general": {...},
  "features": {...},
  "systems": {...}
}
```

---

## Analytics

### User Analytics

Get aggregated user statistics.

**Endpoint:** `GET /admin/analytics/users`

**Response:** `200 OK`
```json
{
  "totalUsers": 1234,
  "usersBySystem": [
    {
      "system": "Doula Care System",
      "count": 456
    },
    {
      "system": "Functional Health System",
      "count": 567
    },
    {
      "system": "Elderly Care System",
      "count": 211
    }
  ],
  "recentRegistrations": 45
}
```

---

### Lab Results Analytics

Get aggregated lab results statistics.

**Endpoint:** `GET /admin/analytics/labs`

**Response:** `200 OK`
```json
{
  "totalLabs": 5678,
  "byStatus": [
    {
      "status": "completed",
      "count": 4500
    },
    {
      "status": "processing",
      "count": 150
    },
    {
      "status": "pending",
      "count": 1000
    },
    {
      "status": "failed",
      "count": 28
    }
  ],
  "recentUploads": 234
}
```

---

### Action Plans Analytics

Get aggregated action plan statistics.

**Endpoint:** `GET /admin/analytics/action-plans`

**Response:** `200 OK`
```json
{
  "totalPlans": 890,
  "byStatus": [
    {
      "status": "active",
      "count": 650
    },
    {
      "status": "completed",
      "count": 200
    },
    {
      "status": "draft",
      "count": 40
    }
  ],
  "totalItems": 5340,
  "completedItems": 3245,
  "completionRate": 60.8
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

Returned when the authenticated user does not have admin role.

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Notes

- All timestamps are in ISO 8601 format
- UUIDs are version 4
- Password fields are never returned in responses
- All endpoints require admin role
- System configuration changes may require application restart for some settings

## Testing

You can test these endpoints using:
- Postman
- cURL
- Or the built-in Swagger UI at `http://localhost:3000/api`

Example cURL request:
```bash
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

**Last Updated:** January 2025
**API Version:** 1.0

