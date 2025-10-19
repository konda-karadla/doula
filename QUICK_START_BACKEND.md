# FastAPI Backend - Quick Start Guide

## 📋 Prerequisites

### Required Software

1. **Python 3.10 or higher**
   ```bash
   python3 --version  # Should be 3.10+
   ```

2. **PostgreSQL** (or use Supabase)
   - Option A: Local PostgreSQL
   - Option B: Supabase (recommended - already configured)

3. **Redis** (for background tasks)
   ```bash
   # Check if Redis is installed
   redis-cli --version
   ```

4. **Tesseract OCR** (for lab result processing)
   ```bash
   # Check if Tesseract is installed
   tesseract --version
   ```

---

## 🔧 Installation

### Step 1: Install System Dependencies

#### Ubuntu/Debian
```bash
# Update package list
sudo apt-get update

# Install Python 3.10+
sudo apt-get install python3.10 python3-pip python3-venv

# Install PostgreSQL (if not using Supabase)
sudo apt-get install postgresql postgresql-contrib

# Install Redis
sudo apt-get install redis-server

# Install Tesseract OCR
sudo apt-get install tesseract-ocr poppler-utils
```

#### macOS
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python 3.10+
brew install python@3.10

# Install PostgreSQL (if not using Supabase)
brew install postgresql@14

# Install Redis
brew install redis

# Install Tesseract
brew install tesseract poppler
```

#### Windows
```powershell
# Install Python from python.org
# Download and install from: https://www.python.org/downloads/

# Install PostgreSQL (if not using Supabase)
# Download from: https://www.postgresql.org/download/windows/

# Install Redis (use WSL or Docker)
# Or download from: https://github.com/microsoftarchive/redis/releases

# Install Tesseract
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

### Step 2: Install Python Dependencies

```bash
cd /tmp/cc-agent/58903492/project

# Create virtual environment (recommended)
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

---

## ⚙️ Configuration

### Step 3: Set Up Environment Variables

```bash
# Copy example environment file
cp .env.fastapi.example .env

# Edit the .env file with your configuration
nano .env  # or use your preferred editor
```

### Required Environment Variables

```env
# Database (Supabase - Recommended)
DATABASE_URL=postgresql+asyncpg://user:password@host:port/database

# If using Supabase, format:
# DATABASE_URL=postgresql+asyncpg://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# JWT Secrets (generate random strings)
JWT_SECRET=your-super-secret-jwt-key-change-this
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis (for Celery)
REDIS_HOST=localhost
REDIS_PORT=6379
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name

# Application
API_V1_PREFIX=/api/v1
PROJECT_NAME=Health Platform API
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3002

# Environment
ENVIRONMENT=development
```

### Generate Secure Secrets

```bash
# Generate random secrets for JWT
python3 -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(32))"
python3 -c "import secrets; print('REFRESH_TOKEN_SECRET=' + secrets.token_urlsafe(32))"
```

---

## 🗄️ Database Setup

### Option A: Using Supabase (Recommended)

Your Supabase database is already configured. Just run migrations:

```bash
# Run database migrations
alembic upgrade head
```

### Option B: Using Local PostgreSQL

```bash
# Start PostgreSQL
sudo systemctl start postgresql  # Linux
brew services start postgresql@14  # macOS

# Create database
sudo -u postgres createdb health_platform

# Update .env with local connection
# DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/health_platform

# Run migrations
alembic upgrade head
```

---

## 🚀 Running the Backend

You need **3 terminal windows** running simultaneously:

### Terminal 1: API Server

```bash
cd /tmp/cc-agent/58903492/project

# Activate virtual environment (if using)
source venv/bin/activate

# Start FastAPI server
uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload

# Or use the startup script
./start_api.sh
```

**Server will be available at:**
- API: http://localhost:3000/api/v1
- Docs: http://localhost:3000/api (Swagger UI)
- ReDoc: http://localhost:3000/redoc

### Terminal 2: Celery Worker (for background tasks)

```bash
cd /tmp/cc-agent/58903492/project

# Activate virtual environment (if using)
source venv/bin/activate

# Start Celery worker
celery -A backend.core.celery_app worker --loglevel=info

# Or use the startup script
./start_celery.sh
```

### Terminal 3: Redis Server

```bash
# Start Redis
redis-server

# Or as a service:
# Linux:
sudo systemctl start redis
# macOS:
brew services start redis
```

---

## ✅ Verify Installation

### 1. Check API is running
```bash
curl http://localhost:3000/health
# Should return: {"status": "healthy"}
```

### 2. Check API documentation
Open in browser: http://localhost:3000/api

### 3. Check Redis connection
```bash
redis-cli ping
# Should return: PONG
```

### 4. Check database connection
```bash
# In Python console
python3
>>> from backend.core.database import engine
>>> # If no errors, database is connected
```

### 5. Test OCR (optional)
```bash
tesseract --version
# Should show version info
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

```bash
# Make sure you're in the project directory
cd /tmp/cc-agent/58903492/project

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Database connection failed

```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# For Supabase, ensure format is:
# postgresql+asyncpg://postgres.[ref]:[password]@[host]:5432/postgres

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Redis connection failed

```bash
# Check if Redis is running
redis-cli ping

# Start Redis if not running
redis-server

# Or as a service
sudo systemctl start redis  # Linux
brew services start redis   # macOS
```

### Issue: Port 3000 already in use

```bash
# Find what's using port 3000
lsof -i :3000  # Linux/macOS
# netstat -ano | findstr :3000  # Windows

# Kill the process or use a different port
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Issue: Celery worker not starting

```bash
# Check Redis is running
redis-cli ping

# Check CELERY_BROKER_URL in .env
echo $CELERY_BROKER_URL

# Try running with verbose logging
celery -A backend.core.celery_app worker --loglevel=debug
```

---

## 📦 Dependencies Installed

When you run `pip install -r requirements.txt`, these are installed:

### Core Framework
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `pydantic` - Data validation
- `pydantic-settings` - Settings management

### Database
- `sqlalchemy` - ORM
- `asyncpg` - PostgreSQL async driver
- `alembic` - Database migrations
- `psycopg2-binary` - PostgreSQL adapter

### Authentication
- `python-jose[cryptography]` - JWT tokens
- `passlib[bcrypt]` - Password hashing
- `python-multipart` - Form data parsing

### Background Tasks
- `celery` - Task queue
- `redis` - Message broker

### File Processing
- `boto3` - AWS S3
- `pytesseract` - OCR
- `pdf2image` - PDF processing
- `Pillow` - Image processing

### Utilities
- `python-dotenv` - Environment variables
- `httpx` - HTTP client

### Testing
- `pytest` - Testing framework
- `pytest-asyncio` - Async test support

---

## 🎯 Quick Commands Reference

```bash
# Start API server
uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload

# Start Celery worker
celery -A backend.core.celery_app worker --loglevel=info

# Start Redis
redis-server

# Run database migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Run tests
pytest

# Check API health
curl http://localhost:3000/health
```

---

## 📚 Additional Resources

- **API Documentation**: http://localhost:3000/api
- **Full Documentation**: [README_FASTAPI.md](./README_FASTAPI.md)
- **Migration Guide**: [COMPLETE_MIGRATION_SUMMARY.md](./COMPLETE_MIGRATION_SUMMARY.md)
- **Troubleshooting**: Check logs in terminal windows

---

## 🎉 You're Ready!

Once all three services are running:
1. ✅ FastAPI server (port 3000)
2. ✅ Celery worker
3. ✅ Redis server

Your backend is fully operational and ready to handle requests!

**Test it out:**
```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "systemSlug": "default",
    "profileType": "patient",
    "journeyType": "wellness"
  }'
```
