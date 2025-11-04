@echo off
echo ================================================
echo  KHOI DONG BACKEND SERVER (MySQL)
echo ================================================
echo.

cd /d "%~dp0backend"

echo Kich hoat Python virtual environment...
call venv\Scripts\activate.bat

echo.
echo Backend dang khoi dong tai: http://localhost:8001
echo API Docs: http://localhost:8001/api/docs
echo Health Check: http://localhost:8001/health
echo.
echo Nhan Ctrl+C de dung server
echo ================================================
echo.

python server.py
