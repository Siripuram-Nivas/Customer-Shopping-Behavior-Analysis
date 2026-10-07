@echo off
title Customer Shopping Behavior Analysis Platform
cd /d "%~dp0"

echo ============================================================
echo Starting Customer Shopping Behavior Analysis Platform
echo Standalone React + Vite Frontend & FastAPI Backend
echo ============================================================

echo Starting FastAPI Analytical Backend on port 8000...
start "FastAPI Backend" /min cmd /c "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

echo Starting React/Vite Frontend on port 5173...
start "React Vite Frontend" /min cmd /c "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo Waiting for servers to initialize...
timeout /t 3 /nobreak > nul

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Launching in Google Chrome Application Mode...
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173
) else (
    echo Opening default web browser...
    start http://localhost:5173
)

echo Platform is live at http://localhost:5173!
