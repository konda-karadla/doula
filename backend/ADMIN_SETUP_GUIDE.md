# Admin Portal Setup Guide 🚀

Complete step-by-step guide to set up and test the Admin Portal with backend integration.

---

## Prerequisites

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ PostgreSQL database running and accessible
- ✅ Redis server running (for background jobs)
- ✅ Backend `.env` file configured with database URL

---

## Step 1: Apply Database Migration

The admin portal requires a `role` field in the User model. Apply the migration:

```bash
cd backend
npx prisma migrate dev --name add_user_role
```

**What this does:**
- Adds `role` field to the `users` table (default: 'user')
- Creates an index on the role field
- Allows role-based access control

**Expected Output:**
```
✅ Database migration applied successfully
```

---

## Step 2: Seed Admin Users

Run the seed script to create admin and test users:

```bash
npm run prisma:seed
```

**This creates:**

1. **Admin User:**
   - Email: `admin@healthplatform.com`
   - Password: `admin123`
   - Role: `admin`

2. **Regular User:**
   - Email: `user@healthplatform.com`
   - Password: `user123`
   - Role: `user`

**Expected Output:**
```
🌱 Starting database seed...
✅ Created/verified system: Doula Care (doula)
...
👥 Creating sample users...
✅ Admin user: admin@healthplatform.com (password: admin123)
✅ Regular user: user@healthplatform.com (password: user123)
🎉 Seed completed successfully!
```

---

## Step 3: Start the Backend

Start the NestJS backend server:

```bash
npm run start:dev
```

**Server will be available at:**
- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/api`

**You should see:**
```
[Nest] Application successfully started
Swagger documentation available at http://localhost:3000/api
```

---

## Step 4: Test Admin Authentication

### Using cURL

```bash
# Login as admin
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@healthplatform.com",
    "password": "admin123"
  }'
```

**Expected Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@healthplatform.com",
    "username": "admin",
    "role": "admin",
    ...
  }
}
```

**Save the `accessToken` for next steps!**

---

## Step 5: Test Admin Endpoints

### 5.1 Get All Users

```bash
# Replace YOUR_TOKEN with the accessToken from login
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
[
  {
    "id": "uuid",
    "email": "admin@healthplatform.com",
    "name": "admin",
    "role": "admin",
    "system": "doula",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "email": "user@healthplatform.com",
    "name": "johndoe",
    "role": "user",
    "system": "doula",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
]
```

### 5.2 Get User Analytics

```bash
curl -X GET http://localhost:3000/admin/analytics/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "totalUsers": 2,
  "usersBySystem": [
    {
      "system": "Doula Care",
      "count": 2
    }
  ],
  "recentRegistrations": 2
}
```

### 5.3 Get System Configuration

```bash
curl -X GET http://localhost:3000/admin/system-config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
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
    "doula": { ... },
    "functional_health": { ... },
    "elderly_care": { ... }
  }
}
```

### 5.4 Create a New User

```bash
curl -X POST http://localhost:3000/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "password123",
    "role": "user",
    "language": "en",
    "profileType": "individual",
    "journeyType": "optimizer",
    "systemId": "YOUR_SYSTEM_ID"
  }'
```

### 5.5 Update System Configuration

```bash
curl -X PUT http://localhost:3000/admin/system-config \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "general": {
      "platformName": "My Health Platform"
    },
    "features": {
      "darkMode": true
    }
  }'
```

---

## Step 6: Test with Swagger UI

1. **Open Swagger UI:**
   ```
   http://localhost:3000/api
   ```

2. **Authorize with JWT:**
   - Click the "Authorize" button (🔒)
   - Enter: `Bearer YOUR_ACCESS_TOKEN`
   - Click "Authorize"

3. **Test Endpoints:**
   - Navigate to "admin-controller" section
   - Try GET `/admin/users`
   - Try GET `/admin/analytics/users`
   - Try GET `/admin/system-config`

---

## Step 7: Verify Role-Based Access Control

### Test with Regular User (Should Fail)

```bash
# Login as regular user
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@healthplatform.com",
    "password": "user123"
  }'

# Try to access admin endpoint (should fail)
curl -X GET http://localhost:3000/admin/users \
  -H "Authorization: Bearer REGULAR_USER_TOKEN"
```

**Expected Response:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

✅ **This confirms role-based access control is working!**

---

## Step 8: Start Frontend Admin Portal

1. **Navigate to admin app:**
   ```bash
   cd ../frontend/apps/admin
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3001
   ```

5. **Login:**
   - Email: `admin@healthplatform.com`
   - Password: `admin123`

6. **Test Admin Features:**
   - ✅ Dashboard with real statistics
   - ✅ User Management (view, create, edit, delete)
   - ✅ Lab Results (view real data)
   - ✅ Action Plans (view real data)
   - ✅ Settings (update configuration)
   - ✅ Analytics (view real metrics)

---

## Troubleshooting

### Issue: Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Check your `.env` file has correct `DATABASE_URL`
2. Ensure PostgreSQL is running
3. Verify database credentials

### Issue: Migration Already Exists

**Error:** `Migration already exists`

**Solution:**
```bash
# Reset migrations (CAREFUL: This drops all data)
npx prisma migrate reset

# Or apply specific migration
npx prisma migrate deploy
```

### Issue: Admin Endpoint Returns 403

**Error:** `Forbidden resource`

**Solution:**
1. Verify user role is 'admin' in database
2. Check JWT token is valid
3. Ensure you're using admin user credentials

### Issue: Seed Script Fails

**Error:** `Seed failed: P2002`

**Solution:**
```bash
# Users already exist, manually update role
npx prisma studio
# Find admin@healthplatform.com user
# Set role to 'admin'
# Save
```

---

## Quick Reference

### Default Credentials
```
Admin:  admin@healthplatform.com / admin123
User:   user@healthplatform.com / user123
```

### Important Endpoints
```
Backend API:     http://localhost:3000
Swagger UI:      http://localhost:3000/api
Admin Portal:    http://localhost:3001
```

### Admin API Endpoints
```
GET    /admin/users                    - List all users
GET    /admin/users/:id                - Get user details
POST   /admin/users                    - Create user
PUT    /admin/users/:id                - Update user
DELETE /admin/users/:id                - Delete user
GET    /admin/system-config            - Get configuration
PUT    /admin/system-config            - Update configuration
GET    /admin/analytics/users          - User analytics
GET    /admin/analytics/labs           - Lab analytics
GET    /admin/analytics/action-plans   - Action plan analytics
```

---

## Verification Checklist

After setup, verify:

- [ ] Database migration applied successfully
- [ ] Admin user exists with role='admin'
- [ ] Backend server running on port 3000
- [ ] Can login as admin
- [ ] Admin endpoints return data (not 403)
- [ ] Regular user cannot access admin endpoints (403)
- [ ] Frontend admin portal loads
- [ ] Can login to admin portal
- [ ] Dashboard shows real statistics
- [ ] User management works
- [ ] Analytics display real data

---

## Next Steps

Once everything is working:

1. **Security Hardening:**
   - Change default admin password
   - Enable HTTPS in production
   - Add rate limiting
   - Implement audit logging

2. **Additional Features:**
   - Add PDF viewer for lab results
   - Implement rich text editor for action plans
   - Add bulk user operations
   - Create admin activity logs

3. **Deployment:**
   - Set up production database
   - Configure environment variables
   - Deploy backend to cloud
   - Deploy frontend to CDN

---

## Support

For issues:
- Check [ADMIN_API_REFERENCE.md](./ADMIN_API_REFERENCE.md) for API details
- Review [ADMIN_IMPLEMENTATION_SUMMARY.md](./ADMIN_IMPLEMENTATION_SUMMARY.md)
- Check logs: `tail -f logs/app.log`
- Enable debug mode: `DEBUG=* npm run start:dev`

---

## Summary

You've successfully set up:
- ✅ Role-based access control
- ✅ 10 admin API endpoints
- ✅ Admin user with credentials
- ✅ Full-stack admin portal
- ✅ Real-time data integration

**Status:** 🎉 Admin Portal is Ready!

---

**Last Updated:** January 2025
**Version:** 1.0.0

