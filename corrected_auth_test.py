#!/usr/bin/env python3
"""
Corrected Authentication Backend Testing for MediSchedule
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
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://payment-ui-issue.preview.emergentagent.com')
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
    
    def test_priority_authentication_scenarios(self):
        """Test the 7 priority authentication scenarios requested"""
        print("\n=== TESTING PRIORITY AUTHENTICATION SCENARIOS ===")
        
        # 1. Patient login with existing account: patient1@test.com / 12345678
        print("\n1. Testing Patient Login (patient1@test.com / 12345678)")
        login_data = {"login": "patient1@test.com", "password": "12345678"}
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                if token and user.get("role") == "patient":
                    self.log_result("1. Patient Login", True, 
                                  f"✅ SUCCESS: JWT token received, role: {user.get('role')}")
                else:
                    self.log_result("1. Patient Login", False, "Missing token or wrong role")
            except Exception as e:
                self.log_result("1. Patient Login", False, f"Response parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("1. Patient Login", False, f"Login failed with status: {status}")
        
        # 2. Admin login: admin@medischedule.com / 12345678
        print("\n2. Testing Admin Login (admin@medischedule.com / 12345678)")
        login_data = {"login": "admin@medischedule.com", "password": "12345678"}
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                admin_perms = user.get("admin_permissions", {})
                if token and user.get("role") == "admin" and admin_perms:
                    self.log_result("2. Admin Login", True, 
                                  f"✅ SUCCESS: JWT token received, role: {user.get('role')}, permissions: {len(admin_perms)} items")
                else:
                    self.log_result("2. Admin Login", False, "Missing token, wrong role, or no permissions")
            except Exception as e:
                self.log_result("2. Admin Login", False, f"Response parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("2. Admin Login", False, f"Login failed with status: {status}")
        
        # 3. Doctor login: doctor1@test.com / 12345678
        print("\n3. Testing Doctor Login (doctor1@test.com / 12345678)")
        login_data = {"login": "doctor1@test.com", "password": "12345678"}
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                if token and user.get("role") == "doctor":
                    self.log_result("3. Doctor Login", True, 
                                  f"✅ SUCCESS: JWT token received, role: {user.get('role')}")
                else:
                    self.log_result("3. Doctor Login", False, "Missing token or wrong role")
            except Exception as e:
                self.log_result("3. Doctor Login", False, f"Response parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("3. Doctor Login", False, f"Login failed with status: {status}")
        
        # 4. Department Head login: departmenthead@test.com / 12345678
        print("\n4. Testing Department Head Login (departmenthead@test.com / 12345678)")
        login_data = {"login": "departmenthead@test.com", "password": "12345678"}
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                if token and user.get("role") == "department_head":
                    self.log_result("4. Department Head Login", True, 
                                  f"✅ SUCCESS: JWT token received, role: {user.get('role')}")
                else:
                    self.log_result("4. Department Head Login", False, "Missing token or wrong role")
            except Exception as e:
                self.log_result("4. Department Head Login", False, f"Response parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("4. Department Head Login", False, f"Login failed with status: {status}")
        
        # 5. Register new patient with valid data
        print("\n5. Testing New Patient Registration")
        test_id = str(uuid.uuid4())[:8]
        registration_data = {
            "email": f"newpatient_{test_id}@test.com",
            "username": f"newpatient_{test_id}",
            "password": "12345678",
            "full_name": "Bệnh Nhân Mới Test",
            "phone": "0123456789",
            "date_of_birth": "1990-01-01",
            "address": "123 Đường Test, TP.HCM",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", registration_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                token = data.get("token")
                user = data.get("user", {})
                if token and user.get("role") == "patient":
                    self.log_result("5. New Patient Registration", True, 
                                  f"✅ SUCCESS: New patient registered with JWT token")
                else:
                    self.log_result("5. New Patient Registration", False, "Missing token or wrong role")
            except Exception as e:
                self.log_result("5. New Patient Registration", False, f"Response parsing error: {str(e)}")
        else:
            status = response.status_code if response else "No response"
            self.log_result("5. New Patient Registration", False, f"Registration failed with status: {status}")
        
        # 6. Wrong password rejection
        print("\n6. Testing Wrong Password Rejection")
        login_data = {"login": "patient1@test.com", "password": "wrongpassword123"}
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response is not None and response.status_code == 401:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_message:
                    self.log_result("6. Wrong Password Rejection", True, 
                                  "✅ SUCCESS: Correctly rejected with 401 and Vietnamese error message")
                else:
                    self.log_result("6. Wrong Password Rejection", True, 
                                  f"✅ SUCCESS: Correctly rejected with 401, message: {error_message}")
            except:
                self.log_result("6. Wrong Password Rejection", True, 
                              "✅ SUCCESS: Correctly rejected with 401")
        else:
            status = response.status_code if response else "No response"
            self.log_result("6. Wrong Password Rejection", False, 
                          f"Should return 401, got: {status}")
        
        # 7. Duplicate email rejection
        print("\n7. Testing Duplicate Email Rejection")
        duplicate_data = {
            "email": "patient1@test.com",  # Existing email
            "username": "duplicatetest",
            "password": "12345678",
            "full_name": "Duplicate Test User",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", duplicate_data)
        
        if response is not None and response.status_code == 400:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                if "Email đã được đăng ký" in error_message:
                    self.log_result("7. Duplicate Email Rejection", True, 
                                  "✅ SUCCESS: Correctly rejected duplicate email with Vietnamese message")
                else:
                    self.log_result("7. Duplicate Email Rejection", True, 
                                  f"✅ SUCCESS: Correctly rejected duplicate email: {error_message}")
            except:
                self.log_result("7. Duplicate Email Rejection", True, 
                              "✅ SUCCESS: Correctly rejected duplicate email")
        else:
            status = response.status_code if response else "No response"
            self.log_result("7. Duplicate Email Rejection", False, 
                          f"Should return 400, got: {status}")
    
    def test_mysql_database_connection(self):
        """Test MySQL database connection via health endpoint"""
        print("\n=== TESTING MYSQL DATABASE CONNECTION ===")
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=30, verify=False)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and data.get("database") == "mysql":
                    self.log_result("MySQL Database Connection", True, 
                                  f"✅ SUCCESS: Backend connected to MySQL database")
                else:
                    self.log_result("MySQL Database Connection", False, 
                                  f"Backend not using MySQL: {data}")
            else:
                self.log_result("MySQL Database Connection", False, 
                              f"Health check failed: {response.status_code}")
        except Exception as e:
            self.log_result("MySQL Database Connection", False, 
                          f"Connection failed: {str(e)}")
    
    def run_priority_tests(self):
        """Run the priority authentication tests as requested"""
        print("🔐 MediSchedule Authentication System Testing - Priority Scenarios")
        print("=" * 80)
        print(f"Backend URL: {self.base_url}")
        print("=" * 80)
        
        # Test MySQL connection first
        self.test_mysql_database_connection()
        
        # Run the 7 priority authentication tests
        self.test_priority_authentication_scenarios()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 80)
        print("📊 PRIORITY AUTHENTICATION TEST SUMMARY")
        print("=" * 80)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
                    if result.get("details"):
                        print(f"      Details: {result['details']}")
        
        print(f"\n🎯 BACKEND URL USED: {self.base_url}")
        
        # Summary for main agent
        if failed_tests == 0:
            print("\n✅ ALL PRIORITY AUTHENTICATION TESTS PASSED!")
            print("🎉 MySQL authentication system is working correctly!")
            print("🏥 All requested login scenarios are functional!")
        else:
            print(f"\n❌ {failed_tests} AUTHENTICATION TESTS FAILED!")
            print("🔧 Authentication system needs fixes!")

if __name__ == "__main__":
    tester = AuthenticationTester()
    tester.run_priority_tests()