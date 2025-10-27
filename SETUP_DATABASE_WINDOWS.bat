@echo off
echo ========================================
echo   MEDISCHEDULE - SETUP DATABASE
echo ========================================
echo.

cd /d "%~dp0backend"

echo This script will:
echo   1. Create database 'medischedule'
echo   2. Create all tables
echo   3. Create admin account
echo   4. Create sample data (optional)
echo.
pause

echo.
echo [1/4] Creating database and tables...
echo.
echo Enter MySQL root password (default: 190705):
mysql -u root -p < create_database.sql

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to create database!
    echo.
    echo Troubleshooting:
    echo   - Make sure MySQL is installed and running
    echo   - Check if password is correct
    echo   - Try: mysql -u root -p^<password^> ^< create_database.sql
    echo.
    pause
    exit /b 1
)

echo SUCCESS: Database and tables created!
echo.

echo [2/4] Testing database connection...
python test_mysql_connection.py
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Cannot connect to database!
    echo Check the .env file and make sure password is correct
    pause
    exit /b 1
)
echo.

echo [3/4] Creating admin account...
python create_admin_mysql.py
echo.

echo [4/4] Do you want to create sample data? (Y/N)
set /p create_sample="Enter choice: "

if /i "%create_sample%"=="Y" (
    echo.
    echo Creating sample data...
    python create_sample_data_mysql.py
    echo.
)

echo.
echo ========================================
echo          SETUP COMPLETE!
echo ========================================
echo.
echo You can now start the application:
echo   1. Run START_BACKEND_WINDOWS.bat
echo   2. Run START_FRONTEND_WINDOWS.bat (in another terminal)
echo.
echo Login credentials:
echo   Admin: admin@medischedule.com / 12345678
echo   Dept Head: departmenthead@test.com / 12345678
echo   Doctor: doctor1@test.com / 12345678
echo   Patient: patient1@test.com / 12345678
echo.
pause
