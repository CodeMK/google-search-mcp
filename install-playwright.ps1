# Playwright 安装脚本
Write-Host "=" * 60
Write-Host "  Playwright Chromium 安装脚本"
Write-Host "=" * 60
Write-Host ""

# 1. 清理锁文件
Write-Host "[1/4] 清理锁文件..." -ForegroundColor Cyan
$lockPath = "$env:LOCALAPPDATA\ms-playwright\__dirlock"
if (Test-Path $lockPath) {
    Remove-Item -Recurse -Force $lockPath -ErrorAction SilentlyContinue
    Write-Host "  锁文件已删除" -ForegroundColor Green
} else {
    Write-Host "  无锁文件需要清理" -ForegroundColor Gray
}
Write-Host ""

# 2. 设置镜像源
Write-Host "[2/4] 配置镜像源..." -ForegroundColor Cyan
$env:PLAYWRIGHT_DOWNLOAD_HOST = "https://npmmirror.com/mirrors/playwright"
Write-Host "  使用中国镜像源" -ForegroundColor Green
Write-Host ""

# 3. 安装 Chromium
Write-Host "[3/4] 开始安装 Chromium..." -ForegroundColor Cyan
Write-Host "  这可能需要几分钟，请耐心等待..." -ForegroundColor Yellow
Write-Host ""

Set-Location "D:\google-search-mcp"
& npx playwright install chromium

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  安装成功！" -ForegroundColor Green
    Write-Host ""

    # 4. 验证安装
    Write-Host "[4/4] 验证安装..." -ForegroundColor Cyan
    & npx playwright list
} else {
    Write-Host ""
    Write-Host "  安装失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "故障排除建议：" -ForegroundColor Yellow
    Write-Host "1. 检查网络连接"
    Write-Host "2. 尝试手动下载浏览器"
    Write-Host "   访问: https://playwright.dev/docs/cli"
    Write-Host "   或中国镜像: https://npmmirror.com/mirrors/playwright/"
}

Write-Host ""
Write-Host "=" * 60
Write-Host "  安装脚本执行完毕"
Write-Host "=" * 60
