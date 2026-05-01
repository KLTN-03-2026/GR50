@echo off
echo Dang sao luu du lieu tu MySQL ra file SQL...
set DUMP_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe"
set DB_USER=root
set DB_PASS=Nguyen@1904
set DB_NAME=database_benhvien
set SQL_FILE="backend/database_benhvien.sql"

%DUMP_PATH% -u %DB_USER% -p%DB_PASS% --databases %DB_NAME% --result-file=%SQL_FILE%

if %ERRORLEVEL% EQU 0 (
    echo [THANH CONG] Du lieu da duoc sao luu ra file %SQL_FILE%
) else (
    echo [LOI] Khong the sao luu du lieu. Vui long kiem tra lai duong dan MySQL hoac mat khau.
)
pause
