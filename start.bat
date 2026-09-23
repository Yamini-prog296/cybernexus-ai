@echo off
title CyberNexus AI Launcher
echo ========================================================
echo         CYBERNEXUS AI - DEFENSIVE SOC PLATFORM
echo ========================================================
echo Starting Backend (FastAPI on Port 8000)...
start "CyberNexus Backend (Port 8000)" cmd /k "cd /d %~dp0backend && python main.py"

echo Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting Frontend (Vite React on Port 5173)...
start "CyberNexus Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Both servers are launching!
echo Frontend UI: http://localhost:5173
echo Backend API: http://localhost:8000
echo Swagger Docs: http://localhost:8000/docs
echo ========================================================
timeout /t 3 >nul
start http://localhost:5173
