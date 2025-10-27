#!/usr/bin/env python3
"""
Script kiểm tra và setup localhost cho MediSchedule
Chạy: python check_setup.py
"""

import os
import sys
import subprocess
import platform

def print_header(text):
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_warning(text):
    print(f"⚠️  {text}")

def check_python_version():
    """Kiểm tra Python version"""
    print_header("1. KIỂM TRA PYTHON")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python version quá cũ: {version.major}.{version.minor}.{version.micro}")
        print_warning("Cần Python 3.8 trở lên")
        return False

def check_node():
    """Kiểm tra Node.js"""
    print_header("2. KIỂM TRA NODE.JS")
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print_success(f"Node.js {version}")
            return True
        else:
            print_error("Node.js không khả dụng")
            return False
    except FileNotFoundError:
        print_error("Node.js chưa được cài đặt")
        print_warning("Tải tại: https://nodejs.org/")
        return False

def check_mysql():
    """Kiểm tra MySQL"""
    print_header("3. KIỂM TRA MYSQL")
    try:
        result = subprocess.run(['mysql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print_success(f"MySQL: {version}")
            return True
        else:
            print_error("MySQL không khả dụng")
            return False
    except FileNotFoundError:
        print_error("MySQL chưa được cài đặt")
        print_warning("Windows: https://dev.mysql.com/downloads/installer/")
        print_warning("Mac: brew install mysql")
        print_warning("Linux: sudo apt-get install mysql-server")
        return False

def check_mysql_connection():
    """Kiểm tra kết nối MySQL"""
    print_header("4. KIỂM TRA KẾT NỐI MYSQL")
    
    # Đọc password từ .env nếu có
    env_file = os.path.join('backend', '.env')
    password = '190705'  # default
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('MYSQL_PASSWORD='):
                    password = line.split('=')[1].strip()
                    break
    
    try:
        cmd = ['mysql', '-u', 'root', f'-p{password}', '-e', 'SELECT "Connection OK" as status;']
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print_success("Kết nối MySQL thành công")
            return True
        else:
            print_error("Không thể kết nối MySQL")
            print_warning(f"Error: {result.stderr}")
            print_warning("Kiểm tra lại username/password trong backend/.env")
            return False
    except Exception as e:
        print_error(f"Lỗi khi test kết nối: {str(e)}")
        return False

def check_database():
    """Kiểm tra database medischedule"""
    print_header("5. KIỂM TRA DATABASE")
    
    env_file = os.path.join('backend', '.env')
    password = '190705'
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('MYSQL_PASSWORD='):
                    password = line.split('=')[1].strip()
                    break
    
    try:
        cmd = ['mysql', '-u', 'root', f'-p{password}', '-e', 'USE medischedule; SHOW TABLES;']
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            tables = result.stdout.strip().split('\n')[1:]  # Skip header
            if len(tables) >= 8:
                print_success(f"Database 'medischedule' có {len(tables)} tables")
                print("   Tables:", ', '.join(tables))
                return True
            else:
                print_warning(f"Database có {len(tables)} tables (cần 8)")
                print_warning("Chạy: python backend/init_database.py")
                return False
        else:
            print_error("Database 'medischedule' chưa được tạo")
            print_warning("Tạo database:")
            print("   mysql -u root -p")
            print("   CREATE DATABASE medischedule;")
            return False
    except Exception as e:
        print_error(f"Lỗi: {str(e)}")
        return False

def check_backend_env():
    """Kiểm tra file backend/.env"""
    print_header("6. KIỂM TRA BACKEND CONFIG")
    
    env_file = os.path.join('backend', '.env')
    
    if not os.path.exists(env_file):
        print_error("File backend/.env không tồn tại")
        print_warning("Tạo file backend/.env với nội dung:")
        print("""
DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule
JWT_SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CORS_ORIGINS=*
ENVIRONMENT=development
        """)
        return False
    
    # Kiểm tra các biến cần thiết
    required_vars = ['DATABASE_URL', 'JWT_SECRET_KEY']
    missing = []
    
    with open(env_file, 'r') as f:
        content = f.read()
        for var in required_vars:
            if var not in content:
                missing.append(var)
    
    if missing:
        print_error(f"Thiếu biến: {', '.join(missing)}")
        return False
    else:
        print_success("File backend/.env đã cấu hình đúng")
        return True

def check_frontend_env():
    """Kiểm tra file frontend/.env"""
    print_header("7. KIỂM TRA FRONTEND CONFIG")
    
    env_file = os.path.join('frontend', '.env')
    
    if not os.path.exists(env_file):
        print_error("File frontend/.env không tồn tại")
        print_warning("Tạo file frontend/.env với nội dung:")
        print("   REACT_APP_BACKEND_URL=http://localhost:8001")
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
        if 'REACT_APP_BACKEND_URL' in content:
            # Lấy giá trị
            for line in content.split('\n'):
                if line.startswith('REACT_APP_BACKEND_URL='):
                    url = line.split('=')[1].strip()
                    if 'localhost:8001' in url or '127.0.0.1:8001' in url:
                        print_success(f"Frontend config OK: {url}")
                        return True
                    else:
                        print_warning(f"Backend URL: {url}")
                        print_warning("Nên dùng: http://localhost:8001")
                        return False
        else:
            print_error("Thiếu REACT_APP_BACKEND_URL")
            return False

def check_backend_dependencies():
    """Kiểm tra backend dependencies"""
    print_header("8. KIỂM TRA BACKEND DEPENDENCIES")
    
    requirements_file = os.path.join('backend', 'requirements.txt')
    
    if not os.path.exists(requirements_file):
        print_error("File backend/requirements.txt không tồn tại")
        return False
    
    # Các thư viện quan trọng
    important_packages = ['fastapi', 'uvicorn', 'sqlalchemy', 'aiomysql', 'passlib']
    
    try:
        import fastapi
        import uvicorn
        import sqlalchemy
        import aiomysql
        import passlib
        
        print_success("Tất cả dependencies đã được cài đặt")
        return True
    except ImportError as e:
        print_error(f"Thiếu package: {str(e)}")
        print_warning("Cài đặt: pip install -r backend/requirements.txt")
        return False

def check_sample_data():
    """Kiểm tra sample data"""
    print_header("9. KIỂM TRA SAMPLE DATA")
    
    env_file = os.path.join('backend', '.env')
    password = '190705'
    
    if os.path.exists(env_file):
        with open(env_file, 'r') as f:
            for line in f:
                if line.startswith('MYSQL_PASSWORD='):
                    password = line.split('=')[1].strip()
                    break
    
    try:
        cmd = ['mysql', '-u', 'root', f'-p{password}', '-D', 'medischedule', '-e', 
               'SELECT COUNT(*) as user_count FROM users;']
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            if len(lines) >= 2:
                count = int(lines[1])
                if count > 0:
                    print_success(f"Database có {count} users")
                    
                    # Hiển thị tài khoản test
                    cmd2 = ['mysql', '-u', 'root', f'-p{password}', '-D', 'medischedule', '-e',
                           'SELECT email, role FROM users LIMIT 5;']
                    result2 = subprocess.run(cmd2, capture_output=True, text=True)
                    if result2.returncode == 0:
                        print("\n   Tài khoản mẫu:")
                        print(result2.stdout)
                    return True
                else:
                    print_warning("Database chưa có users")
                    print_warning("Chạy: python backend/create_sample_data_mysql.py")
                    return False
        
        return False
    except Exception as e:
        print_error(f"Lỗi: {str(e)}")
        return False

def main():
    print("\n" + "🏥"*30)
    print("     MEDISCHEDULE - KIỂM TRA LOCALHOST SETUP")
    print("🏥"*30)
    
    checks = [
        check_python_version,
        check_node,
        check_mysql,
        check_mysql_connection,
        check_database,
        check_backend_env,
        check_frontend_env,
        check_backend_dependencies,
        check_sample_data
    ]
    
    results = []
    for check in checks:
        try:
            results.append(check())
        except Exception as e:
            print_error(f"Lỗi khi chạy check: {str(e)}")
            results.append(False)
    
    # Tổng kết
    print_header("KẾT QUẢ TỔNG QUAN")
    
    passed = sum(results)
    total = len(results)
    
    print(f"\n✅ Đã pass: {passed}/{total} checks")
    
    if passed == total:
        print("\n🎉 HOÀN HẢO! Hệ thống đã sẵn sàng!")
        print("\n📝 BƯỚC TIẾP THEO:")
        print("   1. Terminal 1: cd backend && python server.py")
        print("   2. Terminal 2: cd frontend && yarn start")
        print("   3. Mở trình duyệt: http://localhost:3000")
        print("   4. Đăng nhập với: patient1@test.com / 12345678")
    else:
        print("\n⚠️  VẪN CÒN MỘT SỐ VẤN ĐỀ CẦN KHẮC PHỤC")
        print("   Xem các lỗi ở trên và làm theo hướng dẫn")
        print("   Sau khi sửa, chạy lại: python check_setup.py")
    
    print("\n" + "="*60 + "\n")

if __name__ == "__main__":
    main()
