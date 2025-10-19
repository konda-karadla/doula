#!/bin/bash

set -e

echo "=================================================="
echo "FastAPI Health Platform - Setup Script"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Python version
echo "Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.10"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}Error: Python $required_version or higher is required${NC}"
    echo "Current version: $python_version"
    exit 1
fi
echo -e "${GREEN}✓ Python $python_version${NC}"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment exists${NC}"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install dependencies
echo ""
echo "Installing Python dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check for .env file
echo ""
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}! .env file not found${NC}"
    echo "Creating .env from template..."
    cp .env.fastapi.example .env
    echo -e "${YELLOW}! Please edit .env file with your configuration${NC}"
    echo ""
    read -p "Press enter to continue..."
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Check Tesseract
echo ""
echo "Checking Tesseract OCR..."
if command -v tesseract &> /dev/null; then
    tesseract_version=$(tesseract --version 2>&1 | head -n1)
    echo -e "${GREEN}✓ $tesseract_version${NC}"
else
    echo -e "${RED}✗ Tesseract OCR not found${NC}"
    echo "Please install Tesseract:"
    echo "  Ubuntu/Debian: sudo apt-get install tesseract-ocr poppler-utils"
    echo "  macOS: brew install tesseract poppler"
fi

# Check Redis
echo ""
echo "Checking Redis..."
if command -v redis-server &> /dev/null; then
    redis_version=$(redis-server --version | awk '{print $3}')
    echo -e "${GREEN}✓ Redis $redis_version${NC}"
else
    echo -e "${YELLOW}! Redis not found${NC}"
    echo "Please install Redis:"
    echo "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo "  macOS: brew install redis"
fi

# Check PostgreSQL
echo ""
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    pg_version=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓ PostgreSQL $pg_version${NC}"
else
    echo -e "${YELLOW}! PostgreSQL client not found${NC}"
    echo "Please install PostgreSQL"
fi

# Make scripts executable
echo ""
echo "Making scripts executable..."
chmod +x start_api.sh start_celery.sh verify_fastapi.py
echo -e "${GREEN}✓ Scripts are executable${NC}"

# Run verification
echo ""
echo "Running verification..."
python3 verify_fastapi.py

echo ""
echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start Redis: redis-server"
echo "3. Run migrations: alembic upgrade head"
echo "4. Start API: ./start_api.sh"
echo "5. Start Celery: ./start_celery.sh"
echo ""
echo "API will be available at: http://localhost:3000"
echo "Documentation at: http://localhost:3000/api"
echo ""
echo "For detailed instructions, see:"
echo "  - README_FASTAPI.md"
echo "  - MIGRATION_GUIDE.md"
echo ""
