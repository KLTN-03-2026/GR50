@echo off
TITLE MediSchedule - Local Development
SETLOCAL EnableDelayedExpansion

:: ---------------------------------------------------------
:: CONFIGURATION
:: ---------------------------------------------------------
set BACKEND_DIR=backend
set FRONTEND_DIR=frontend
set BACKEND_PORT=8001
set FRONTEND_PORT=3050

:: ---------------------------------------------------------
:: STYLING
:: ---------------------------------------------------------
color 0B
echo.
echo  ##########################################################
echo  #                                                        #
echo  #             MEDISCHEDULE - CHAY CUC BO                 #
echo  #                                                        #
echo  ##########################################################
echo.

:: ---------------------------------------------------------
:: CHECKS
:: ---------------------------------------------------------

:: Check Node.js
echo [1/4] Kiem tra Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Khong tim thay Node.js! Vui long cai dat tu https://nodejs.org/
    pause
    exit /b 1
)
node -v
echo [OK] Node.js da san sang.

:: Check MySQL
echo.
echo [2/4] Kiem tra MySQL...
:: Try to connect to MySQL using credentials from backend/.env if possible, 
:: but here we just check if service is up.
mysqladmin -u root ping >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] MySQL (XAMPP/MariaDB) chua chay!
    echo Vui long mo XAMPP Control Panel va Start MySQL.
    pause
    exit /b 1
)
echo [OK] MySQL dang chay.

:: Check Backend Dependencies
echo.
echo [3/4] Kiem tra Backend dependencies...
if not exist "%BACKEND_DIR%\node_modules" (
    echo [!] Dang cai dat backend dependencies...
    cd %BACKEND_DIR%
    call npm install
    cd ..
)
echo [OK] Backend dependencies OK.

:: Check Frontend Dependencies
echo.
echo [4/4] Kiem tra Frontend dependencies...
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [!] Dang cai dat frontend dependencies...
    cd %FRONTEND_DIR%
    call npm install
    cd ..
)
echo [OK] Frontend dependencies OK.

:: ---------------------------------------------------------
:: STARTING SERVICES
:: ---------------------------------------------------------
echo.
echo ==========================================================
echo    DANG KHOI DONG BACKEND VA FRONTEND...
echo ==========================================================
echo.

:: Start Backend in a new window
echo [+] Dang khoi dong Backend tai port %BACKEND_PORT%...
start "MediSchedule - Backend" cmd /c "cd %BACKEND_DIR% && npm run start"

:: Wait a few seconds for backend to initialize
timeout /t 3 /nobreak >nul

:: Start Frontend in a new window
echo [+] Dang khoi dong Frontend tai port %FRONTEND_PORT%...
start "MediSchedule - Frontend" cmd /c "cd %FRONTEND_DIR% && npm start"

echo.
echo [HOAN TAT] He thong dang duoc khoi dong trong cac cua so rieng biet.
echo.
echo ----------------------------------------------------------
echo - Frontend: http://localhost:%FRONTEND_PORT%
echo - Backend:  http://localhost:%BACKEND_PORT%
echo - API Docs: http://localhost:%BACKEND_PORT%/api/health
echo ----------------------------------------------------------
echo.
echo Luu y: Vui long giu cac cua so Terminal mo khi su dung web.
echo.

:: Auto-open browser
timeout /t 5 /nobreak >nul
start http://localhost:%FRONTEND_PORT%

pause
