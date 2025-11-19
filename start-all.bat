@echo off
echo ========================================
echo Starting Pixivloader (Backend + Frontend)
echo ========================================
echo.

echo This will open 2 terminal windows:
echo   1. Backend Server (port 3000)
echo   2. Frontend Dev Server (port 5173)
echo.
echo Press any key to continue...
pause > nul

echo.
echo Starting Backend...
start "Pixivloader Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 > nul

echo Starting Frontend...
start "Pixivloader Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo ✅ Both servers are starting!
echo ========================================
echo.
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Check the opened terminal windows for status.
echo Close this window when done.
echo.
pause
