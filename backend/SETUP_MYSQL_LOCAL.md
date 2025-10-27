# HƯỚNG DẪN SETUP MYSQL VÀ CHẠY ỨNG DỤNG LOCAL

## Bước 1: Tạo Database MySQL

### Cách 1: Dùng MySQL Workbench (KHUYẾN NGHỊ)
1. Mở **MySQL Workbench** trên Windows
2. Connect tới MySQL server: `localhost:3306` (username: `root`, password: `190705`)
3. Mở file `create_database.sql` (trong thư mục backend)
4. Chạy toàn bộ script (Execute SQL Script)
5. Kiểm tra: Bạn sẽ thấy database `medischedule` với 8 tables được tạo

### Cách 2: Dùng Command Line
```bash
cd D:\web\web_12\backend
mysql -u root -p190705 < create_database.sql
```

## Bước 2: Cài đặt Python Dependencies

Mở Command Prompt trong thư mục backend:

```bash
cd D:\web\web_12\backend
pip install -r requirements.txt
```

**Lưu ý**: Nếu gặp lỗi cài đặt, thử:
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

## Bước 3: Cấu hình Environment Variables

File `.env` đã được tạo sẵn với thông tin:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=190705
MYSQL_DATABASE=medischedule
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
```

## Bước 4: Chạy Backend Server

```bash
cd D:\web\web_12\backend
python server.py
```

Hoặc dùng uvicorn:
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend sẽ chạy tại: `http://localhost:8001`
API Docs: `http://localhost:8001/api/docs`

## Bước 5: Tạo Sample Data

Sau khi backend chạy thành công, tạo dữ liệu mẫu:

```bash
cd D:\web\web_12\backend
python create_sample_data_mysql.py
```

## Bước 6: Chạy Frontend

Mở terminal mới:

```bash
cd D:\web\web_12\frontend
yarn install
yarn start
```

Frontend sẽ chạy tại: `http://localhost:3000`

## Kiểm tra MySQL Connection

Test kết nối MySQL:

```bash
cd D:\web\web_12\backend
python test_mysql_connection.py
```

## Tài khoản Test

Sau khi chạy create_sample_data_mysql.py:

- **Admin**: admin@medischedule.com / 12345678
- **Department Head**: departmenthead@test.com / 12345678
- **Doctor**: doctor1@test.com / 12345678
- **Patient**: patient1@test.com / 12345678

## Troubleshooting

### Lỗi: Can't connect to MySQL server
- Kiểm tra MySQL service đang chạy (Services.msc)
- Start MySQL service nếu chưa chạy

### Lỗi: Access denied for user 'root'
- Kiểm tra password MySQL trong file `.env`
- Update password nếu cần

### Lỗi: ModuleNotFoundError
- Chạy lại: `pip install -r requirements.txt`
- Kiểm tra Python version (cần Python 3.8+)

### Lỗi: Port 8001 already in use
- Đổi port khác: `uvicorn server:app --port 8002`
- Hoặc kill process đang dùng port 8001
