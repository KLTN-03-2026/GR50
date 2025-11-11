@echo off
REM Script chạy MediSchedule local - Windows
REM Chạy bằng: double-click hoặc run_local.bat

color 0A
echo ====================================
echo    MEDISCHEDULE - CHAY LOCAL
echo ====================================
echo.

REM Kiểm tra MySQL (XAMPP)
echo Kiem tra MySQL...
mysql -u root -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] MySQL khong chay!
    echo Vui long:
    echo   1. Mo XAMPP Control Panel
    echo   2. Nhan Start o MySQL
    echo   3. Hoac cai dat MySQL tu: https://dev.mysql.com/downloads/mysql/
    pause
    exit /b 1
)
echo [OK] MySQL dang chay

REM Kiểm tra database
echo.
echo Kiem tra database medischedule...
mysql -u root -e "USE medischedule;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Database chua ton tai, dang tao...
    mysql -u root -e "CREATE DATABASE medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    cd backend
    python create_tables.py
    python create_admin_mysql.py
    python create_sample_data_mysql.py
    cd ..
    echo [OK] Database da duoc tao
) else (
    echo [OK] Database da ton tai
)

REM Kiểm tra Python packages
echo.
echo Kiem tra Python dependencies...
pip show fastapi >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Dang cai dat Python packages...
    cd backend
    pip install -r requirements.txt
    cd ..
)
echo [OK] Python dependencies OK

REM Kiểm tra Node packages
echo.
echo Kiem tra Node dependencies...
if not exist "frontend\node_modules" (
    echo [!] Dang cai dat Node packages...
    cd frontend
    call yarn install
    cd ..
)
echo [OK] Node dependencies OK

echo.
echo ====================================
echo    DANG KHOI DONG UNG DUNG...
echo ====================================
echo.

REM Tạo thư mục logs
if not exist logs mkdir logs

REM Chạy backend
echo Khoi dong Backend (port 8001)...
cd backend
start /B python server.py > ..\logs\backend.log 2>&1
cd ..
timeout /t 3 /nobreak >nul
echo [OK] Backend: http://localhost:8001

REM Chạy frontend
echo.
echo Khoi dong Frontend (port 3000)...
cd frontend
start /B cmd /c "yarn start > ..\logs\frontend.log 2>&1"
cd ..
echo [OK] Frontend: http://localhost:3000

echo.
echo ====================================
echo    UNG DUNG DA CHAY THANH CONG!
echo ====================================
echo.
echo Frontend:  http://localhost:3000
echo Backend:   http://localhost:8001
echo API Docs:  http://localhost:8001/docs
echo.
echo TAI KHOAN TEST:
echo   Admin:    admin@medischedule.com / 12345678
echo   Doctor:   doctor1@test.com / 12345678
echo   Patient:  patient1@test.com / 12345678
echo.
echo Xem log:
echo   Backend:  type logs\backend.log
echo   Frontend: type logs\frontend.log
echo.
echo Trinh duyet se tu dong mo trong giay lat...
echo.

REM Mở trình duyệt
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo Nhan bat ky phim nao de dong cua so nay...
pause >nul
