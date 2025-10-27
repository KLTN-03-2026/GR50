@echo off
echo ========================================
echo    MEDISCHEDULE - START BACKEND
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/3] Checking Python...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python 3.8+ from https://www.python.org/downloads/
    pause
    exit /b 1
)
echo.

echo [2/3] Checking MySQL connection...
python test_mysql_connection.py
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Cannot connect to MySQL!
    echo Please make sure:
    echo   1. MySQL is installed and running
    echo   2. Database 'medischedule' exists
    echo   3. Check password in .env file
    echo.
    echo To fix:
    echo   - Run: mysql -u root -p190705 ^< create_database.sql
    echo   - Or check HUONG_DAN_CHAY_MYSQL.md
    echo.
    pause
    exit /b 1
)
echo.

echo [3/3] Starting Backend Server...
echo Backend will run at: http://localhost:8001
echo API Docs: http://localhost:8001/api/docs
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python server.py

pause
