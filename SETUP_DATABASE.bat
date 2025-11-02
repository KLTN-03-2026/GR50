@echo off
echo ========================================
echo     SETUP DATABASE - MEDISCHEDULE
echo ========================================
echo.

REM Di chuyen den thu muc backend
cd /d "%~dp0backend"

REM Kich hoat virtual environment
echo [1/5] Kich hoat virtual environment...
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
    echo ✓ Virtual environment da duoc kich hoat
) else (
    echo ✗ Virtual environment khong ton tai!
    echo Dang tao virtual environment...
    python -m venv venv
    call venv\Scripts\activate.bat
    echo ✓ Virtual environment da duoc tao
)

echo.
echo [2/5] Cai dat dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ✗ Cai dat dependencies that bai!
    pause
    exit /b 1
)
echo ✓ Dependencies da duoc cai dat

echo.
echo [3/5] Tao cac bang trong database...
python init_database.py
if errorlevel 1 (
    echo ✗ Tao bang that bai!
    echo Hay dam bao MySQL dang chay va password trong .env dung
    pause
    exit /b 1
)
echo ✓ Cac bang da duoc tao

echo.
echo [4/5] Tao admin account...
python create_admin_mysql.py
if errorlevel 1 (
    echo ✗ Tao admin that bai!
    pause
    exit /b 1
)
echo ✓ Admin account da duoc tao

echo.
echo [5/5] Tao du lieu mau...
python create_sample_simple.py
if errorlevel 1 (
    echo ✗ Tao du lieu mau that bai!
    pause
    exit /b 1
)
echo ✓ Du lieu mau da duoc tao

echo.
echo ========================================
echo           SETUP HOAN TAT!
echo ========================================
echo.
echo Database: medischedule
echo Test Accounts (Password: 12345678):
echo   - admin@medischedule.com
echo   - departmenthead@test.com
echo   - doctor1@test.com
echo   - doctor2@test.com
echo   - doctor3@test.com
echo   - patient1@test.com
echo   - patient2@test.com
echo   - patient3@test.com
echo.
echo Ban co the chay START_BACKEND.bat va START_FRONTEND.bat
echo.
pause
