#!/usr/bin/env python3
"""
Comprehensive Authentication & Database Testing for MediSchedule
Based on user review request: "lỗi đăng nhập, đăng kí và không tạo được db"
Tests all authentication scenarios and database verification as requested.
"""

import requests
import json
import uuid
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Backend URL from review request
BACKEND_URL = "http://localhost:8001/api"

class ComprehensiveAuthTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.tokens = {}  # Store tokens for each test account
        
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
    
    def make_request(self, method, endpoint, data=None, headers=None, token=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        print(f"   Making {method} request to: {url}")
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"   Response status: {response.status_code}")
            return response
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return None

    def test_database_verification(self):
        """Test 3: Database Verification ✅"""
        print("\n=== 3. DATABASE VERIFICATION ===")
        
        # Test health endpoint
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("database") == "mysql":
                self.log_result("Database Connection", True, "MySQL database connection confirmed")
            else:
                self.log_result("Database Connection", False, f"Unexpected database type: {data.get('database')}")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Database Connection", False, "Health check failed", error_msg)
        
        # Test specialties count (should be 8)
        response = self.make_request("GET", "/specialties")
        if response and response.status_code == 200:
            specialties = response.json()
            if len(specialties) == 8:
                self.log_result("Specialties Count", True, f"Found exactly 8 specialties as expected")
            else:
                self.log_result("Specialties Count", False, f"Expected 8 specialties, found {len(specialties)}")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Specialties Count", False, "Failed to fetch specialties", error_msg)

    def test_authentication_login(self):
        """Test 1: Authentication Tests - Login ✅"""
        print("\n=== 1. AUTHENTICATION TESTS - LOGIN ===")
        
        # Test accounts from review request
        test_accounts = [
            {"email": "patient1@test.com", "password": "12345678", "role": "patient"},
            {"email": "patient2@test.com", "password": "12345678", "role": "patient"},
            {"email": "patient3@test.com", "password": "12345678", "role": "patient"},
            {"email": "doctor1@test.com", "password": "12345678", "role": "doctor"},
            {"email": "doctor2@test.com", "password": "12345678", "role": "doctor"},
            {"email": "doctor3@test.com", "password": "12345678", "role": "doctor"},
            {"email": "admin@medischedule.com", "password": "12345678", "role": "admin"},
            {"email": "departmenthead@test.com", "password": "12345678", "role": "department_head"}
        ]
        
        successful_logins = 0
        
        for account in test_accounts:
            login_data = {
                "login": account["email"],
                "password": account["password"]
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            if response and response.status_code == 200:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                
                if token and user.get("role") == account["role"]:
                    self.tokens[account["email"]] = token
                    successful_logins += 1
                    
                    # Special check for admin permissions
                    if account["role"] == "admin" and "admin_permissions" in user:
                        permissions = user["admin_permissions"]
                        permission_count = len([k for k, v in permissions.items() if v])
                        self.log_result(f"Login {account['email']}", True, 
                                      f"Success - JWT token received, role: {user['role']}, permissions: {permission_count}")
                    else:
                        self.log_result(f"Login {account['email']}", True, 
                                      f"Success - JWT token received, role: {user['role']}")
                else:
                    self.log_result(f"Login {account['email']}", False, 
                                  f"Missing token or incorrect role. Expected: {account['role']}, Got: {user.get('role')}")
            else:
                error_msg = response.text if response else "Connection failed"
                self.log_result(f"Login {account['email']}", False, 
                              f"Login failed", error_msg)
        
        # Summary for login tests
        self.log_result("All Login Tests Summary", successful_logins == len(test_accounts), 
                       f"Successfully logged in {successful_logins}/{len(test_accounts)} accounts")

    def test_registration(self):
        """Test 2: Registration Tests ✅"""
        print("\n=== 2. REGISTRATION TESTS ===")
        
        # Generate unique email for this test run
        test_id = str(uuid.uuid4())[:8]
        
        # Test 1: Register new patient with valid data
        new_patient_data = {
            "email": f"newpatient_{test_id}@test.com",
            "username": f"newpatient_{test_id}",
            "password": "12345678",
            "full_name": "Nguyễn Văn Bệnh Nhân Mới",
            "phone": "0123456789",
            "date_of_birth": "1990-01-01",
            "address": "123 Đường Test, TP.HCM",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", new_patient_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "patient":
                self.log_result("New Patient Registration", True, 
                              "Successfully registered new patient with immediate JWT token")
                
                # Test immediate login capability
                login_data = {
                    "login": new_patient_data["email"],
                    "password": new_patient_data["password"]
                }
                
                login_response = self.make_request("POST", "/auth/login", login_data)
                if login_response and login_response.status_code == 200:
                    self.log_result("New Patient Immediate Login", True, 
                                  "New patient can login immediately after registration")
                else:
                    self.log_result("New Patient Immediate Login", False, 
                                  "New patient cannot login after registration")
            else:
                self.log_result("New Patient Registration", False, 
                              "Missing token or incorrect role in registration response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("New Patient Registration", False, 
                          "Failed to register new patient", error_msg)
        
        # Test 2: Register with duplicate email (should fail with 400)
        duplicate_data = {
            "email": "patient1@test.com",  # Existing email
            "username": f"duplicate_{test_id}",
            "password": "12345678",
            "full_name": "Duplicate Test",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", duplicate_data)
        if response and response.status_code == 400:
            try:
                error_data = response.json()
                if "Email đã được đăng ký" in error_data.get("detail", ""):
                    self.log_result("Duplicate Email Registration", True, 
                                  "Correctly rejected duplicate email with Vietnamese error message")
                else:
                    self.log_result("Duplicate Email Registration", True, 
                                  f"Correctly rejected duplicate email: {error_data.get('detail')}")
            except:
                self.log_result("Duplicate Email Registration", True, 
                              "Correctly rejected duplicate email (400 status)")
        else:
            self.log_result("Duplicate Email Registration", False, 
                          "Should reject duplicate email with 400 status")
        
        # Test 3: Register with missing required fields
        incomplete_data = {
            "email": f"incomplete_{test_id}@test.com",
            "password": "12345678"
            # Missing username, full_name, phone
        }
        
        response = self.make_request("POST", "/auth/register", incomplete_data)
        if response and response.status_code in [400, 422]:  # 422 for validation errors
            self.log_result("Missing Fields Registration", True, 
                          "Correctly rejected registration with missing required fields")
        else:
            self.log_result("Missing Fields Registration", False, 
                          "Should reject registration with missing required fields")

    def test_wrong_credentials(self):
        """Test 4: Wrong Credentials Tests ✅"""
        print("\n=== 4. WRONG CREDENTIALS TESTS ===")
        
        # Test 1: Correct email but wrong password
        wrong_password_data = {
            "login": "patient1@test.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", wrong_password_data)
        if response and response.status_code == 401:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_message:
                    self.log_result("Wrong Password Test", True, 
                                  "Correctly rejected wrong password with Vietnamese error message")
                else:
                    self.log_result("Wrong Password Test", True, 
                                  f"Correctly rejected wrong password: {error_message}")
            except:
                self.log_result("Wrong Password Test", True, 
                              "Correctly rejected wrong password (401 status)")
        else:
            self.log_result("Wrong Password Test", False, 
                          "Should reject wrong password with 401 status")
        
        # Test 2: Non-existent email
        nonexistent_email_data = {
            "login": "nonexistent@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", nonexistent_email_data)
        if response and response.status_code == 401:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_message:
                    self.log_result("Non-existent Email Test", True, 
                                  "Correctly rejected non-existent email with Vietnamese error message")
                else:
                    self.log_result("Non-existent Email Test", True, 
                                  f"Correctly rejected non-existent email: {error_message}")
            except:
                self.log_result("Non-existent Email Test", True, 
                              "Correctly rejected non-existent email (401 status)")
        else:
            self.log_result("Non-existent Email Test", False, 
                          "Should reject non-existent email with 401 status")

    def test_additional_endpoints(self):
        """Test 5: Additional Endpoints (if time permits)"""
        print("\n=== 5. ADDITIONAL ENDPOINTS TESTS ===")
        
        # Test specialties endpoint
        response = self.make_request("GET", "/specialties")
        if response and response.status_code == 200:
            specialties = response.json()
            if len(specialties) == 8:
                self.log_result("GET /specialties", True, 
                              f"Successfully returned 8 specialties")
            else:
                self.log_result("GET /specialties", False, 
                              f"Expected 8 specialties, got {len(specialties)}")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("GET /specialties", False, 
                          "Failed to fetch specialties", error_msg)
        
        # Test admin doctors endpoint (with admin token)
        admin_token = self.tokens.get("admin@medischedule.com")
        if admin_token:
            response = self.make_request("GET", "/admin/doctors", token=admin_token)
            if response and response.status_code == 200:
                doctors = response.json()
                if len(doctors) >= 3:  # Should have at least 3 doctors
                    self.log_result("GET /admin/doctors", True, 
                                  f"Successfully returned {len(doctors)} doctors")
                else:
                    self.log_result("GET /admin/doctors", False, 
                                  f"Expected at least 3 doctors, got {len(doctors)}")
            else:
                error_msg = response.text if response else "Connection failed"
                self.log_result("GET /admin/doctors", False, 
                              "Failed to fetch doctors", error_msg)
        else:
            self.log_result("GET /admin/doctors", False, 
                          "No admin token available for testing")
        
        # Test patient appointments endpoint (with patient token)
        patient_token = self.tokens.get("patient1@test.com")
        if patient_token:
            response = self.make_request("GET", "/appointments/my", token=patient_token)
            if response and response.status_code == 200:
                appointments = response.json()
                self.log_result("GET /appointments/my", True, 
                              f"Successfully returned {len(appointments)} appointments")
            else:
                error_msg = response.text if response else "Connection failed"
                self.log_result("GET /appointments/my", False, 
                              "Failed to fetch appointments", error_msg)
        else:
            self.log_result("GET /appointments/my", False, 
                          "No patient token available for testing")

    def run_comprehensive_tests(self):
        """Run all comprehensive authentication and database tests"""
        print("🔐 COMPREHENSIVE AUTHENTICATION & DATABASE TESTING")
        print("=" * 60)
        print("Context: User reported 'lỗi đăng nhập, đăng kí và không tạo được db'")
        print("Backend URL:", self.base_url)
        print("Database: MySQL (medischedule)")
        print("=" * 60)
        
        # Run tests in priority order as specified in review request
        self.test_authentication_login()
        self.test_registration()
        self.test_database_verification()
        self.test_wrong_credentials()
        self.test_additional_endpoints()
        
        # Print comprehensive summary
        self.print_comprehensive_summary()

    def print_comprehensive_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Group results by test category
        categories = {
            "Authentication Login": [],
            "Registration": [],
            "Database Verification": [],
            "Wrong Credentials": [],
            "Additional Endpoints": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if "Login" in test_name and "Wrong" not in test_name:
                categories["Authentication Login"].append(result)
            elif "Registration" in test_name:
                categories["Registration"].append(result)
            elif "Database" in test_name or "Specialties Count" in test_name:
                categories["Database Verification"].append(result)
            elif "Wrong" in test_name or "Non-existent" in test_name:
                categories["Wrong Credentials"].append(result)
            else:
                categories["Additional Endpoints"].append(result)
        
        # Print category summaries
        for category, results in categories.items():
            if results:
                passed = len([r for r in results if r["success"]])
                total = len(results)
                print(f"\n🔍 {category}: {passed}/{total} passed")
                
                # Show failed tests in this category
                failed_in_category = [r for r in results if not r["success"]]
                if failed_in_category:
                    for result in failed_in_category:
                        print(f"   ❌ {result['test']}: {result['message']}")
        
        # Overall assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if failed_tests == 0:
            print("✅ ALL TESTS PASSED - Authentication and database issues are FULLY RESOLVED")
        elif failed_tests <= 2:
            print("⚠️  MOSTLY WORKING - Minor issues found, but core functionality is operational")
        else:
            print("❌ SIGNIFICANT ISSUES - Multiple failures detected, requires attention")
        
        print(f"\n📍 Backend URL: {self.base_url}")
        print(f"📍 Database: MySQL (medischedule)")
        print(f"📍 Test Accounts: 8 accounts with password '12345678'")

if __name__ == "__main__":
    tester = ComprehensiveAuthTester()
    tester.run_comprehensive_tests()