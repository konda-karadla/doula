# Admin Portal - Quick Start Guide ⚡

**5-minute setup to get your Admin Portal running!**

---

## 🚀 Quick Setup (When Database is Available)

### 1. Apply Migration & Seed
```bash
cd backend

# Apply migration
npx prisma migrate dev --name add_user_role

# Seed admin users
npm run prisma:seed
```

### 2. Start Backend
```bash
npm run start:dev
```
Backend running at: `http://localhost:3002`

### 3. Start Admin Portal
```bash
cd ../frontend/apps/admin
npm run dev
```
Admin Portal at: `http://localhost:3001`

### 4. Login
```
Email:    admin@healthplatform.com
Password: admin123
```

---

## 🧪 Quick Test (CLI)

```bash
# Get admin token
TOKEN=$(curl -s -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@healthplatform.com","password":"admin123"}' \
  | jq -r '.accessToken')

# Test admin endpoints
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/admin/users
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/admin/analytics/users
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/admin/system-config
```

---

## 📋 What You Get

### Backend (10 Endpoints)
- ✅ User Management (5)
- ✅ System Configuration (2)
- ✅ Analytics (3)

### Frontend
- ✅ Dashboard with real-time stats
- ✅ User Management UI
- ✅ Lab Results viewing
- ✅ Action Plans management
- ✅ Settings configuration
- ✅ Analytics dashboard

---

## 🔑 Default Credentials

| User Type | Email | Password |
|-----------|-------|----------|
| **Admin** | admin@healthplatform.com | admin123 |
| Regular | user@healthplatform.com | user123 |

---

## 🌐 URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3002 |
| Swagger UI | http://localhost:3002/api |
| Admin Portal | http://localhost:3001 |

---

## 📚 Documentation

- **Setup Guide:** `backend/ADMIN_SETUP_GUIDE.md`
- **API Reference:** `backend/ADMIN_API_REFERENCE.md`
- **Implementation:** `backend/ADMIN_IMPLEMENTATION_SUMMARY.md`
- **Full Stack:** `ADMIN_FULL_STACK_SUMMARY.md`

---

## ⚠️ Troubleshooting

**Database not reachable?**
- Start PostgreSQL server
- Check `.env` DATABASE_URL

**Migration fails?**
- Ensure database is empty or use `npx prisma migrate reset`

**403 Forbidden?**
- Verify user role is 'admin' in database
- Use admin credentials

**Seed already exists?**
- Run seed again (it uses upsert)
- Or manually set user role in Prisma Studio

---

## ✅ Quick Checklist

```
□ Database running
□ Migration applied
□ Seed script run
□ Backend started (port 3000)
□ Frontend started (port 3001)
□ Can login as admin
□ Dashboard shows real data
```

---

## 🎯 Next Actions

1. **Change default password** (security!)
2. **Create more admin users** if needed
3. **Configure system settings** via UI
4. **Test all admin features**

---

**Questions?** See `backend/ADMIN_SETUP_GUIDE.md` for detailed instructions.

**Status:** ✅ Ready to use!

