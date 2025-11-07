#!/usr/bin/env python3
"""
Authentication Testing Script - Post MySQL Database Restoration
Testing login and registration endpoints after database fix
"""

import requests
import json
from datetime import datetime

# Backend URL
BASE_URL = "http://localhost:8001/api"

# Test credentials
TEST_ACCOUNTS = {
    "patient1": {"login": "patient1@test.com", "password": "12345678"},
    "doctor1": {"login": "doctor1@test.com", "password": "12345678"},
    "admin": {"login": "admin@medischedule.com", "password": "12345678"},
    "departmenthead": {"login": "departmenthead@test.com", "password": "12345678"}
}

def print_header(text):
    print("\n" + "="*80)
    print(f"  {text}")
    print("="*80)

def print_test(test_name, passed, details=""):
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"\n{status}: {test_name}")
    if details:
        print(f"  Details: {details}")

def test_health_check():
    """Test 1: Health Check - Verify database connection"""
    print_header("TEST 1: Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_test("Health Check", True, f"Status: {data.get('status')}, Database: {data.get('database')}")
            return True
        else:
            print_test("Health Check", False, f"Status code: {response.status_code}")
            return False
    except Exception as e:
        print_test("Health Check", False, f"Error: {str(e)}")
        return False

def test_patient_login():
    """Test 2: Patient Login with Correct Credentials"""
    print_header("TEST 2: Patient Login (patient1@test.com / 12345678)")
    
    try:
        payload = TEST_ACCOUNTS["patient1"]
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                print_test("Patient Login", True, 
                          f"Token received, User: {user.get('email')}, Role: {user.get('role')}")
                return True, data["token"]
            else:
                print_test("Patient Login", False, "Missing token or user in response")
                return False, None
        else:
            print_test("Patient Login", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False, None
    except Exception as e:
        print_test("Patient Login", False, f"Error: {str(e)}")
        return False, None

def test_admin_login():
    """Test 3: Admin Login with Correct Credentials"""
    print_header("TEST 3: Admin Login (admin@medischedule.com / 12345678)")
    
    try:
        payload = TEST_ACCOUNTS["admin"]
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                permissions = user.get("admin_permissions", {})
                print_test("Admin Login", True, 
                          f"Token received, User: {user.get('email')}, Role: {user.get('role')}, Permissions: {len(permissions)} items")
                return True, data["token"]
            else:
                print_test("Admin Login", False, "Missing token or user in response")
                return False, None
        else:
            print_test("Admin Login", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False, None
    except Exception as e:
        print_test("Admin Login", False, f"Error: {str(e)}")
        return False, None

def test_doctor_login():
    """Test 4: Doctor Login with Correct Credentials"""
    print_header("TEST 4: Doctor Login (doctor1@test.com / 12345678)")
    
    try:
        payload = TEST_ACCOUNTS["doctor1"]
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                print_test("Doctor Login", True, 
                          f"Token received, User: {user.get('email')}, Role: {user.get('role')}")
                return True, data["token"]
            else:
                print_test("Doctor Login", False, "Missing token or user in response")
                return False, None
        else:
            print_test("Doctor Login", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False, None
    except Exception as e:
        print_test("Doctor Login", False, f"Error: {str(e)}")
        return False, None

def test_departmenthead_login():
    """Test 5: Department Head Login with Correct Credentials"""
    print_header("TEST 5: Department Head Login (departmenthead@test.com / 12345678)")
    
    try:
        payload = TEST_ACCOUNTS["departmenthead"]
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                print_test("Department Head Login", True, 
                          f"Token received, User: {user.get('email')}, Role: {user.get('role')}")
                return True, data["token"]
            else:
                print_test("Department Head Login", False, "Missing token or user in response")
                return False, None
        else:
            print_test("Department Head Login", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False, None
    except Exception as e:
        print_test("Department Head Login", False, f"Error: {str(e)}")
        return False, None

def test_wrong_password():
    """Test 6: Login with Wrong Password (Should Return 401)"""
    print_header("TEST 6: Login with Wrong Password")
    
    try:
        payload = {"login": "patient1@test.com", "password": "wrongpassword"}
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        
        if response.status_code == 401:
            error_msg = response.json().get("detail", "")
            print_test("Wrong Password Rejection", True, 
                      f"Correctly returned 401, Message: {error_msg}")
            return True
        else:
            print_test("Wrong Password Rejection", False, 
                      f"Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print_test("Wrong Password Rejection", False, f"Error: {str(e)}")
        return False

def test_new_user_registration():
    """Test 7: New User Registration"""
    print_header("TEST 7: New User Registration")
    
    try:
        # Generate unique email with timestamp
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "email": f"newpatient{timestamp}@test.com",
            "username": f"newpatient{timestamp}",
            "password": "12345678",
            "full_name": "New Patient Test",
            "phone": "0987654321",
            "date_of_birth": "1990-01-01",
            "address": "Test Address",
            "role": "patient"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                user = data["user"]
                print_test("New User Registration", True, 
                          f"User created: {user.get('email')}, Token received")
                return True, data["token"], payload
            else:
                print_test("New User Registration", False, "Missing token or user in response")
                return False, None, None
        else:
            print_test("New User Registration", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False, None, None
    except Exception as e:
        print_test("New User Registration", False, f"Error: {str(e)}")
        return False, None, None

def test_immediate_login_after_registration(credentials):
    """Test 8: Login Immediately After Registration"""
    print_header("TEST 8: Login Immediately After Registration")
    
    try:
        payload = {"login": credentials["email"], "password": credentials["password"]}
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "user" in data:
                print_test("Immediate Login After Registration", True, 
                          f"Successfully logged in with newly created account")
                return True
            else:
                print_test("Immediate Login After Registration", False, 
                          "Missing token or user in response")
                return False
        else:
            print_test("Immediate Login After Registration", False, 
                      f"Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print_test("Immediate Login After Registration", False, f"Error: {str(e)}")
        return False

def test_duplicate_email_registration():
    """Test 9: Registration with Duplicate Email (Should Fail)"""
    print_header("TEST 9: Registration with Duplicate Email")
    
    try:
        payload = {
            "email": "patient1@test.com",  # Existing email
            "username": "duplicatetest",
            "password": "12345678",
            "full_name": "Duplicate Test",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=5)
        
        if response.status_code == 400:
            error_msg = response.json().get("detail", "")
            print_test("Duplicate Email Rejection", True, 
                      f"Correctly rejected duplicate email, Message: {error_msg}")
            return True
        else:
            print_test("Duplicate Email Rejection", False, 
                      f"Expected 400, got {response.status_code}")
            return False
    except Exception as e:
        print_test("Duplicate Email Rejection", False, f"Error: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("  AUTHENTICATION TESTING - POST MYSQL DATABASE RESTORATION")
    print("  Testing login and registration after database fix")
    print("="*80)
    print(f"\nBackend URL: {BASE_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = {
        "total": 0,
        "passed": 0,
        "failed": 0
    }
    
    # Test 1: Health Check
    results["total"] += 1
    if test_health_check():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 2: Patient Login
    results["total"] += 1
    patient_login_success, patient_token = test_patient_login()
    if patient_login_success:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 3: Admin Login
    results["total"] += 1
    admin_login_success, admin_token = test_admin_login()
    if admin_login_success:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 4: Doctor Login
    results["total"] += 1
    doctor_login_success, doctor_token = test_doctor_login()
    if doctor_login_success:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 5: Department Head Login
    results["total"] += 1
    depthead_login_success, depthead_token = test_departmenthead_login()
    if depthead_login_success:
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 6: Wrong Password
    results["total"] += 1
    if test_wrong_password():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Test 7: New User Registration
    results["total"] += 1
    reg_success, reg_token, new_credentials = test_new_user_registration()
    if reg_success:
        results["passed"] += 1
        
        # Test 8: Immediate Login After Registration
        if new_credentials:
            results["total"] += 1
            if test_immediate_login_after_registration(new_credentials):
                results["passed"] += 1
            else:
                results["failed"] += 1
    else:
        results["failed"] += 1
    
    # Test 9: Duplicate Email Registration
    results["total"] += 1
    if test_duplicate_email_registration():
        results["passed"] += 1
    else:
        results["failed"] += 1
    
    # Print Summary
    print("\n" + "="*80)
    print("  TEST SUMMARY")
    print("="*80)
    print(f"\nTotal Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%")
    
    if results['failed'] == 0:
        print("\n🎉 ALL TESTS PASSED! Authentication system is working correctly.")
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed. Please review the failures above.")
    
    print("\n" + "="*80 + "\n")
    
    return results['failed'] == 0

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
