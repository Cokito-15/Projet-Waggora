#!/bin/bash

# Waggora MVP Setup Script

set -e

echo "🚀 Starting Waggora MVP Setup..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo "${RED}Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
echo "${YELLOW}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo "${RED}npm not found${NC}"
    exit 1
fi
echo "${GREEN}✓ npm $(npm --version)${NC}"

# Install dependencies
echo "${YELLOW}Installing dependencies...${NC}"
npm install
echo "${GREEN}✓ Dependencies installed${NC}"

# Setup environment files
echo "${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo "${GREEN}✓ Created .env${NC}"
else
    echo "${YELLOW}⚠ .env already exists${NC}"
fi

if [ ! -f apps/api/.env ]; then
    cp apps/api/.env.example apps/api/.env
    echo "${GREEN}✓ Created apps/api/.env${NC}"
else
    echo "${YELLOW}⚠ apps/api/.env already exists${NC}"
fi

if [ ! -f apps/web/.env ]; then
    cp apps/web/.env.example apps/web/.env
    echo "${GREEN}✓ Created apps/web/.env${NC}"
else
    echo "${YELLOW}⚠ apps/web/.env already exists${NC}"
fi

if [ ! -f packages/db/.env ]; then
    cp packages/db/.env.example packages/db/.env
    echo "${GREEN}✓ Created packages/db/.env${NC}"
else
    echo "${YELLOW}⚠ packages/db/.env already exists${NC}"
fi

# Setup database
echo "${YELLOW}Setting up database...${NC}"
echo "Starting Docker containers..."
docker-compose up -d
echo "${GREEN}✓ Docker containers started${NC}"

# Wait for database
echo "${YELLOW}Waiting for database to be ready...${NC}"
sleep 5

echo "${YELLOW}Running database migrations...${NC}"
npm run db:setup
echo "${GREEN}✓ Database setup complete${NC}"

echo ""
echo "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "${YELLOW}Next steps:${NC}"
echo "1. Update .env files with your configuration"
echo "2. Run: ${GREEN}npm run dev${NC}"
echo "3. Open: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "${YELLOW}Useful commands:${NC}"
echo "  npm run dev          - Start development servers"
echo "  npm run db:studio    - Open Prisma Studio"
echo "  npm run build        - Build for production"
echo "  npm run test         - Run tests"
echo ""
