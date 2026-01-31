#!/bin/bash

# API Test Suite Setup and Execution Script
# This script sets up the test environment and runs all tests

set -e  # Exit on error

echo "🧪 ======================================"
echo "🧪 API Test Suite Setup & Execution"
echo "🧪 ======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${YELLOW}📦 Step 1: Installing test dependencies...${NC}"
npm install --save-dev supertest @types/supertest
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Check if PostgreSQL is running
echo -e "${YELLOW}🔍 Step 2: Checking PostgreSQL status...${NC}"
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo "Please start PostgreSQL with one of these commands:"
    echo "  - brew services start postgresql"
    echo "  - sudo service postgresql start"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Step 3: Create test database
echo -e "${YELLOW}🗄️  Step 3: Creating test database...${NC}"

# Check if database exists
if PGPASSWORD=admin123 psql -U postgres -lqt | cut -d \| -f 1 | grep -qw schoolManagement_test; then
    echo "Test database already exists"
    read -p "Do you want to drop and recreate it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PGPASSWORD=admin123 dropdb -U postgres schoolManagement_test 2>/dev/null || true
        PGPASSWORD=admin123 createdb -U postgres schoolManagement_test
        echo -e "${GREEN}✅ Test database recreated${NC}"
    fi
else
    PGPASSWORD=admin123 createdb -U postgres schoolManagement_test
    echo -e "${GREEN}✅ Test database created${NC}"
fi
echo ""

# Step 4: Run migrations on test database
echo -e "${YELLOW}🔄 Step 4: Running migrations on test database...${NC}"
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/schoolManagement_test" npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations applied${NC}"
echo ""

# Step 5: Run tests
echo -e "${YELLOW}🧪 Step 5: Running tests...${NC}"
echo ""

# Check if user wants to run specific tests
if [ -z "$1" ]; then
    echo "Running ALL tests..."
    npm test
else
    echo "Running specific test: $1"
    npm test -- "$1"
fi

echo ""
echo -e "${GREEN}🎉 ======================================"
echo -e "${GREEN}🎉 Test Suite Execution Complete!"
echo -e "${GREEN}🎉 ======================================${NC}"
