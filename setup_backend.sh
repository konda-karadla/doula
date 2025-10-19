#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Health Platform Backend - Setup Script${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo -e "${BLUE}Checking Python version...${NC}"
echo "Found: Python $PYTHON_VERSION"

if ! python3 -c "Python dependencies; sys.exit(0 if sys.version_info >= (3, 10) else 1)"; then
    echo -e "${RED}ERROR: Python 3.10 or higher is required${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python version OK${NC}"
echo ""

# Create virtual environment
echo -e "${BLUE}Creating virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi

# Activate virtual environment
source venv/bin/activate
echo ""

# Install dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from example...${NC}"
    cp .env.fastapi.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠ IMPORTANT: Edit .env file with your configuration!${NC}"
    echo ""
    echo "Required settings:"
    echo "  - DATABASE_URL (Supabase connection string)"
    echo "  - JWT_SECRET (generate with: python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
    echo "  - REFRESH_TOKEN_SECRET (generate another secret)"
    echo "  - AWS credentials (for S3 file storage)"
    echo ""
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Check Redis
echo -e "${BLUE}Checking Redis...${NC}"
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✓ Redis is running${NC}"
    else
        echo -e "${YELLOW}Redis is installed but not running${NC}"
        echo "Start it with: redis-server"
    fi
else
    echo -e "${YELLOW}Redis not found${NC}"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo "  macOS: brew install redis"
fi
echo ""

# Check Tesseract
echo -e "${BLUE}Checking Tesseract OCR...${NC}"
if command -v tesseract &> /dev/null; then
    TESS_VERSION=$(tesseract --version 2>&1 | head -1)
    echo "Found: $TESS_VERSION"
    echo -e "${GREEN}✓ Tesseract is installed${NC}"
else
    echo -e "${YELLOW}Tesseract not found${NC}"
    echo "Install it with:"
    echo "  Ubuntu/Debian: sudo apt-get install tesseract-ocr"
    echo "  macOS: brew install tesseract"
fi
echo ""

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
if [ -f .env ]; then
    if alembic upgrade head 2>&1; then
        echo -e "${GREEN}✓ Database migrations complete${NC}"
    else
        echo -e "${YELLOW}⚠ Could not run migrations (check DATABASE_URL in .env)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Skipping migrations (no .env file)${NC}"
fi
echo ""

# Summary
echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Setup Complete!${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""
echo -e "${GREEN}Next steps:${NC}"
echo ""
echo "1. Configure environment:"
echo "   nano .env"
echo ""
echo "2. Start all services:"
echo "   ./start_all.sh"
echo ""
echo "3. Or start services individually:"
echo "   Terminal 1: ./start_api.sh"
echo "   Terminal 2: ./start_celery.sh"
echo "   Terminal 3: redis-server"
echo ""
echo -e "${GREEN}API will be available at:${NC}"
echo "   http://localhost:3000/api/v1"
echo "   http://localhost:3000/api (Swagger docs)"
echo ""
echo -e "${BLUE}For more help, see:${NC}"
echo "   QUICK_START_BACKEND.md"
echo ""
