@echo off
echo ========================================
echo   FIX BACKEND - PASSWORD ERROR
echo ========================================
echo.

cd /d "%~dp0backend"

echo [INFO] Fixing password error...
echo This script will recreate the database and sample data
echo.
pause

echo.
echo [1/5] Dropping old database (if exists)...
mysql -u root -p190705 -e "DROP DATABASE IF EXISTS medischedule;"
echo.

echo [2/5] Creating fresh database...
mysql -u root -p190705 < create_database.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database!
    pause
    exit /b 1
)
echo SUCCESS: Database created
echo.

echo [3/5] Testing MySQL connection...
python test_mysql_connection.py
if %errorlevel% neq 0 (
    echo ERROR: Cannot connect to MySQL!
    pause
    exit /b 1
)
echo.

echo [4/5] Creating admin account...
python create_admin_mysql.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to create admin!
    pause
    exit /b 1
)
echo.

echo [5/5] Creating sample data...
python create_sample_data_mysql.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to create sample data!
    pause
    exit /b 1
)
echo.

echo ========================================
echo          FIX COMPLETE!
echo ========================================
echo.
echo Backend is now ready to run!
echo.
echo Next steps:
echo   1. Run: START_BACKEND_WINDOWS.bat
echo   2. Run: START_FRONTEND_WINDOWS.bat (in another terminal)
echo.
echo Login credentials:
echo   Admin: admin@medischedule.com / 12345678
echo   Dept Head: departmenthead@test.com / 12345678
echo   Doctor: doctor1@test.com / 12345678
echo   Patient: patient1@test.com / 12345678
echo.
pause
