#!/usr/bin/env python3
"""
Authentication System Testing for MediSchedule with MySQL Database
Tests all authentication endpoints as requested in the review
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://auth-local-debug.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class AuthenticationTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        print(f"   Making {method} request to: {url}")
        if data:
            print(f"   Request data: {json.dumps(data, indent=2)}")
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30, verify=False)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30, verify=False)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"   Response status: {response.status_code}")
            try:
                response_data = response.json()
                print(f"   Response data: {json.dumps(response_data, indent=2, ensure_ascii=False)}")
            except:
                print(f"   Response text: {response.text}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return None
    
    def test_existing_patient_login(self):
        """Test 1: ✅ Login with patient account (patient1@test.com/12345678)"""
        print("\n=== TEST 1: EXISTING PATIENT LOGIN ===")
        
        login_data = {
            "login": "patient1@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "patient":
                self.log_result("Patient Login (patient1@test.com)", True, 
                              f"Successfully logged in as patient: {user.get('full_name', 'Unknown')}")
                return token
            else:
                self.log_result("Patient Login (patient1@test.com)", False, 
                              "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Patient Login (patient1@test.com)", False, 
                          "Failed to login with existing patient credentials", error_msg)
        return None
    
    def test_existing_admin_login(self):
        """Test 2: ✅ Login with admin account (admin@medischedule.com/12345678)"""
        print("\n=== TEST 2: EXISTING ADMIN LOGIN ===")
        
        login_data = {
            "login": "admin@medischedule.com", 
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            admin_permissions = user.get("admin_permissions", {})
            
            if token and user.get("role") == "admin":
                self.log_result("Admin Login (admin@medischedule.com)", True, 
                              f"Successfully logged in as admin: {user.get('full_name', 'Unknown')}")
                print(f"   Admin permissions: {admin_permissions}")
                return token
            else:
                self.log_result("Admin Login (admin@medischedule.com)", False, 
                              "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Admin Login (admin@medischedule.com)", False, 
                          "Failed to login with existing admin credentials", error_msg)
        return None
    
    def test_new_patient_registration(self):
        """Test 3: ✅ Register new patient account"""
        print("\n=== TEST 3: NEW PATIENT REGISTRATION ===")
        
        # Generate unique email for this test
        test_id = str(uuid.uuid4())[:8]
        
        registration_data = {
            "email": f"newpatient_{test_id}@test.com",
            "username": f"newpatient_{test_id}",
            "password": "12345678",
            "full_name": "Nguyễn Văn Bệnh Nhân Mới",
            "phone": "0123456789",
            "date_of_birth": "1990-05-15",
            "address": "123 Đường Test, TP.HCM",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", registration_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "patient":
                self.log_result("New Patient Registration", True, 
                              f"Successfully registered new patient: {user.get('full_name', 'Unknown')}")
                return token, user.get("id")
            else:
                self.log_result("New Patient Registration", False, 
                              "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("New Patient Registration", False, 
                          "Failed to register new patient", error_msg)
        return None, None
    
    def test_wrong_password_login(self):
        """Test 4: ✅ Login with wrong password (should return 401 error)"""
        print("\n=== TEST 4: WRONG PASSWORD LOGIN ===")
        
        login_data = {
            "login": "patient1@test.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 401:
            data = response.json()
            error_detail = data.get("detail", "")
            
            # Check if Vietnamese error message is returned
            if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_detail:
                self.log_result("Wrong Password Login", True, 
                              "Correctly returned 401 with Vietnamese error message")
            else:
                self.log_result("Wrong Password Login", True, 
                              f"Correctly returned 401 error: {error_detail}")
        else:
            error_msg = f"Status: {response.status_code}, Body: {response.text}" if response else "Connection failed"
            self.log_result("Wrong Password Login", False, 
                          "Should return 401 error for wrong password", error_msg)
    
    def test_duplicate_email_registration(self):
        """Test 5: ✅ Register with duplicate email (should return 400 error)"""
        print("\n=== TEST 5: DUPLICATE EMAIL REGISTRATION ===")
        
        # Try to register with existing patient email
        duplicate_registration_data = {
            "email": "patient1@test.com",  # This email already exists
            "username": "duplicateuser",
            "password": "12345678",
            "full_name": "Duplicate User",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", duplicate_registration_data)
        if response and response.status_code == 400:
            data = response.json()
            error_detail = data.get("detail", "")
            
            # Check if Vietnamese error message is returned
            if "Email đã được đăng ký" in error_detail:
                self.log_result("Duplicate Email Registration", True, 
                              "Correctly returned 400 with Vietnamese error message")
            else:
                self.log_result("Duplicate Email Registration", True, 
                              f"Correctly returned 400 error: {error_detail}")
        else:
            error_msg = f"Status: {response.status_code}, Body: {response.text}" if response else "Connection failed"
            self.log_result("Duplicate Email Registration", False, 
                          "Should return 400 error for duplicate email", error_msg)
    
    def test_additional_login_scenarios(self):
        """Additional authentication tests"""
        print("\n=== ADDITIONAL AUTHENTICATION TESTS ===")
        
        # Test doctor login
        doctor_login_data = {
            "login": "doctor1@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", doctor_login_data)
        if response and response.status_code == 200:
            data = response.json()
            user = data.get("user", {})
            if user.get("role") == "doctor":
                self.log_result("Doctor Login (doctor1@test.com)", True, 
                              f"Successfully logged in as doctor: {user.get('full_name', 'Unknown')}")
            else:
                self.log_result("Doctor Login (doctor1@test.com)", False, 
                              "Incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Doctor Login (doctor1@test.com)", False, 
                          "Failed to login with doctor credentials", error_msg)
        
        # Test department head login
        dept_head_login_data = {
            "login": "departmenthead@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", dept_head_login_data)
        if response and response.status_code == 200:
            data = response.json()
            user = data.get("user", {})
            if user.get("role") == "department_head":
                self.log_result("Department Head Login", True, 
                              f"Successfully logged in as department head: {user.get('full_name', 'Unknown')}")
            else:
                self.log_result("Department Head Login", False, 
                              "Incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Department Head Login", False, 
                          "Failed to login with department head credentials", error_msg)
        
        # Test username login (instead of email)
        username_login_data = {
            "login": "patient1",  # Using username instead of email
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", username_login_data)
        if response and response.status_code == 200:
            self.log_result("Username Login", True, "Successfully logged in using username")
        else:
            # This might fail if username doesn't exist, which is okay
            self.log_result("Username Login", False, "Username login not working (may be expected)")
    
    def test_field_validation(self):
        """Test field validation"""
        print("\n=== FIELD VALIDATION TESTS ===")
        
        # Test password length validation
        short_password_data = {
            "email": "testuser@test.com",
            "username": "testuser",
            "password": "123",  # Too short
            "full_name": "Test User",
            "phone": "0123456789",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", short_password_data)
        if response and response.status_code == 422:
            self.log_result("Password Length Validation", True, "Correctly rejected short password")
        else:
            error_msg = f"Status: {response.status_code}, Body: {response.text}" if response else "Connection failed"
            self.log_result("Password Length Validation", False, "Should reject short password", error_msg)
        
        # Test invalid email format
        invalid_email_data = {
            "email": "invalid-email",  # Invalid format
            "username": "testuser2",
            "password": "12345678",
            "full_name": "Test User 2",
            "phone": "0123456789",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", invalid_email_data)
        if response and response.status_code == 422:
            self.log_result("Email Format Validation", True, "Correctly rejected invalid email format")
        else:
            self.log_result("Email Format Validation", False, "Should reject invalid email format")
    
    def test_database_connection(self):
        """Test database connection via health check"""
        print("\n=== DATABASE CONNECTION TEST ===")
        
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            database_type = data.get("database", "unknown")
            
            if database_type == "mysql":
                self.log_result("Database Connection", True, "Successfully connected to MySQL database")
            else:
                self.log_result("Database Connection", False, f"Expected MySQL, got: {database_type}")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Database Connection", False, "Health check failed", error_msg)
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🔐 MediSchedule Authentication System Testing with MySQL")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test database connection first
        self.test_database_connection()
        
        # Run priority tests as requested
        self.test_existing_patient_login()
        self.test_existing_admin_login()
        self.test_new_patient_registration()
        self.test_wrong_password_login()
        self.test_duplicate_email_registration()
        
        # Run additional tests
        self.test_additional_login_scenarios()
        self.test_field_validation()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 AUTHENTICATION TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show priority test results
        print("\n🎯 PRIORITY TEST RESULTS:")
        priority_tests = [
            "Patient Login (patient1@test.com)",
            "Admin Login (admin@medischedule.com)", 
            "New Patient Registration",
            "Wrong Password Login",
            "Duplicate Email Registration"
        ]
        
        for test_name in priority_tests:
            result = next((r for r in self.test_results if r["test"] == test_name), None)
            if result:
                status = "✅" if result["success"] else "❌"
                print(f"   {status} {test_name}")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
                    if result.get("details"):
                        print(f"      Details: {result['details']}")
        
        print(f"\n🎯 BACKEND URL USED: {self.base_url}")
        print(f"🗄️  DATABASE: MySQL (localhost)")

if __name__ == "__main__":
    tester = AuthenticationTester()
    tester.run_all_tests()