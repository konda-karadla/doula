# Health Platform API - FastAPI Version

A complete FastAPI migration of the multi-tenant health platform backend, featuring async operations, JWT authentication, file uploads, OCR processing, and background task processing.

## 🚀 Features

- **Async/Await Support**: Full async implementation using asyncpg and SQLAlchemy
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Multi-Tenant**: System-level data isolation for different health platforms
- **File Upload**: PDF lab result upload with automatic OCR processing
- **Background Processing**: Celery-based task queue for OCR and data parsing
- **AWS S3 Integration**: Secure file storage with presigned URLs
- **Auto Documentation**: Interactive API docs with Swagger UI
- **Type Safety**: Full Pydantic validation for requests/responses
- **Consultation System**: Doctor management and appointment booking
- **Admin Dashboard**: User management, analytics, and system configuration
- **Role-Based Access**: Admin and user role separation

## 📋 API Endpoints

All endpoints maintain the same routes as the NestJS version for backward compatibility.

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Labs
- `POST /labs/upload` - Upload lab PDF for OCR processing
- `GET /labs` - Get all user's lab results
- `GET /labs/{id}` - Get specific lab result
- `GET /labs/{id}/biomarkers` - Get parsed biomarkers
- `DELETE /labs/{id}` - Delete lab result

### Action Plans
- `POST /action-plans` - Create action plan
- `GET /action-plans` - Get all action plans
- `GET /action-plans/{id}` - Get specific action plan
- `PUT /action-plans/{id}` - Update action plan
- `DELETE /action-plans/{id}` - Delete action plan
- `POST /action-plans/{planId}/items` - Add action item
- `GET /action-plans/{planId}/items` - Get action items
- `PATCH /action-plans/{planId}/items/{itemId}/complete` - Mark item complete
- `DELETE /action-plans/{planId}/items/{itemId}` - Delete action item

### Insights
- `GET /insights/summary` - Get health insights summary
- `GET /insights/lab-result/{labResultId}` - Get insights for lab
- `GET /insights/trends/{testName}` - Get biomarker trends

### Profile
- `GET /profile` - Get user profile
- `GET /profile/stats` - Get health statistics

### Consultations
- `GET /consultations/doctors` - Get list of available doctors
- `GET /consultations/doctors/{id}` - Get doctor details
- `GET /consultations/doctors/{id}/availability` - Get doctor availability slots
- `POST /consultations/book` - Book a consultation
- `GET /consultations/my-bookings` - Get user's consultations
- `GET /consultations/{id}` - Get consultation details
- `PUT /consultations/{id}/reschedule` - Reschedule a consultation
- `DELETE /consultations/{id}/cancel` - Cancel a consultation

### Admin - Users
- `GET /admin/users` - Get all users
- `GET /admin/users/{id}` - Get user by ID
- `POST /admin/users` - Create new user
- `PUT /admin/users/{id}` - Update user
- `DELETE /admin/users/{id}` - Delete user

### Admin - Consultations
- `POST /admin/consultations/doctors` - Create doctor
- `GET /admin/consultations/doctors` - Get all doctors (including inactive)
- `GET /admin/consultations/doctors/{id}` - Get doctor details
- `PUT /admin/consultations/doctors/{id}` - Update doctor
- `DELETE /admin/consultations/doctors/{id}` - Delete doctor
- `PUT /admin/consultations/doctors/{id}/toggle` - Activate/deactivate doctor
- `POST /admin/consultations/doctors/{id}/availability` - Set doctor availability
- `GET /admin/consultations/consultations` - Get all consultations
- `GET /admin/consultations/consultations/{id}` - Get consultation details
- `PUT /admin/consultations/consultations/{id}` - Update consultation status

### Admin - Analytics & Config
- `GET /admin/systems` - Get all systems
- `GET /admin/system-config` - Get system configuration
- `PUT /admin/system-config` - Update system configuration
- `GET /admin/analytics/users` - Get user analytics
- `GET /admin/analytics/labs` - Get lab analytics
- `GET /admin/analytics/action-plans` - Get action plan analytics
- `GET /admin/lab-results` - Get all lab results
- `GET /admin/action-plans` - Get all action plans
- `GET /admin/action-plans/{id}` - Get action plan by ID
- `GET /admin/action-plans/{id}/items` - Get action plan items

## 🛠️ Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy 2.0** - Async ORM
- **asyncpg** - PostgreSQL async driver
- **Alembic** - Database migrations
- **Celery** - Distributed task queue
- **Redis** - Message broker and cache
- **boto3** - AWS S3 integration
- **pytesseract** - OCR processing
- **python-jose** - JWT tokens
- **passlib** - Password hashing

## 📦 Installation

### 1. Prerequisites

- Python 3.10+
- PostgreSQL
- Redis
- Tesseract OCR
- AWS S3 bucket

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get install tesseract-ocr poppler-utils
```

**macOS:**
```bash
brew install tesseract poppler
```

### 4. Configure Environment

```bash
cp .env.fastapi.example .env
# Edit .env with your configuration
```

### 5. Database Setup

```bash
# If starting fresh
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head

# If migrating from NestJS, your database should already be ready
```

## 🏃 Running the Application

### Development

You need THREE terminal windows:

**Terminal 1 - API Server:**
```bash
./start_api.sh
# Or: uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload
```

**Terminal 2 - Celery Worker:**
```bash
./start_celery.sh
# Or: celery -A backend.core.celery_app worker --loglevel=info
```

**Terminal 3 - Redis:**
```bash
redis-server
```

### Production

```bash
# API Server with multiple workers
uvicorn backend.main:app --host 0.0.0.0 --port 3000 --workers 4

# Celery Worker
celery -A backend.core.celery_app worker --loglevel=info --concurrency=4
```

## 📖 Documentation

Once running, access:
- **Swagger UI**: http://localhost:3000/api
- **ReDoc**: http://localhost:3000/redoc
- **OpenAPI JSON**: http://localhost:3000/openapi.json

## 🔒 Security

- JWT tokens with configurable expiration
- Bcrypt password hashing
- Tenant isolation at database level
- Bearer token authentication
- Secure file upload validation

## 🏗️ Project Structure

```
backend/
├── main.py                 # Application entry point
├── core/
│   ├── config.py          # Configuration management
│   ├── database.py        # Database connection
│   ├── security.py        # JWT and password utilities
│   ├── dependencies.py    # FastAPI dependencies
│   └── celery_app.py      # Celery configuration
├── models/                # SQLAlchemy models
│   ├── user.py
│   ├── system.py
│   ├── lab_result.py
│   ├── action_plan.py
│   └── consultation.py
├── schemas/               # Pydantic schemas
│   ├── auth.py
│   ├── lab.py
│   ├── action_plan.py
│   ├── insights.py
│   ├── profile.py
│   ├── consultation.py
│   └── admin.py
├── api/
│   └── v1/
│       ├── router.py      # Main API router
│       └── endpoints/     # API endpoints
├── services/              # Business logic
│   ├── auth_service.py
│   ├── labs_service.py
│   ├── action_plans_service.py
│   ├── insights_service.py
│   ├── profile_service.py
│   ├── consultations_service.py
│   ├── doctors_service.py
│   └── admin_service.py
└── tasks/                 # Celery tasks
    └── ocr_tasks.py

alembic/                   # Database migrations
├── env.py
└── versions/
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html
```

## 🔄 Migration from NestJS

This FastAPI application is a **complete migration** of the NestJS backend:

- ✅ All API routes are identical (backward compatible)
- ✅ Database schema is compatible (no changes needed)
- ✅ Same authentication flow (JWT tokens)
- ✅ Same file upload process
- ✅ Same background job processing
- ✅ Multi-tenant support maintained

**What's Different:**
- Response times are faster (async operations)
- Better automatic API documentation
- Type safety with Pydantic
- Simpler dependency injection

See `MIGRATION_GUIDE.md` for detailed migration information.

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Verify DATABASE_URL uses postgresql+asyncpg://
# Example: postgresql+asyncpg://user:pass@localhost:5432/db
```

### Celery Not Processing Tasks
```bash
# Check Redis is running
redis-cli ping  # Should return PONG

# Check Celery broker URL
echo $CELERY_BROKER_URL
```

### OCR Fails
```bash
# Verify Tesseract is installed
tesseract --version

# Check it's in PATH
which tesseract
```

## 📊 Performance

- **Async I/O**: All database and file operations are non-blocking
- **Connection Pooling**: Configured with pool_size=10, max_overflow=20
- **Background Processing**: Heavy operations offloaded to Celery
- **Caching**: Ready for Redis caching implementation

## 🔧 Configuration

All configuration is managed through environment variables (`.env` file):

```env
DATABASE_URL=postgresql+asyncpg://...
JWT_SECRET=your-secret-key
REDIS_HOST=localhost
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
```

See `.env.fastapi.example` for all available options.

## 📝 Logging

Logs are output to stdout/stderr. Configure log level:

```python
# In backend/main.py
logging.basicConfig(level=logging.INFO)
```

## 🚢 Deployment

### Using Docker (Recommended)

```bash
# Build image
docker build -t health-platform-api .

# Run with docker-compose
docker-compose up -d
```

### Using Gunicorn

```bash
gunicorn backend.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:3000
```

### Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Strong random secret
- `REFRESH_TOKEN_SECRET` - Different strong secret
- `AWS_*` - AWS credentials
- `REDIS_HOST` - Redis server

## 📈 Monitoring

Consider adding:
- **Sentry** - Error tracking
- **DataDog/New Relic** - APM
- **Prometheus** - Metrics
- **ELK Stack** - Log aggregation

## 🤝 Contributing

1. Ensure all tests pass
2. Follow PEP 8 style guidelines
3. Add type hints to all functions
4. Update documentation for new features

## 📄 License

[Your License Here]

## 🙋 Support

For issues or questions:
1. Check `MIGRATION_GUIDE.md`
2. Review FastAPI docs: https://fastapi.tiangolo.com/
3. Check project issues

---

**Built with ❤️ using FastAPI**
