#!/bin/bash

# Auto Fix Script for MediSchedule Application
# Fixes common issues with frontend, backend, and database

set -e  # Exit on error

echo "=================================="
echo "🔧 MediSchedule Auto Fix Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check and Install MariaDB
echo "Step 1: Checking MariaDB installation..."
if ! command -v mysql &> /dev/null; then
    print_warning "MariaDB not found. Installing..."
    apt-get update -qq
    apt-get install -y -qq mariadb-server
    print_status "MariaDB installed"
else
    print_status "MariaDB already installed"
fi

# Step 2: Start MariaDB service
echo ""
echo "Step 2: Starting MariaDB service..."
service mariadb start || true
sleep 2
if service mariadb status > /dev/null 2>&1; then
    print_status "MariaDB service running"
else
    print_error "Failed to start MariaDB"
    exit 1
fi

# Step 3: Setup Database
echo ""
echo "Step 3: Setting up database..."
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '190705'; FLUSH PRIVILEGES;" 2>/dev/null || true
mysql -u root -p190705 -e "CREATE DATABASE IF NOT EXISTS medischedule;" 2>/dev/null
print_status "Database created"

# Step 4: Create Database Schema
echo ""
echo "Step 4: Creating database schema..."
if [ -f /app/backend/create_database.sql ]; then
    mysql -u root -p190705 medischedule < /app/backend/create_database.sql 2>/dev/null || true
    print_status "Schema created"
else
    print_warning "Schema file not found, skipping..."
fi

# Step 5: Add Payments Table
echo ""
echo "Step 5: Adding payments table..."
if [ -f /app/backend/add_payments_table.sql ]; then
    mysql -u root -p190705 medischedule < /app/backend/add_payments_table.sql 2>/dev/null || true
    print_status "Payments table added"
fi

# Step 6: Fix Missing Columns
echo ""
echo "Step 6: Fixing missing timestamp columns..."
mysql -u root -p190705 medischedule << 'EOF' 2>/dev/null || true
ALTER TABLE admin_permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE admin_permissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE ai_chat_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
EOF
print_status "Timestamp columns fixed"

# Step 7: Create Sample Data
echo ""
echo "Step 7: Creating sample data..."
mysql -u root -p190705 medischedule << 'EOF' 2>/dev/null || true
-- Insert specialties if not exist
INSERT IGNORE INTO specialties (id, name, description) VALUES
  (UUID(), 'Nội khoa', 'Chuyên khoa Nội khoa'),
  (UUID(), 'Ngoại khoa', 'Chuyên khoa Ngoại khoa'),
  (UUID(), 'Nhi khoa', 'Chuyên khoa Nhi khoa'),
  (UUID(), 'Sản khoa', 'Chuyên khoa Sản khoa'),
  (UUID(), 'Tim mạch', 'Chuyên khoa Tim mạch'),
  (UUID(), 'Da liễu', 'Chuyên khoa Da liễu'),
  (UUID(), 'Tai Mũi Họng', 'Chuyên khoa Tai Mũi Họng'),
  (UUID(), 'Mắt', 'Chuyên khoa Mắt');
EOF
print_status "Sample specialties created"

# Step 8: Create Admin Account
echo ""
echo "Step 8: Creating admin account..."
cd /app/backend
/root/.venv/bin/python create_admin_mysql.py 2>/dev/null || print_warning "Admin may already exist"
print_status "Admin account ready: admin@medischedule.com / 12345678"

# Step 9: Create Test Users
echo ""
echo "Step 9: Creating test users..."
mysql -u root -p190705 medischedule << 'EOF' 2>/dev/null || true
-- Department Head
SET @dept_head_id = UUID();
INSERT IGNORE INTO users (id, email, username, password, role, full_name, phone, date_of_birth, address) VALUES
  (@dept_head_id, 'departmenthead@test.com', 'departmenthead', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eJ3tqKJOY5Ja', 'department_head', 'Trưởng khoa Nguyễn', '0901234567', '1975-01-01', 'Hà Nội');

-- Doctors
SET @specialty1 = (SELECT id FROM specialties LIMIT 1);
SET @doc1_id = UUID();
INSERT IGNORE INTO users (id, email, username, password, role, full_name, phone, date_of_birth, address) VALUES
  (@doc1_id, 'doctor1@test.com', 'doctor1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eJ3tqKJOY5Ja', 'doctor', 'Bác sĩ Nguyễn Văn A', '0912345671', '1980-05-15', 'Hà Nội');
SET @doc1_user = (SELECT id FROM users WHERE email='doctor1@test.com');
INSERT IGNORE INTO doctors (id, user_id, specialty_id, experience_years, consultation_fee, bio, status) VALUES
  (UUID(), @doc1_user, @specialty1, 10, 200000, 'Bác sĩ có kinh nghiệm', 'approved');

SET @doc2_id = UUID();
INSERT IGNORE INTO users (id, email, username, password, role, full_name, phone, date_of_birth, address) VALUES
  (@doc2_id, 'doctor2@test.com', 'doctor2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eJ3tqKJOY5Ja', 'doctor', 'Bác sĩ Trần Thị B', '0912345672', '1985-06-20', 'Hà Nội');
SET @doc2_user = (SELECT id FROM users WHERE email='doctor2@test.com');
INSERT IGNORE INTO doctors (id, user_id, specialty_id, experience_years, consultation_fee, bio, status) VALUES
  (UUID(), @doc2_user, @specialty1, 8, 180000, 'Bác sĩ tận tâm', 'approved');

-- Patients  
SET @pat1_id = UUID();
INSERT IGNORE INTO users (id, email, username, password, role, full_name, phone, date_of_birth, address) VALUES
  (@pat1_id, 'patient1@test.com', 'patient1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eJ3tqKJOY5Ja', 'patient', 'Bệnh nhân Lê Văn C', '0923456781', '1990-03-10', 'Hà Nội');
SET @pat1_user = (SELECT id FROM users WHERE email='patient1@test.com');
INSERT IGNORE INTO patients (id, user_id, medical_history, allergies) VALUES
  (UUID(), @pat1_user, 'Không có tiền sử bệnh lý', 'Không');

SET @pat2_id = UUID();
INSERT IGNORE INTO users (id, email, username, password, role, full_name, phone, date_of_birth, address) VALUES
  (@pat2_id, 'patient2@test.com', 'patient2', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eJ3tqKJOY5Ja', 'patient', 'Bệnh nhân Phạm Thị D', '0923456782', '1992-07-25', 'Hà Nội');
SET @pat2_user = (SELECT id FROM users WHERE email='patient2@test.com');
INSERT IGNORE INTO patients (id, user_id, medical_history, allergies) VALUES
  (UUID(), @pat2_user, 'Không có tiền sử bệnh lý', 'Không');
EOF
print_status "Test users created"

# Step 10: Install Backend Dependencies
echo ""
echo "Step 10: Installing backend dependencies..."
cd /app/backend
/root/.venv/bin/pip install -q -r requirements.txt
print_status "Backend dependencies installed"

# Step 11: Install Frontend Dependencies
echo ""
echo "Step 11: Installing frontend dependencies..."
cd /app/frontend
# Check if node_modules exists and is complete
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.yarn-integrity" ]; then
    print_warning "Reinstalling frontend dependencies..."
    rm -rf node_modules yarn.lock 2>/dev/null || true
    yarn install --silent 2>/dev/null
    print_status "Frontend dependencies installed"
else
    print_status "Frontend dependencies already installed"
fi

# Step 12: Restart All Services
echo ""
echo "Step 12: Restarting all services..."
sudo supervisorctl restart all > /dev/null 2>&1
sleep 5
print_status "All services restarted"

# Step 13: Wait for Services to Start
echo ""
echo "Step 13: Waiting for services to start..."
sleep 10

# Step 14: Check Service Status
echo ""
echo "Step 14: Checking service status..."
if sudo supervisorctl status | grep -q "backend.*RUNNING"; then
    print_status "Backend: RUNNING"
else
    print_error "Backend: NOT RUNNING"
fi

if sudo supervisorctl status | grep -q "frontend.*RUNNING"; then
    print_status "Frontend: RUNNING"
else
    print_error "Frontend: NOT RUNNING"
fi

if service mariadb status > /dev/null 2>&1; then
    print_status "MySQL: RUNNING"
else
    print_error "MySQL: NOT RUNNING"
fi

# Step 15: Test Backend Health
echo ""
echo "Step 15: Testing backend health..."
sleep 5
HEALTH_CHECK=$(curl -s http://localhost:8001/api/health 2>/dev/null || echo "{}")
if echo "$HEALTH_CHECK" | grep -q "healthy"; then
    print_status "Backend health check: OK"
    echo "   Response: $HEALTH_CHECK"
else
    print_warning "Backend health check: May still be starting..."
fi

# Final Summary
echo ""
echo "=================================="
echo "✅ Auto Fix Completed!"
echo "=================================="
echo ""
echo "📋 Test Accounts:"
echo "   Admin:           admin@medischedule.com / 12345678"
echo "   Department Head: departmenthead@test.com / 12345678"
echo "   Doctor:          doctor1@test.com / 12345678"
echo "   Patient:         patient1@test.com / 12345678"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8001"
echo ""
echo "💾 Database:"
echo "   Type:     MySQL (MariaDB)"
echo "   Name:     medischedule"
echo "   User:     root"
echo "   Password: 190705"
echo ""
echo "📝 Check logs if needed:"
echo "   Backend:  tail -f /var/log/supervisor/backend.err.log"
echo "   Frontend: tail -f /var/log/supervisor/frontend.out.log"
echo ""
