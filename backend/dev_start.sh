#!/bin/bash

# Development Startup Script
# Starts Docker services + FastAPI locally

echo "🚀 Starting Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running!"
    echo "Please start Docker first"
    exit 1
fi

# Start Docker services (Redis + Celery)
echo "🐳 Starting Docker services (Redis + Celery)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 3

# Check if services are running
echo "🔍 Checking Docker services..."
docker-compose ps

echo ""
echo "✅ Docker services are running!"
echo ""
echo "🚀 Now starting FastAPI locally..."
echo "📊 API will be available at: http://localhost:3002"
echo "📚 API docs will be at: http://localhost:3002/docs"
echo ""
echo "💡 To stop: Ctrl+C for FastAPI, then 'docker-compose down' for Docker services"
echo ""

# Start FastAPI locally
echo "Starting FastAPI server..."
uvicorn backend.main:app --host 0.0.0.0 --port 3002 --reload
