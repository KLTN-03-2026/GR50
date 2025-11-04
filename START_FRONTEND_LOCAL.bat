@echo off
echo ================================================
echo  KHOI DONG FRONTEND SERVER
echo ================================================
echo.

cd /d "%~dp0frontend"

echo Kiem tra node_modules...
if not exist "node_modules" (
    echo Cai dat dependencies lan dau...
    call npm install
)

echo.
echo Frontend dang khoi dong tai: http://localhost:3000
echo.
echo Nhan Ctrl+C de dung server
echo ================================================
echo.

call npm start
