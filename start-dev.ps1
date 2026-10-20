# SmartPHR Development Launcher for Windows PowerShell
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "🏥 SmartPHR: Launching Microservices in Windows Terminal" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start Backend Main (Port 5001)
Write-Host "🚀 Launching Node.js Main Backend on port 5001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend-main'; npm run dev"

# 2. Start Backend AI (Port 8000)
Write-Host "🧠 Launching FastAPI Gemini AI Engine on port 8000..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend-ai'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

# 3. Start Frontend Web (Port 5173)
Write-Host "🌐 Launching Vite React Frontend on port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend-web'; npm run dev"

Write-Host "`n✅ All 3 services are launching in their own terminal windows!" -ForegroundColor Green
Write-Host " - Frontend UI:  http://localhost:5173" -ForegroundColor White
Write-Host " - Main Backend: http://localhost:5001" -ForegroundColor White
Write-Host " - AI Engine:    http://localhost:8000" -ForegroundColor White
