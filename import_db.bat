@echo off
echo Dang nhap du lieu vao MySQL...
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set DB_USER=root
set DB_PASS=Nguyen@1904
set DB_NAME=database_benhvien
set SQL_FILE="backend/database_benhvien.sql"

if not exist %SQL_FILE% (
    set SQL_FILE="database_benhvien.sql"
)

%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"
%MYSQL_PATH% -u %DB_USER% -p%DB_PASS% %DB_NAME% < %SQL_FILE%

if %ERRORLEVEL% EQU 0 (
    echo [THANH CONG] Du lieu da duoc nhap vao table!
) else (
    echo [LOI] Khong the nhap du lieu. Vui long kiem tra lai duong dan MySQL hoac mat khau.
)
pause
