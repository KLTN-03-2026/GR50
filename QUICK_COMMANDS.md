# 🚀 Quick Commands Reference - MediSchedule

## 🔧 Auto Fix Scripts

```bash
# Fix tất cả lỗi tự động
/app/auto_fix.sh

# Fix nâng cao với Python
/root/.venv/bin/python /app/auto_fix_advanced.py

# Kiểm tra status nhanh
/app/check_status.sh
```

## 📊 Check Status

```bash
# Tất cả services
sudo supervisorctl status

# Chi tiết từng service
sudo supervisorctl status backend
sudo supervisorctl status frontend

# MySQL
service mariadb status
```

## 🔄 Restart Services

```bash
# Restart tất cả
sudo supervisorctl restart all

# Restart riêng lẻ
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

## 📝 View Logs

```bash
# Backend errors (real-time)
tail -f /var/log/supervisor/backend.err.log

# Backend output (real-time)
tail -f /var/log/supervisor/backend.out.log

# Frontend errors (real-time)
tail -f /var/log/supervisor/frontend.err.log

# Frontend output (real-time)
tail -f /var/log/supervisor/frontend.out.log

# Last 50 lines
tail -n 50 /var/log/supervisor/backend.err.log
tail -n 50 /var/log/supervisor/frontend.out.log
```

## 🗄️ Database Commands

```bash
# Connect to MySQL
mysql -u root -p190705 medischedule

# View all tables
mysql -u root -p190705 -e "SHOW TABLES FROM medischedule;"

# View users
mysql -u root -p190705 -e "SELECT id, email, role, full_name FROM medischedule.users;"

# Count records
mysql -u root -p190705 -e "
  SELECT 'users' as table_name, COUNT(*) as count FROM medischedule.users
  UNION SELECT 'doctors', COUNT(*) FROM medischedule.doctors
  UNION SELECT 'patients', COUNT(*) FROM medischedule.patients
  UNION SELECT 'specialties', COUNT(*) FROM medischedule.specialties;"

# Reset database (CAREFUL!)
mysql -u root -p190705 -e "DROP DATABASE IF EXISTS medischedule; CREATE DATABASE medischedule;"
mysql -u root -p190705 medischedule < /app/backend/create_database.sql
```

## 🧪 Test API

```bash
# Health check
curl http://localhost:8001/api/health

# Login patient
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient1@test.com","password":"12345678"}'

# Login admin
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medischedule.com","password":"12345678"}'

# Register new user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "password":"12345678",
    "full_name":"New User",
    "phone":"0999999999",
    "date_of_birth":"1990-01-01",
    "address":"Test Address"
  }'

# Get specialties
curl http://localhost:8001/api/specialties

# Get doctors (with auth token)
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8001/api/doctors
```

## 🛠️ Fix Specific Issues

### Frontend không start (craco not found)
```bash
cd /app/frontend
rm -rf node_modules yarn.lock
yarn install
sudo supervisorctl restart frontend
```

### Backend không connect MySQL
```bash
service mariadb start
mysql -u root -p190705 -e "USE medischedule;" || \
  mysql -u root -p190705 -e "CREATE DATABASE medischedule;"
sudo supervisorctl restart backend
```

### Database lỗi schema
```bash
mysql -u root -p190705 medischedule < /app/backend/create_database.sql
mysql -u root -p190705 medischedule < /app/backend/add_payments_table.sql
```

### Reinstall Python dependencies
```bash
cd /app/backend
/root/.venv/bin/pip install -r requirements.txt
sudo supervisorctl restart backend
```

### Clear frontend cache
```bash
cd /app/frontend
rm -rf node_modules/.cache
rm -rf build
sudo supervisorctl restart frontend
```

## 🔍 Debug Commands

```bash
# Check ports
netstat -tuln | grep -E "3000|8001|3306"

# Check processes
ps aux | grep -E "node|python|mysql"

# Check disk space
df -h

# Check memory
free -h

# Check CPU
top -bn1 | head -20

# Test MySQL connection
mysql -u root -p190705 -e "SELECT 1;"

# Test frontend port
curl -I http://localhost:3000

# Test backend port
curl -I http://localhost:8001
```

## 📦 Installation Commands

```bash
# Install MariaDB
apt-get update
apt-get install -y mariadb-server
service mariadb start

# Setup MySQL
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '190705';"
mysql -u root -p190705 -e "CREATE DATABASE medischedule;"

# Install backend deps
cd /app/backend
/root/.venv/bin/pip install -r requirements.txt

# Install frontend deps
cd /app/frontend
yarn install
```

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medischedule.com | 12345678 |
| Dept Head | departmenthead@test.com | 12345678 |
| Doctor 1 | doctor1@test.com | 12345678 |
| Doctor 2 | doctor2@test.com | 12345678 |
| Patient 1 | patient1@test.com | 12345678 |
| Patient 2 | patient2@test.com | 12345678 |

## 🌐 URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8001
- Health: http://localhost:8001/api/health
- API Docs: http://localhost:8001/docs (if enabled)

## 💡 Tips

1. **Always check logs first** - Logs thường cho biết nguyên nhân lỗi
2. **Restart services** - Nhiều lỗi fix được bằng restart
3. **Check MySQL** - Đảm bảo MySQL đang chạy
4. **Clear cache** - Nếu frontend lỗi, thử xóa cache
5. **Use auto_fix.sh** - Script tự động fix hầu hết vấn đề

## 🆘 Emergency Commands

```bash
# Kill all và restart từ đầu
sudo supervisorctl stop all
pkill -9 node
pkill -9 python
service mariadb restart
sudo supervisorctl start all

# Reset database hoàn toàn
mysql -u root -p190705 << 'EOF'
DROP DATABASE IF EXISTS medischedule;
CREATE DATABASE medischedule;
EOF
mysql -u root -p190705 medischedule < /app/backend/create_database.sql
/root/.venv/bin/python /app/backend/create_admin_mysql.py

# Reinstall tất cả
cd /app/frontend && rm -rf node_modules && yarn install
cd /app/backend && /root/.venv/bin/pip install -r requirements.txt
sudo supervisorctl restart all
```

---

**💾 Save this file for quick reference!**
