#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Health Platform Backend - Starting All Services${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.fastapi.example to .env and configure it${NC}"
    echo "  cp .env.fastapi.example .env"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}ERROR: Python 3 not found!${NC}"
    echo "Please install Python 3.10 or higher"
    exit 1
fi

# Check Redis
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}WARNING: Redis not found. Please install Redis.${NC}"
    echo "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo "  macOS: brew install redis"
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}Starting Redis...${NC}"
    if command -v redis-server &> /dev/null; then
        redis-server --daemonize yes
        sleep 2
    else
        echo -e "${RED}ERROR: Redis server not found. Please start Redis manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Redis is running${NC}"

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo -e "${GREEN}✓ Virtual environment found${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}No virtual environment found. Using system Python.${NC}"
fi

# Check dependencies
echo -e "${BLUE}Checking Python dependencies...${NC}"
if ! python3 -c "import fastapi" &> /dev/null; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pip install -r requirements.txt
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check database migrations
echo -e "${BLUE}Checking database migrations...${NC}"
alembic current &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    alembic upgrade head
fi

echo -e "${GREEN}✓ Database migrations up to date${NC}"
echo ""

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Starting Services${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}API Server:${NC}      http://localhost:3000"
echo -e "${GREEN}API Docs:${NC}        http://localhost:3000/api"
echo -e "${GREEN}ReDoc:${NC}           http://localhost:3000/redoc"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Function to handle cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill 0
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start API server in background
echo -e "${BLUE}[1/2] Starting FastAPI server...${NC}"
uvicorn backend.main:app --host 0.0.0.0 --port 3000 --reload &
API_PID=$!

# Wait a moment for API to start
sleep 2

# Start Celery worker in background
echo -e "${BLUE}[2/2] Starting Celery worker...${NC}"
celery -A backend.core.celery_app worker --loglevel=info &
CELERY_PID=$!

# Wait for both processes
wait
