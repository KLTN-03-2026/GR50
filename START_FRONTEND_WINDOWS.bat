@echo off
echo ========================================
echo    MEDISCHEDULE - START FRONTEND
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [1/2] Checking Node.js and Yarn...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

yarn --version
if %errorlevel% neq 0 (
    echo ERROR: Yarn is not installed!
    echo Install with: npm install -g yarn
    pause
    exit /b 1
)
echo.

echo [2/2] Starting Frontend...
echo Frontend will run at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

yarn start

pause
