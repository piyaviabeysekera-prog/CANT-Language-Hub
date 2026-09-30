@echo off
title CANT [Dev Mode] - Rebellion Engine
cd /d "%~dp0"

echo ========================================================
echo   CANT // THE THIEVES' TONGUE [DEVELOPER MODE]
echo   (Hot-Reloading - Vite Dev Server on Port 5173)
echo ========================================================
echo.
start http://localhost:5173
call npm.cmd run dev -- --host
pause
