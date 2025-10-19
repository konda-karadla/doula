# Development Startup Script
# Starts Docker services + FastAPI locally

Write-Host "🚀 Starting Development Environment..." -ForegroundColor Cyan

# Check if Docker is running
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  Docker Desktop is not running!" -ForegroundColor Yellow
    Write-Host "Please start Docker Desktop first" -ForegroundColor Yellow
    exit 1
}

# Start Docker services (Redis + Celery)
Write-Host "🐳 Starting Docker services (Redis + Celery)..." -ForegroundColor Cyan
docker-compose up -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if services are running
Write-Host "🔍 Checking Docker services..." -ForegroundColor Cyan
docker-compose ps

Write-Host ""
Write-Host "✅ Docker services are running!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Now starting FastAPI locally..." -ForegroundColor Cyan
Write-Host "📊 API will be available at: http://localhost:3002" -ForegroundColor White
Write-Host "📚 API docs will be at: http://localhost:3002/docs" -ForegroundColor White
Write-Host ""
Write-Host "💡 To stop: Ctrl+C for FastAPI, then 'docker-compose down' for Docker services" -ForegroundColor Gray
Write-Host ""

# Start FastAPI locally
Write-Host "Starting FastAPI server..." -ForegroundColor Green
uvicorn backend.main:app --host 0.0.0.0 --port 3002 --reload
