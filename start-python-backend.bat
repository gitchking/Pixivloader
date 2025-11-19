@echo off
echo ========================================
echo Starting Python Backend Server
echo ========================================
echo.

cd python-backend

echo Checking Python...
python --version
if errorlevel 1 (
    echo ERROR: Python not found!
    echo Install from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo Checking dependencies...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Starting server on http://localhost:3000
echo Press Ctrl+C to stop
echo ========================================
echo.

python app.py
