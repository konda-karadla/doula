# NestJS to FastAPI Migration Guide

This document provides instructions for running the new FastAPI backend.

## What Was Migrated

The entire NestJS backend has been successfully migrated to FastAPI with the following features:

### ✅ Completed Features

1. **Project Foundation**
   - FastAPI application with async/await support
   - Structured project layout following FastAPI best practices
   - CORS middleware configuration
   - Health check endpoints

2. **Database Layer**
   - Async SQLAlchemy with asyncpg for PostgreSQL
   - All Prisma models converted to SQLAlchemy models
   - Alembic for database migrations
   - Multi-tenant support maintained

3. **Authentication & Authorization**
   - JWT-based authentication with access and refresh tokens
   - Password hashing with bcrypt
   - Protected route dependencies
   - Tenant isolation guards

4. **API Endpoints** (Same routes as NestJS)
   - `/auth/register` - User registration
   - `/auth/login` - User login
   - `/auth/refresh` - Token refresh
   - `/auth/logout` - User logout
   - `/labs/upload` - Lab result upload with file handling
   - `/labs` - Get all lab results
   - `/labs/{id}` - Get specific lab result
   - `/labs/{id}/biomarkers` - Get biomarkers for a lab result
   - `/labs/{id}` (DELETE) - Delete lab result
   - `/action-plans` - CRUD operations for action plans
   - `/action-plans/{planId}/items` - CRUD operations for action items
   - `/insights/summary` - Get health insights summary
   - `/insights/lab-result/{labResultId}` - Get insights for specific lab
   - `/insights/trends/{testName}` - Get biomarker trends
   - `/profile` - Get user profile
   - `/profile/stats` - Get health statistics

5. **Background Processing**
   - Celery with Redis for asynchronous task processing
   - OCR processing for PDF lab results
   - Biomarker parsing from OCR text

6. **File Storage**
   - AWS S3 integration using boto3
   - File upload and download
   - Presigned URLs for secure access

7. **OCR Processing**
   - pytesseract for text extraction from PDFs
   - Biomarker parsing with pattern matching

## Prerequisites

- Python 3.10 or higher
- PostgreSQL database
- Redis server
- AWS S3 bucket (for file storage)
- Tesseract OCR installed on your system

## Installation

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Install Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install poppler-utils  # For PDF processing
```

**macOS:**
```bash
brew install tesseract
brew install poppler
```

**Windows:**
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

### 3. Environment Configuration

Copy the example environment file and update with your values:

```bash
cp .env.fastapi.example .env
```

Update the following variables in `.env`:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Your JWT secret key
- `REFRESH_TOKEN_SECRET` - Your refresh token secret
- `AWS_ACCESS_KEY_ID` - Your AWS access key
- `AWS_SECRET_ACCESS_KEY` - Your AWS secret key
- `S3_BUCKET_NAME` - Your S3 bucket name
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)

### 4. Database Setup

The database schema should already exist from your NestJS application. If starting fresh:

```bash
# Initialize Alembic migrations
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

## Running the Application

### Development Mode

You need to run THREE separate processes:

#### Terminal 1: FastAPI Server
```bash
chmod +x start_api.sh
./start_api.sh
```

Or manually:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 3000 --reload
```

#### Terminal 2: Celery Worker
```bash
chmod +x start_celery.sh
./start_celery.sh
```

Or manually:
```bash
celery -A app.core.celery_app worker --loglevel=info
```

#### Terminal 3: Redis Server
```bash
redis-server
```

### Production Mode

For production, use a process manager like Supervisor or systemd:

```bash
# Start API
uvicorn app.main:app --host 0.0.0.0 --port 3000 --workers 4

# Start Celery worker
celery -A app.core.celery_app worker --loglevel=info --concurrency=4
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **ReDoc**: http://localhost:3000/redoc
- **Health Check**: http://localhost:3000/health

## Key Differences from NestJS

### 1. Response Format
FastAPI automatically converts snake_case model fields to camelCase in responses using custom serialization methods in schemas.

### 2. Dependency Injection
Instead of NestJS decorators like `@CurrentUser()`, FastAPI uses:
```python
current_user: CurrentUser = Depends(get_current_user)
```

### 3. File Upload
File uploads use `UploadFile` from FastAPI:
```python
file: UploadFile = File(...)
```

### 4. Async/Await
All database operations and I/O operations are async:
```python
async def get_user(user_id: str):
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()
```

### 5. Background Tasks
Celery tasks are defined as regular functions decorated with `@celery_app.task`.

## Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests (when implemented)
pytest
```

## Migration Checklist

- [x] Database models migrated
- [x] Authentication system implemented
- [x] All API endpoints migrated
- [x] File upload functionality
- [x] Background job processing
- [x] S3 integration
- [x] OCR processing
- [x] Multi-tenant support
- [x] API documentation
- [ ] Update frontend to use new API (if needed)
- [ ] Add comprehensive tests
- [ ] Set up monitoring and logging
- [ ] Deploy to production

## Troubleshooting

### Issue: "Could not import module 'app'"
**Solution**: Make sure you're in the project root directory and the virtual environment is activated.

### Issue: Celery worker not processing tasks
**Solution**: Ensure Redis is running and the `CELERY_BROKER_URL` is correctly configured.

### Issue: OCR fails with "Tesseract not found"
**Solution**: Install Tesseract OCR on your system and ensure it's in your PATH.

### Issue: Database connection fails
**Solution**: Verify your `DATABASE_URL` is correct and PostgreSQL is running. Make sure to use `postgresql+asyncpg://` prefix for async support.

### Issue: S3 upload fails
**Solution**: Verify AWS credentials and bucket permissions. Ensure the bucket exists and is in the correct region.

## Performance Considerations

1. **Database Connection Pool**: Configured in `app/core/database.py` with `pool_size=10` and `max_overflow=20`
2. **Async Operations**: All I/O operations are async for better performance
3. **Background Tasks**: Heavy operations (OCR) run in Celery workers
4. **Caching**: Consider adding Redis caching for frequently accessed data

## Next Steps

1. Test all endpoints with the existing frontend
2. Add comprehensive unit and integration tests
3. Set up CI/CD pipeline
4. Configure production environment variables
5. Set up monitoring (e.g., Sentry, DataDog)
6. Add rate limiting for API endpoints
7. Implement request/response logging

## Support

For issues or questions about the migration, please refer to:
- FastAPI documentation: https://fastapi.tiangolo.com/
- SQLAlchemy async documentation: https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html
- Celery documentation: https://docs.celeryq.dev/
