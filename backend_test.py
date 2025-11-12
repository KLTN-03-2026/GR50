#!/usr/bin/env python3
"""
Backend Authentication Testing Script
Tests authentication endpoints after MySQL setup as requested in review.
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend .env
BACKEND_URL = "https://auth-issue-solver.preview.emergentagent.com/api"

class AuthenticationTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, details):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if not success:
            print(f"   Details: {details}")
        print()
    
    def test_health_check(self):
        """Test if backend is running and connected to MySQL"""
        try:
            response = self.session.get(f"{BACKEND_URL}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("database") == "mysql":
                    self.log_test("Health Check - MySQL Connection", True, f"Backend connected to MySQL: {data}")
                    return True
                else:
                    self.log_test("Health Check - MySQL Connection", False, f"Expected MySQL database, got: {data}")
                    return False
            else:
                self.log_test("Health Check - MySQL Connection", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_test("Health Check - MySQL Connection", False, f"Connection error: {str(e)}")
            return False
    
    def test_login(self, email, password, expected_success=True, test_name=None):
        """Test login endpoint"""
        if not test_name:
            test_name = f"Login - {email}"
        
        try:
            login_data = {
                "login": email,
                "password": password
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if expected_success:
                if response.status_code == 200:
                    data = response.json()
                    if "token" in data and "user" in data:
                        user_role = data["user"].get("role", "unknown")
                        self.log_test(test_name, True, f"Login successful, role: {user_role}, token received")
                        return True, data
                    else:
                        self.log_test(test_name, False, f"Missing token or user in response: {data}")
                        return False, None
                else:
                    self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                    return False, None
            else:
                # Expecting failure
                if response.status_code == 401:
                    error_msg = response.json().get("detail", "Unknown error")
                    self.log_test(test_name, True, f"Login correctly rejected with 401: {error_msg}")
                    return True, None
                else:
                    self.log_test(test_name, False, f"Expected 401, got HTTP {response.status_code}: {response.text}")
                    return False, None
                    
        except Exception as e:
            self.log_test(test_name, False, f"Request error: {str(e)}")
            return False, None
    
    def test_registration(self, user_data, expected_success=True, test_name=None):
        """Test registration endpoint"""
        if not test_name:
            test_name = f"Registration - {user_data.get('email', 'unknown')}"
        
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/register",
                json=user_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if expected_success:
                if response.status_code == 200:
                    data = response.json()
                    if "token" in data and "user" in data:
                        self.log_test(test_name, True, f"Registration successful, user created with role: {data['user'].get('role')}")
                        return True, data
                    else:
                        self.log_test(test_name, False, f"Missing token or user in response: {data}")
                        return False, None
                else:
                    self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
                    return False, None
            else:
                # Expecting failure
                if response.status_code == 400:
                    error_msg = response.json().get("detail", "Unknown error")
                    self.log_test(test_name, True, f"Registration correctly rejected with 400: {error_msg}")
                    return True, None
                else:
                    self.log_test(test_name, False, f"Expected 400, got HTTP {response.status_code}: {response.text}")
                    return False, None
                    
        except Exception as e:
            self.log_test(test_name, False, f"Request error: {str(e)}")
            return False, None
    
    def run_priority_tests(self):
        """Run the priority authentication tests as specified in review request"""
        print("🔐 STARTING AUTHENTICATION TESTING AFTER MYSQL SETUP")
        print("=" * 60)
        
        # Test 1: Health check
        if not self.test_health_check():
            print("❌ Backend health check failed. Stopping tests.")
            return
        
        # Test 2-5: Login with existing test accounts (all use password 12345678)
        test_accounts = [
            ("patient1@test.com", "12345678", "Patient Login"),
            ("doctor1@test.com", "12345678", "Doctor Login"), 
            ("admin@medischedule.com", "12345678", "Admin Login"),
            ("departmenthead@test.com", "12345678", "Department Head Login")
        ]
        
        for email, password, test_name in test_accounts:
            self.test_login(email, password, expected_success=True, test_name=test_name)
        
        # Test 6: Register new patient account with valid data
        new_patient_data = {
            "email": "newpatient@test.com",
            "username": "newpatient",
            "password": "12345678",
            "full_name": "Bệnh nhân mới",
            "phone": "0987654321",
            "date_of_birth": "1990-01-01",
            "address": "123 Test Street, Ho Chi Minh City",
            "role": "patient"
        }
        
        self.test_registration(new_patient_data, expected_success=True, test_name="New Patient Registration")
        
        # Test 7: Try login with wrong password (should return 401)
        self.test_login("patient1@test.com", "wrongpassword", expected_success=False, test_name="Wrong Password Test")
        
        # Test 8: Try registering duplicate email (should return 400)
        duplicate_data = {
            "email": "patient1@test.com",  # This email already exists
            "username": "duplicateuser",
            "password": "12345678",
            "full_name": "Duplicate User",
            "phone": "0123456789",
            "role": "patient"
        }
        
        self.test_registration(duplicate_data, expected_success=False, test_name="Duplicate Email Registration Test")
    
    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("🎯 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        print()
        
        if failed_tests > 0:
            print("❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            print()
        
        print("✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  - {result['test']}")
        
        return passed_tests, failed_tests

def main():
    """Main test execution"""
    print("🏥 MEDISCHEDULE AUTHENTICATION TESTING")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tester = AuthenticationTester()
    tester.run_priority_tests()
    passed, failed = tester.print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if failed == 0 else 1)

if __name__ == "__main__":
    main()