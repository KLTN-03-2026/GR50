@echo off
echo ========================================
echo    KHOI DONG FRONTEND - MEDISCHEDULE
echo ========================================
echo.

REM Di chuyen den thu muc frontend
cd /d "%~dp0frontend"

REM Kiem tra node_modules
echo [1/2] Kiem tra dependencies...
if not exist node_modules (
    echo ✗ node_modules khong ton tai!
    echo Dang cai dat dependencies...
    call npm install
    if errorlevel 1 (
        echo ✗ Cai dat that bai!
        pause
        exit /b 1
    )
    echo ✓ Dependencies da duoc cai dat
) else (
    echo ✓ Dependencies da san sang
)

echo.
echo [2/2] Khoi dong Frontend...
echo Frontend se mo tai: http://localhost:3000
echo Nhan Ctrl+C de dung server
echo.

REM Khoi dong frontend
call npm start

pause
