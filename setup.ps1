# Google Search MCP - Quick Setup Script for Windows

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Google Search MCP - Setup & Start" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Install dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Install Playwright browser
Write-Host "Installing Playwright Chromium browser..." -ForegroundColor Yellow
npx playwright install chromium
Write-Host "✅ Playwright browser installed" -ForegroundColor Green
Write-Host ""

# Create .env if not exists
if (!(Test-Path .env)) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please edit .env file to configure your settings" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Create logs directory
New-Item -ItemType Directory -Force -Path logs | Out-Null
Write-Host "✅ Logs directory created" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Available commands:" -ForegroundColor White
Write-Host "  npm run dev       - Start development server" -ForegroundColor Gray
Write-Host "  npm run dev:watch - Start with hot reload" -ForegroundColor Gray
Write-Host "  npm run build     - Build for production" -ForegroundColor Gray
Write-Host "  npm start         - Start production server" -ForegroundColor Gray
Write-Host ""
Write-Host "API will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Quick test:" -ForegroundColor White
Write-Host '  curl -X POST http://localhost:3000/api/search' -ForegroundColor Gray
Write-Host '    -H "Content-Type: application/json"' -ForegroundColor Gray
Write-Host '    -d "{\"query\":\"test\"}"' -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
