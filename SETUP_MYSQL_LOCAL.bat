@echo off
echo ================================================
echo  SETUP MySQL DATABASE CHO MEDISCHEDULE
echo ================================================
echo.

echo [1/5] Ket noi MySQL va tao database...
mysql -u root -p190705 -e "CREATE DATABASE IF NOT EXISTS medischedule CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
    echo FAILED: Khong the ket noi MySQL!
    echo - Kiem tra MySQL da chay chua: services.msc
    echo - Kiem tra password trong lenh: 190705
    pause
    exit /b 1
)
echo SUCCESS: Database medischedule da duoc tao!
echo.

echo [2/5] Chuyen den thu muc backend...
cd /d "%~dp0backend"
if errorlevel 1 (
    echo FAILED: Khong tim thay thu muc backend!
    pause
    exit /b 1
)
echo SUCCESS: Da vao thu muc backend
echo.

echo [3/5] Tao Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo SUCCESS: Da tao virtual environment
) else (
    echo Virtual environment da ton tai, bo qua...
)
echo.

echo [4/5] Cai dat Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
if errorlevel 1 (
    echo FAILED: Khong the cai dat dependencies!
    pause
    exit /b 1
)
echo SUCCESS: Da cai dat tat ca dependencies
echo.

echo [5/5] Tao cac bang trong database...
python init_database.py
if errorlevel 1 (
    echo WARNING: Co loi khi tao bang, nhung co the khong quan trong
)
echo.

echo Tao admin account...
python create_admin_mysql.py
if errorlevel 1 (
    echo WARNING: Admin account co the da ton tai
)
echo.

echo Tao du lieu mau...
python create_sample_simple.py
if errorlevel 1 (
    echo WARNING: Du lieu mau co the da ton tai
)
echo.

echo ================================================
echo  SETUP HOAN TAT!
echo ================================================
echo.
echo Tai khoan test (password: 12345678):
echo - Admin:     admin@medischedule.com
echo - Dept Head: departmenthead@test.com
echo - Doctor:    doctor1@test.com
echo - Patient:   patient1@test.com
echo.
echo Buoc tiep theo:
echo 1. Chay file START_BACKEND_LOCAL.bat
echo 2. Chay file START_FRONTEND_LOCAL.bat (terminal moi)
echo.
pause
