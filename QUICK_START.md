# FastAPI Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
- Python 3.10+
- PostgreSQL
- Redis
- Tesseract OCR

### Setup Steps

```bash
# 1. Run setup script
chmod +x backend/setup_fastapi.sh
./backend/setup_fastapi.sh

# 2. Configure environment
cp backend/.env.fastapi.example .env
# Edit .env with your values

# 3. Run database migrations
cd backend && alembic upgrade head

# 4. Start services (3 terminals)

# Terminal 1: Redis
redis-server

# Terminal 2: API
./backend/start_api.sh

# Terminal 3: Celery
./backend/start_celery.sh
```

### Access Points
- **API**: http://localhost:3000
- **Docs**: http://localhost:3000/api
- **Health**: http://localhost:3000/health

---

## 📝 Essential Commands

### Development
```bash
# Start API with auto-reload
uvicorn backend.main:app --reload --port 3000

# Start Celery worker
celery -A backend.core.celery_app worker --loglevel=info

# Run tests
pytest

# Verify setup
python backend/verify_fastapi.py
```

### Database
```bash
# Create migration
cd backend && alembic revision --autogenerate -m "description"

# Apply migrations
cd backend && alembic upgrade head

# Rollback migration
cd backend && alembic downgrade -1

# Check current version
cd backend && alembic current
```

### Docker
```bash
# Start all services
docker-compose -f backend/docker-compose.fastapi.yml up -d

# View logs
docker-compose -f backend/docker-compose.fastapi.yml logs -f

# Stop all services
docker-compose -f backend/docker-compose.fastapi.yml down
```

---

## 🔐 Authentication

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "password123",
    "profileType": "patient",
    "journeyType": "functional_health",
    "systemSlug": "test-system"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Use Token
```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📂 Upload Lab Result

```bash
curl -X POST http://localhost:3000/labs/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/lab.pdf" \
  -F "notes=My lab results"
```

---

## 🛠️ Troubleshooting

### API won't start
```bash
# Check if port 3000 is available
lsof -i :3000

# Check environment variables
cat .env

# Check database connection
psql $DATABASE_URL
```

### Celery not processing
```bash
# Check Redis
redis-cli ping  # Should return PONG

# Check Celery connection
celery -A backend.core.celery_app inspect ping
```

### Database errors
```bash
# Check migrations
alembic current

# Reset database (WARNING: deletes data)
alembic downgrade base
alembic upgrade head
```

---

## 📊 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login user |
| POST | `/labs/upload` | Upload lab PDF |
| GET | `/labs` | Get all labs |
| POST | `/action-plans` | Create plan |
| GET | `/insights/summary` | Get insights |
| GET | `/profile` | Get profile |

---

## 🔗 Resources

- **Full Documentation**: See `README_FASTAPI.md`
- **Migration Guide**: See `MIGRATION_GUIDE.md`
- **API Docs**: http://localhost:3000/api
- **FastAPI Docs**: https://fastapi.tiangolo.com/

---

## ⚡ Performance Tips

1. **Use async everywhere**: All I/O operations should be async
2. **Connection pooling**: Already configured (10 min, 20 max)
3. **Redis caching**: Add for frequently accessed data
4. **Database indexes**: Check slow queries
5. **Celery workers**: Scale horizontally for more throughput

---

## 🎯 Next Steps

1. ✅ Complete setup
2. ✅ Test all endpoints
3. ✅ Integrate with frontend
4. 📝 Add comprehensive tests
5. 🚀 Deploy to production
6. 📊 Set up monitoring

---

**Need Help?**
- Check `MIGRATION_GUIDE.md` for detailed instructions
- Review API docs at `/api` endpoint
- See logs in terminal or Docker logs
