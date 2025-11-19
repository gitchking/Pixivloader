@echo off
echo ========================================
echo Testing Pixiv Scraper
echo ========================================
echo.

cd python-backend

echo Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Install from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo Activating virtual environment...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo Creating virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Running test...
echo.

if "%1"=="" (
    python test_scraper.py
) else (
    python test_scraper.py %1
)

echo.
pause
