@echo off
echo Installing Playwright Chromium with China mirror...
rmdir /S /Q "%LOCALAPPDATA%\ms-playwright\__dirlock" 2>nul
set PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright
cd /d D:\search-mcp
npx playwright install chromium
echo Installation complete!
