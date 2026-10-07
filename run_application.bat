@echo off
title Customer Shopping Behavior Analysis
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_app.ps1"
