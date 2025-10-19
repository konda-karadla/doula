# 🐳 Backend Docker Services Guide

## Overview

This setup runs **Redis and Celery Worker in Docker** while allowing you to run the **FastAPI backend locally** for development.

---

## 🚀 Quick Start

### **One Command Setup:**

#### **Normal Development:**
```bash
# From the backend directory
cd backend

# Windows PowerShell
.\dev_start.ps1

# Linux/Mac
./dev_start.sh
```

#### **Debug Mode (VS Code):**
1. **Open VS Code** in the `backend` directory
2. **Press F5** or go to Run → Start Debugging
3. **Select "Debug FastAPI Backend"** configuration
4. **Set breakpoints** and debug your code

**That's it!** This will:
1. Start Redis and Celery in Docker containers
2. Start FastAPI locally with auto-reload
3. Make API available at http://localhost:3002

---

## 📊 Services Configuration

| Service | Location | Port | Description |
|---------|----------|------|-------------|
| **Redis** | Docker | 6379 | Cache and task queue |
| **Celery Worker** | Docker | - | Background task processing |
| **FastAPI API** | Local | 3002 | Main API server |
| **Database** | AWS RDS | External | PostgreSQL database |

---

## 🔧 Environment Setup

### Local Development Environment
Your local `.env` file (in the backend directory) should have:
```bash
# Database (AWS RDS)
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint.amazonaws.com:5432/mediqal

# Redis (Docker container)
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
```

---

## 🐛 Debugging with VS Code

### **Quick Start:**
1. **Open VS Code** in the `backend` directory: `code .`
2. **Press F5** to start debugging
3. **Select configuration**:
   - "Debug FastAPI Backend" - Basic debugging (start Docker manually first)
   - "Debug FastAPI (Auto Docker)" - Auto-starts Docker services before debugging
4. **Set breakpoints** and debug your code

### **📖 Detailed Guide:**
See **[VSCODE_DEBUG_GUIDE.md](./VSCODE_DEBUG_GUIDE.md)** for comprehensive debugging instructions, shortcuts, and troubleshooting.

---

## 🛠️ Development Workflow

### Daily Development
```bash
# 1. Start everything (one command)
cd backend
./dev_start.sh    # Linux/Mac
# or
.\dev_start.ps1   # Windows

# 2. Make code changes - FastAPI auto-reloads
# 3. Test your changes at http://localhost:3002/docs
# 4. Stop with Ctrl+C
```

### Database Migrations
```bash
# Run migrations locally
cd backend
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Add new feature"
alembic upgrade head
```

### Stop Services
```bash
# Stop FastAPI: Ctrl+C
# Stop Docker services:
cd backend
docker-compose down
```

---

## 📋 Useful Commands

### Docker Services Management
```bash
# Start only Docker services (without FastAPI)
cd backend && docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart
```

### Service Status
```bash
# Check Docker services
docker ps

# Check if Redis is accessible
redis-cli ping

# Test API
curl http://localhost:3002/docs
```

---

## 🔍 Troubleshooting

### Redis Connection Issues
```bash
# Check if Redis container is running
docker ps | grep redis

# Check Redis logs
docker-compose logs redis

# Test Redis connection
docker-compose exec redis redis-cli ping
```

### FastAPI Issues
```bash
# Check if port 3002 is available
netstat -an | grep 3002

# Check FastAPI logs for errors
# Look at the terminal where you started the API
```

### Celery Issues
```bash
# Check Celery worker logs
docker-compose logs celery_worker

# Restart Celery worker
docker-compose restart celery_worker
```

---

## 🎯 Benefits of This Setup

1. **One Command Start** - `./dev_start.sh` starts everything
2. **Fast Development** - FastAPI runs locally with auto-reload
3. **Isolated Services** - Redis and Celery in Docker containers
4. **Easy Debugging** - Local FastAPI with full debugging capabilities
5. **Consistent Environment** - Redis and Celery always in the same state

---

## 📝 Development Tips

### Hot Reloading
- FastAPI automatically reloads when you change Python files
- No need to restart the API server for code changes
- Docker services stay running in the background

### Database Changes
- Run migrations locally: `alembic upgrade head`
- Test database changes immediately
- No need to rebuild Docker containers

### Testing
- Test API endpoints at http://localhost:3002/docs
- Check Redis operations through your application
- Monitor Celery tasks in Docker logs

---

## 🚀 Next Steps

1. **Start development**: `cd backend && ./dev_start.sh`
2. **Open API docs**: http://localhost:3002/docs
3. **Start coding**: Make changes and see them auto-reload!

Happy coding! 🎉