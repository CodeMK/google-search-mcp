#!/bin/bash

# Google Search MCP - Quick Setup Script

set -e

echo "================================================"
echo "  Google Search MCP - Setup & Start"
echo "================================================"
echo ""

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null || echo "none")
if [ "$NODE_VERSION" = "none" ]; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
fi
echo "✅ Node.js version: $NODE_VERSION"
echo ""

# Install dependencies
echo "Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Install Playwright browser
echo "Installing Playwright Chromium browser..."
npx playwright install chromium
echo "✅ Playwright browser installed"
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  Please edit .env file to configure your settings"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"
echo ""

echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Available commands:"
echo "  npm run dev       - Start development server"
echo "  npm run dev:watch - Start with hot reload"
echo "  npm run build     - Build for production"
echo "  npm start         - Start production server"
echo ""
echo "API will be available at: http://localhost:3000"
echo ""
echo "Quick test:"
echo "  curl -X POST http://localhost:3000/api/search \\"
echo "    -H \"Content-Type: application/json\" \\"
echo "    -d '{\"query\":\"test\"}'"
echo ""
echo "================================================"
