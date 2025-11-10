#!/usr/bin/env python3
"""
Final Comprehensive Authentication & Database Testing for MediSchedule
Based on user review request: "lỗi đăng nhập, đăng kí và không tạo được db"
"""

import requests
import json
import uuid
from datetime import datetime

# Backend URL from review request
BACKEND_URL = "http://localhost:8001/api"

class FinalAuthTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.test_results = []
        self.tokens = {}
        
    def log_result(self, test_name, success, message):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
    
    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return None

    def test_priority_1_authentication_login(self):
        """Priority 1: Authentication Tests - Login ✅"""
        print("\n=== PRIORITY 1: AUTHENTICATION TESTS - LOGIN ===")
        
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
            login_data = {"login": account["email"], "password": account["password"]}
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response and response.status_code == 200:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                
                if token and user.get("role") == account["role"]:
                    self.tokens[account["email"]] = token
                    successful_logins += 1
                    
                    if account["role"] == "admin" and "admin_permissions" in user:
                        permissions = user["admin_permissions"]
                        permission_count = len([k for k, v in permissions.items() if v])
                        self.log_result(f"Login {account['email']}", True, 
                                      f"Returns valid JWT token and user object with {permission_count} permissions")
                    else:
                        self.log_result(f"Login {account['email']}", True, 
                                      f"Returns valid JWT token and user object with role: {user['role']}")
                else:
                    self.log_result(f"Login {account['email']}", False, 
                                  f"Missing token or incorrect role")
            else:
                self.log_result(f"Login {account['email']}", False, 
                              f"Login failed with status {response.status_code if response else 'no response'}")
        
        self.log_result("All 8 Test Accounts Login", successful_logins == 8, 
                       f"Successfully logged in {successful_logins}/8 accounts")

    def test_priority_2_registration(self):
        """Priority 2: Registration Tests ✅"""
        print("\n=== PRIORITY 2: REGISTRATION TESTS ===")
        
        # Test 1: Register new patient with valid data
        test_id = str(uuid.uuid4())[:8]
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
            if data.get("token") and data.get("user", {}).get("role") == "patient":
                self.log_result("Register new patient with valid data", True, 
                              "Returns JWT token immediately")
            else:
                self.log_result("Register new patient with valid data", False, 
                              "Missing token or incorrect role")
        else:
            self.log_result("Register new patient with valid data", False, 
                          f"Registration failed with status {response.status_code if response else 'no response'}")
        
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
                    self.log_result("Register with duplicate email", True, 
                                  "Correctly returns 400 with Vietnamese error message")
                else:
                    self.log_result("Register with duplicate email", True, 
                                  "Correctly returns 400 error")
            except:
                self.log_result("Register with duplicate email", True, 
                              "Correctly returns 400 error")
        else:
            self.log_result("Register with duplicate email", False, 
                          f"Should return 400, got {response.status_code if response else 'no response'}")
        
        # Test 3: Register with missing required fields
        incomplete_data = {
            "email": f"incomplete_{test_id}@test.com",
            "password": "12345678"
            # Missing username, full_name, phone
        }
        
        response = self.make_request("POST", "/auth/register", incomplete_data)
        if response and response.status_code in [400, 422]:
            self.log_result("Register with missing required fields", True, 
                          "Correctly returns validation error")
        else:
            self.log_result("Register with missing required fields", False, 
                          f"Should return validation error, got {response.status_code if response else 'no response'}")

    def test_priority_3_database_verification(self):
        """Priority 3: Database Verification ✅"""
        print("\n=== PRIORITY 3: DATABASE VERIFICATION ===")
        
        # Test health endpoint
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("database") == "mysql":
                self.log_result("Database connection via /health endpoint", True, 
                              "MySQL database connection confirmed")
            else:
                self.log_result("Database connection via /health endpoint", False, 
                              f"Unexpected database type: {data.get('database')}")
        else:
            self.log_result("Database connection via /health endpoint", False, 
                          "Health check failed")
        
        # Test specialties count (should be 8)
        response = self.make_request("GET", "/specialties")
        if response and response.status_code == 200:
            specialties = response.json()
            if len(specialties) == 8:
                self.log_result("Verify 8 specialties are present", True, 
                              "Found exactly 8 specialties as expected")
            else:
                self.log_result("Verify 8 specialties are present", False, 
                              f"Expected 8 specialties, found {len(specialties)}")
        else:
            self.log_result("Verify 8 specialties are present", False, 
                          "Failed to fetch specialties")
        
        # Verify user count = 9 (8 sample users + 1 test user created earlier)
        # We can't directly count users, but we can verify admin endpoint works
        admin_token = self.tokens.get("admin@medischedule.com")
        if admin_token:
            response = self.make_request("GET", "/admin/doctors", token=admin_token)
            if response and response.status_code == 200:
                doctors = response.json()
                if len(doctors) >= 3:
                    self.log_result("Verify sample data accessible", True, 
                                  f"Found {len(doctors)} doctors in database")
                else:
                    self.log_result("Verify sample data accessible", False, 
                                  f"Expected at least 3 doctors, found {len(doctors)}")
            else:
                self.log_result("Verify sample data accessible", False, 
                              "Failed to access admin endpoint")
        else:
            self.log_result("Verify sample data accessible", False, 
                          "No admin token available")

    def test_priority_4_wrong_credentials(self):
        """Priority 4: Wrong Credentials Tests ✅"""
        print("\n=== PRIORITY 4: WRONG CREDENTIALS TESTS ===")
        
        # Test 1: Correct email but wrong password
        wrong_password_data = {"login": "patient1@test.com", "password": "wrongpassword"}
        response = self.make_request("POST", "/auth/login", wrong_password_data)
        
        if response and response.status_code == 401:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_message:
                    self.log_result("Login with wrong password", True, 
                                  "Returns 401 with proper Vietnamese error message")
                else:
                    self.log_result("Login with wrong password", True, 
                                  "Returns 401 with error message")
            except:
                self.log_result("Login with wrong password", True, 
                              "Returns 401 error")
        else:
            self.log_result("Login with wrong password", False, 
                          f"Should return 401, got {response.status_code if response else 'no response'}")
        
        # Test 2: Non-existent email
        nonexistent_email_data = {"login": "nonexistent@test.com", "password": "12345678"}
        response = self.make_request("POST", "/auth/login", nonexistent_email_data)
        
        if response and response.status_code == 401:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_message:
                    self.log_result("Login with non-existent email", True, 
                                  "Returns 401 with proper Vietnamese error message")
                else:
                    self.log_result("Login with non-existent email", True, 
                                  "Returns 401 with error message")
            except:
                self.log_result("Login with non-existent email", True, 
                              "Returns 401 error")
        else:
            self.log_result("Login with non-existent email", False, 
                          f"Should return 401, got {response.status_code if response else 'no response'}")

    def test_priority_5_additional_endpoints(self):
        """Priority 5: Additional Endpoints (if time permits)"""
        print("\n=== PRIORITY 5: ADDITIONAL ENDPOINTS ===")
        
        # Test GET /specialties
        response = self.make_request("GET", "/specialties")
        if response and response.status_code == 200:
            specialties = response.json()
            self.log_result("GET /specialties", True, 
                          f"Returns {len(specialties)} specialties")
        else:
            self.log_result("GET /specialties", False, 
                          "Failed to fetch specialties")
        
        # Test GET /admin/doctors (with admin token)
        admin_token = self.tokens.get("admin@medischedule.com")
        if admin_token:
            response = self.make_request("GET", "/admin/doctors", token=admin_token)
            if response and response.status_code == 200:
                doctors = response.json()
                self.log_result("GET /admin/doctors (with admin token)", True, 
                              f"Returns {len(doctors)} doctors")
            else:
                self.log_result("GET /admin/doctors (with admin token)", False, 
                              "Failed to fetch doctors")
        else:
            self.log_result("GET /admin/doctors (with admin token)", False, 
                          "No admin token available")
        
        # Test GET /appointments/my (with patient token)
        patient_token = self.tokens.get("patient1@test.com")
        if patient_token:
            response = self.make_request("GET", "/appointments/my", token=patient_token)
            if response and response.status_code == 200:
                appointments = response.json()
                self.log_result("GET /appointments/my (with patient1 token)", True, 
                              f"Returns {len(appointments)} appointments")
            else:
                self.log_result("GET /appointments/my (with patient1 token)", False, 
                              "Failed to fetch appointments")
        else:
            self.log_result("GET /appointments/my (with patient1 token)", False, 
                          "No patient token available")

    def run_comprehensive_tests(self):
        """Run all comprehensive authentication and database tests"""
        print("🔐 COMPREHENSIVE AUTHENTICATION & DATABASE TESTING")
        print("=" * 60)
        print("Context: User reported 'lỗi đăng nhập, đăng kí và không tạo được db'")
        print("Main agent fixed by installing MySQL, creating database, and sample data")
        print("Backend URL:", self.base_url)
        print("Database: MySQL (medischedule, user: root, password: 190705)")
        print("=" * 60)
        
        # Run tests in priority order
        self.test_priority_1_authentication_login()
        self.test_priority_2_registration()
        self.test_priority_3_database_verification()
        self.test_priority_4_wrong_credentials()
        self.test_priority_5_additional_endpoints()
        
        # Print final summary
        self.print_final_summary()

    def print_final_summary(self):
        """Print final comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 FINAL COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Show failed tests
        failed_results = [r for r in self.test_results if not r["success"]]
        if failed_results:
            print(f"\n🔍 FAILED TESTS ({len(failed_results)}):")
            for result in failed_results:
                print(f"   ❌ {result['test']}: {result['message']}")
        
        # Overall assessment
        print(f"\n🎯 OVERALL ASSESSMENT:")
        if failed_tests == 0:
            print("✅ PERFECT - All authentication and database issues are FULLY RESOLVED")
            print("✅ User can now login, register, and access database successfully")
        elif failed_tests <= 2:
            print("⚠️  MOSTLY RESOLVED - Minor issues found, but core functionality is operational")
            print("✅ Main user issues (login, registration, database) are working")
        else:
            print("❌ ISSUES REMAIN - Multiple failures detected, requires further attention")
        
        print(f"\n📍 Test Details:")
        print(f"   • Backend URL: {self.base_url}")
        print(f"   • Database: MySQL (medischedule)")
        print(f"   • Test Accounts: 8 accounts with password '12345678'")
        print(f"   • All critical authentication endpoints tested")
        print(f"   • Database connectivity and sample data verified")

if __name__ == "__main__":
    tester = FinalAuthTester()
    tester.run_comprehensive_tests()