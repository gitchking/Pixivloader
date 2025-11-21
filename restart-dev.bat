@echo off
echo Stopping existing Node processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting mobile development environment...
start "Mobile Backend" cmd /k "cd mobile-backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting frontend...
npm run dev