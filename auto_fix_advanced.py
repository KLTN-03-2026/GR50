#!/usr/bin/env python3
"""
Advanced Auto Fix Script for MediSchedule
Handles complex issues that bash script cannot handle
"""

import os
import sys
import subprocess
import time
import json
from pathlib import Path

# Colors
class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def print_status(msg):
    print(f"{Colors.GREEN}✓{Colors.NC} {msg}")

def print_error(msg):
    print(f"{Colors.RED}✗{Colors.NC} {msg}")

def print_warning(msg):
    print(f"{Colors.YELLOW}⚠{Colors.NC} {msg}")

def print_info(msg):
    print(f"{Colors.BLUE}ℹ{Colors.NC} {msg}")

def run_command(cmd, silent=False):
    """Run shell command and return output"""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=True, 
            text=True,
            timeout=300
        )
        if not silent and result.returncode != 0:
            print_warning(f"Command warning: {result.stderr}")
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        print_error("Command timeout")
        return False, "", "Timeout"
    except Exception as e:
        print_error(f"Command error: {e}")
        return False, "", str(e)

def check_service_status(service):
    """Check if a service is running"""
    success, stdout, _ = run_command(f"sudo supervisorctl status {service}", silent=True)
    return success and "RUNNING" in stdout

def fix_frontend_dependencies():
    """Fix frontend dependencies issues"""
    print("\n🔧 Fixing Frontend Dependencies...")
    
    frontend_dir = Path("/app/frontend")
    if not frontend_dir.exists():
        print_error("Frontend directory not found")
        return False
    
    os.chdir(frontend_dir)
    
    # Check package.json
    package_json = frontend_dir / "package.json"
    if not package_json.exists():
        print_error("package.json not found")
        return False
    
    # Remove node_modules if corrupted
    node_modules = frontend_dir / "node_modules"
    craco_exists = (node_modules / ".bin" / "craco").exists()
    
    if not craco_exists:
        print_warning("craco not found, reinstalling all dependencies...")
        run_command("rm -rf node_modules yarn.lock", silent=True)
        print_info("Installing dependencies (this may take 2-3 minutes)...")
        success, _, _ = run_command("yarn install")
        if success:
            print_status("Frontend dependencies installed")
            return True
        else:
            print_error("Failed to install frontend dependencies")
            return False
    else:
        print_status("Frontend dependencies OK")
        return True

def fix_backend_dependencies():
    """Fix backend dependencies issues"""
    print("\n🔧 Fixing Backend Dependencies...")
    
    backend_dir = Path("/app/backend")
    if not backend_dir.exists():
        print_error("Backend directory not found")
        return False
    
    os.chdir(backend_dir)
    
    requirements = backend_dir / "requirements.txt"
    if not requirements.exists():
        print_error("requirements.txt not found")
        return False
    
    print_info("Installing Python dependencies...")
    success, _, _ = run_command(
        "/root/.venv/bin/pip install -q -r requirements.txt"
    )
    
    if success:
        print_status("Backend dependencies installed")
        return True
    else:
        print_error("Failed to install backend dependencies")
        return False

def fix_database_schema():
    """Fix database schema issues"""
    print("\n🔧 Fixing Database Schema...")
    
    # Check if MySQL is running
    success, _, _ = run_command("service mariadb status", silent=True)
    if not success:
        print_warning("MySQL not running, starting...")
        run_command("service mariadb start")
        time.sleep(3)
    
    # Fix missing columns
    sql_commands = [
        "ALTER TABLE admin_permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE admin_permissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
        "ALTER TABLE specialties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
        "ALTER TABLE patients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
        "ALTER TABLE ai_chat_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;",
    ]
    
    for sql in sql_commands:
        run_command(
            f'mysql -u root -p190705 medischedule -e "{sql}"',
            silent=True
        )
    
    print_status("Database schema fixed")
    return True

def check_environment_files():
    """Check if environment files exist"""
    print("\n🔧 Checking Environment Files...")
    
    backend_env = Path("/app/backend/.env")
    frontend_env = Path("/app/frontend/.env")
    
    if not backend_env.exists():
        print_warning("Backend .env not found, needs configuration")
        return False
    
    if not frontend_env.exists():
        print_warning("Frontend .env not found, needs configuration")
        return False
    
    print_status("Environment files OK")
    return True

def restart_services():
    """Restart all services"""
    print("\n🔄 Restarting Services...")
    
    success, _, _ = run_command("sudo supervisorctl restart all")
    if success:
        print_status("Services restarted")
        print_info("Waiting 10 seconds for services to start...")
        time.sleep(10)
        return True
    else:
        print_error("Failed to restart services")
        return False

def check_services_health():
    """Check health of all services"""
    print("\n🏥 Checking Services Health...")
    
    services = {
        "Backend": lambda: check_service_status("backend"),
        "Frontend": lambda: check_service_status("frontend"),
        "MySQL": lambda: run_command("service mariadb status", silent=True)[0]
    }
    
    all_ok = True
    for name, check_func in services.items():
        if check_func():
            print_status(f"{name}: RUNNING")
        else:
            print_error(f"{name}: NOT RUNNING")
            all_ok = False
    
    # Test backend API
    time.sleep(5)
    success, stdout, _ = run_command(
        "curl -s http://localhost:8001/api/health",
        silent=True
    )
    
    if success and "healthy" in stdout:
        print_status("Backend API: HEALTHY")
        print_info(f"   {stdout.strip()}")
    else:
        print_warning("Backend API: May still be starting...")
        all_ok = False
    
    return all_ok

def print_summary():
    """Print final summary"""
    print("\n" + "="*50)
    print("✅ Advanced Auto Fix Completed!")
    print("="*50)
    print("\n📋 Test Accounts:")
    accounts = [
        ("Admin", "admin@medischedule.com", "12345678"),
        ("Department Head", "departmenthead@test.com", "12345678"),
        ("Doctor", "doctor1@test.com", "12345678"),
        ("Patient", "patient1@test.com", "12345678"),
    ]
    for role, email, password in accounts:
        print(f"   {role:15} {email:30} / {password}")
    
    print("\n📝 Useful Commands:")
    print("   Check status:     sudo supervisorctl status")
    print("   Restart all:      sudo supervisorctl restart all")
    print("   Backend logs:     tail -f /var/log/supervisor/backend.err.log")
    print("   Frontend logs:    tail -f /var/log/supervisor/frontend.out.log")
    print("   MySQL access:     mysql -u root -p190705 medischedule")
    print()

def main():
    print("="*50)
    print("🔧 MediSchedule Advanced Auto Fix")
    print("="*50)
    
    # Run fixes
    fixes = [
        ("Frontend Dependencies", fix_frontend_dependencies),
        ("Backend Dependencies", fix_backend_dependencies),
        ("Database Schema", fix_database_schema),
        ("Environment Files", check_environment_files),
        ("Services", restart_services),
        ("Health Check", check_services_health),
    ]
    
    results = []
    for name, fix_func in fixes:
        try:
            result = fix_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Error in {name}: {e}")
            results.append((name, False))
    
    # Print results
    print("\n" + "="*50)
    print("📊 Fix Results:")
    print("="*50)
    for name, result in results:
        status = "✅ OK" if result else "❌ FAILED"
        print(f"   {name:25} {status}")
    
    # Print summary
    print_summary()
    
    # Exit code
    all_ok = all(result for _, result in results)
    sys.exit(0 if all_ok else 1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)
