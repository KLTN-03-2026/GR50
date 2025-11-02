@echo off
echo ========================================
echo    KHOI DONG BACKEND - MEDISCHEDULE
echo ========================================
echo.

REM Di chuyen den thu muc backend
cd /d "%~dp0backend"

REM Kich hoat virtual environment
echo [1/3] Kich hoat virtual environment...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo ✓ Virtual environment da duoc kich hoat
) else (
    echo ✗ Virtual environment khong ton tai!
    echo Ban can chay: python -m venv venv
    pause
    exit /b 1
)

echo.
echo [2/3] Kiem tra ket noi MySQL...
python -c "import pymysql; pymysql.connect(host='localhost', user='root', password='190705', database='medischedule'); print('✓ MySQL connected!')" 2>nul
if errorlevel 1 (
    echo ✗ Khong ket noi duoc MySQL!
    echo Hay dam bao:
    echo   1. MySQL dang chay
    echo   2. Password trong .env file la dung (190705)
    echo   3. Database medischedule da duoc tao
    pause
    exit /b 1
)

echo.
echo [3/3] Khoi dong Backend server...
echo Backend dang chay tai: http://localhost:8001
echo Nhan Ctrl+C de dung server
echo.
python server.py

pause
