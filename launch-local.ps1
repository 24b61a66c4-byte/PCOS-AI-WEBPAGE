#!/usr/bin/env pwsh
# Launch local development server with fresh cache

Write-Host "`n🚀 Starting PCOS Smart Assistant Local Server..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Check if server is already running on port 8000
$serverRunning = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue

if ($serverRunning) {
    Write-Host "✓ Server already running on port 8000" -ForegroundColor Green
}
else {
    Write-Host "Starting server on port 8000..." -ForegroundColor Yellow
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; python -m http.server 8000"
    Start-Sleep -Seconds 2
}

# Generate cache-busting timestamp
$cacheBuster = (Get-Date).Ticks

# Open in default browser with cache buster
$url = "http://localhost:8000/dashboard.html?cb=$cacheBuster"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✓ Opening dashboard: $url" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "`n📌 Quick Tips:" -ForegroundColor Magenta
Write-Host "  • Press Ctrl+Shift+R to hard refresh if styles don't load" -ForegroundColor White
Write-Host "  • Vercel URL: https://pcos-zeta.vercel.app/dashboard.html" -ForegroundColor White
Write-Host "  • Local URL:  http://localhost:8000/dashboard.html`n" -ForegroundColor White

Start-Process $url
