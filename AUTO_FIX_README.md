# 🔧 Auto Fix Scripts - MediSchedule

Các script tự động fix lỗi phổ biến cho ứng dụng MediSchedule.

## 📦 Các Script

### 1. `auto_fix.sh` - Script Bash đơn giản
Script bash tự động fix hầu hết các vấn đề phổ biến.

**Cách sử dụng:**
```bash
# Cấp quyền thực thi
chmod +x /app/auto_fix.sh

# Chạy script
/app/auto_fix.sh
```

**Chức năng:**
- ✅ Cài đặt MariaDB/MySQL nếu chưa có
- ✅ Tạo database và schema
- ✅ Fix thiếu columns trong database
- ✅ Tạo admin và test accounts
- ✅ Cài đặt backend dependencies
- ✅ Cài đặt frontend dependencies
- ✅ Restart tất cả services
- ✅ Kiểm tra health của services

### 2. `auto_fix_advanced.py` - Script Python nâng cao
Script Python với error handling tốt hơn và kiểm tra chi tiết.

**Cách sử dụng:**
```bash
# Cấp quyền thực thi
chmod +x /app/auto_fix_advanced.py

# Chạy script
/root/.venv/bin/python /app/auto_fix_advanced.py

# Hoặc
python3 /app/auto_fix_advanced.py
```

**Chức năng:**
- ✅ Fix frontend dependencies (kiểm tra craco)
- ✅ Fix backend dependencies (requirements.txt)
- ✅ Fix database schema issues
- ✅ Kiểm tra environment files
- ✅ Restart services
- ✅ Health check toàn diện
- ✅ Báo cáo chi tiết kết quả

## 🚨 Khi Nào Cần Dùng?

### Chạy `auto_fix.sh` khi:
1. ❌ Frontend không start (craco not found)
2. ❌ Backend không kết nối được MySQL
3. ❌ Services bị STOPPED
4. ❌ Thiếu test accounts trong database
5. ❌ Sau khi clone project lần đầu

### Chạy `auto_fix_advanced.py` khi:
1. ❌ Cần kiểm tra chi tiết hơn
2. ❌ `auto_fix.sh` không fix được
3. ❌ Cần debug các vấn đề phức tạp
4. ❌ Muốn xem báo cáo chi tiết

## 📋 Các Lỗi Thường Gặp & Cách Fix

### 1. Frontend không start - "craco: not found"
```bash
# Fix tự động
/app/auto_fix.sh

# Hoặc fix thủ công
cd /app/frontend
rm -rf node_modules yarn.lock
yarn install
```

### 2. Backend lỗi "No module named 'sqlalchemy'"
```bash
# Fix tự động
/app/auto_fix.sh

# Hoặc fix thủ công
cd /app/backend
/root/.venv/bin/pip install -r requirements.txt
```

### 3. Backend lỗi "Can't connect to MySQL"
```bash
# Fix tự động
/app/auto_fix.sh

# Hoặc fix thủ công
apt-get install mariadb-server
service mariadb start
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '190705';"
mysql -u root -p190705 -e "CREATE DATABASE medischedule;"
mysql -u root -p190705 medischedule < /app/backend/create_database.sql
```

### 4. Database lỗi "Unknown column 'created_at'"
```bash
# Fix tự động
/app/auto_fix.sh

# Hoặc fix thủ công
mysql -u root -p190705 medischedule << 'EOF'
ALTER TABLE admin_permissions ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE admin_permissions ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE specialties ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE patients ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
EOF
```

### 5. Services bị STOPPED
```bash
# Fix tự động
/app/auto_fix.sh

# Hoặc restart thủ công
sudo supervisorctl restart all
```

## 🎯 Quick Reference

### Kiểm tra status
```bash
# Tất cả services
sudo supervisorctl status

# Backend
sudo supervisorctl status backend

# Frontend
sudo supervisorctl status frontend

# MySQL
service mariadb status
```

### Restart services
```bash
# Restart tất cả
sudo supervisorctl restart all

# Restart riêng lẻ
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### Xem logs
```bash
# Backend errors
tail -f /var/log/supervisor/backend.err.log

# Frontend output
tail -f /var/log/supervisor/frontend.out.log

# Backend output
tail -f /var/log/supervisor/backend.out.log
```

### Test backend API
```bash
# Health check
curl http://localhost:8001/api/health

# Test login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@test.com","password":"12345678"}'
```

### Truy cập MySQL
```bash
# Truy cập database
mysql -u root -p190705 medischedule

# Xem users
mysql -u root -p190705 -e "SELECT email, role FROM medischedule.users;"

# Xem tất cả tables
mysql -u root -p190705 -e "SHOW TABLES FROM medischedule;"
```

## 🔑 Test Accounts

Sau khi chạy auto fix script, các accounts sau sẽ có sẵn:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medischedule.com | 12345678 |
| Department Head | departmenthead@test.com | 12345678 |
| Doctor | doctor1@test.com | 12345678 |
| Doctor | doctor2@test.com | 12345678 |
| Patient | patient1@test.com | 12345678 |
| Patient | patient2@test.com | 12345678 |

## 📊 Database Info

- **Type:** MySQL (MariaDB 10.11+)
- **Name:** medischedule
- **User:** root
- **Password:** 190705
- **Host:** localhost
- **Port:** 3306

## 🌐 Application URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **Backend Health:** http://localhost:8001/api/health

## ⚠️ Lưu Ý

1. **Chạy script với quyền root** - Script cần quyền sudo để restart services
2. **Backup data quan trọng** - Script sẽ reinstall dependencies
3. **Đợi đủ thời gian** - Frontend có thể mất 2-3 phút để compile
4. **Kiểm tra logs** - Nếu vẫn lỗi, xem logs để debug

## 🆘 Troubleshooting

### Script không chạy được?
```bash
# Kiểm tra quyền
ls -la /app/auto_fix.sh
ls -la /app/auto_fix_advanced.py

# Cấp quyền
chmod +x /app/auto_fix.sh
chmod +x /app/auto_fix_advanced.py
```

### MySQL không start được?
```bash
# Xem lỗi MySQL
journalctl -xe | grep mysql

# Kiểm tra port
netstat -tuln | grep 3306

# Kill process nếu cần
pkill -9 mysqld
service mariadb start
```

### Frontend vẫn lỗi sau khi fix?
```bash
# Xóa cache
cd /app/frontend
rm -rf node_modules/.cache
rm -rf build

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# Restart
sudo supervisorctl restart frontend
```

### Backend vẫn lỗi sau khi fix?
```bash
# Kiểm tra Python dependencies
/root/.venv/bin/pip list | grep -E "sqlalchemy|fastapi|aiomysql"

# Reinstall dependencies
cd /app/backend
/root/.venv/bin/pip install --force-reinstall -r requirements.txt

# Restart
sudo supervisorctl restart backend
```

## 📞 Support

Nếu gặp vấn đề không fix được bằng script:
1. Kiểm tra logs chi tiết
2. Chạy `auto_fix_advanced.py` để xem báo cáo
3. Fix thủ công theo hướng dẫn trên
4. Liên hệ team support

---

**Phiên bản:** 1.0  
**Cập nhật:** 2025-10-31  
**Tác giả:** MediSchedule Team
