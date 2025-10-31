#!/usr/bin/env python3
"""
Authentication Backend Testing for MediSchedule
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
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://login-booking-fix.preview.emergentagent.com')
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
    
    def test_login_with_existing_credentials(self):
        """Test login with existing test credentials"""
        print("\n=== TESTING LOGIN WITH EXISTING CREDENTIALS ===")
        
        # Test credentials provided in the review request
        test_credentials = [
            {
                "name": "Patient Login (Email)",
                "login": "patient1@test.com",
                "password": "12345678",
                "expected_role": "patient"
            },
            {
                "name": "Patient Login (Username)", 
                "login": "patient1",
                "password": "12345678",
                "expected_role": "patient"
            },
            {
                "name": "Doctor Login",
                "login": "doctor1@test.com", 
                "password": "12345678",
                "expected_role": "doctor"
            },
            {
                "name": "Admin Login",
                "login": "admin@medischedule.com",
                "password": "12345678", 
                "expected_role": "admin"
            },
            {
                "name": "Department Head Login",
                "login": "departmenthead@test.com",
                "password": "12345678",
                "expected_role": "department_head"
            }
        ]
        
        for cred in test_credentials:
            login_data = {
                "login": cred["login"],
                "password": cred["password"]
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response and response.status_code == 200:
                try:
                    data = response.json()
                    token = data.get("token")
                    user = data.get("user", {})
                    user_role = user.get("role")
                    
                    if token and user_role == cred["expected_role"]:
                        self.log_result(cred["name"], True, 
                                      f"Successfully logged in with role: {user_role}")
                        print(f"   Token received: {token[:20]}...")
                        print(f"   User ID: {user.get('id')}")
                        print(f"   Full Name: {user.get('full_name')}")
                    elif not token:
                        self.log_result(cred["name"], False, "No token received in response")
                    elif user_role != cred["expected_role"]:
                        self.log_result(cred["name"], False, 
                                      f"Wrong role: expected {cred['expected_role']}, got {user_role}")
                    else:
                        self.log_result(cred["name"], False, "Unexpected response format")
                except Exception as e:
                    self.log_result(cred["name"], False, f"Error parsing response: {str(e)}")
            elif response and response.status_code == 401:
                error_msg = "Authentication failed"
                try:
                    error_data = response.json()
                    error_msg = error_data.get("detail", error_msg)
                except:
                    pass
                self.log_result(cred["name"], False, f"401 Unauthorized: {error_msg}")
            else:
                error_msg = response.text if response else "Connection failed"
                self.log_result(cred["name"], False, f"Login failed: {error_msg}")
    
    def test_login_with_wrong_password(self):
        """Test login with wrong password should return 401"""
        print("\n=== TESTING LOGIN WITH WRONG PASSWORD ===")
        
        wrong_password_tests = [
            {
                "name": "Patient Wrong Password",
                "login": "patient1@test.com",
                "password": "wrongpassword"
            },
            {
                "name": "Admin Wrong Password", 
                "login": "admin@medischedule.com",
                "password": "wrongpassword"
            }
        ]
        
        for test in wrong_password_tests:
            login_data = {
                "login": test["login"],
                "password": test["password"]
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            
            if response and response.status_code == 401:
                try:
                    error_data = response.json()
                    error_message = error_data.get("detail", "")
                    
                    # Check if Vietnamese error message is returned
                    if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_message:
                        self.log_result(test["name"], True, 
                                      "Correctly returned 401 with Vietnamese error message")
                    else:
                        self.log_result(test["name"], True, 
                                      f"Correctly returned 401 with error: {error_message}")
                except:
                    self.log_result(test["name"], True, "Correctly returned 401")
            else:
                status = response.status_code if response else "No response"
                self.log_result(test["name"], False, 
                              f"Should return 401, got: {status}")
    
    def test_registration_new_account(self):
        """Test registration with new patient account"""
        print("\n=== TESTING REGISTRATION WITH NEW ACCOUNT ===")
        
        # Generate unique test data
        test_id = str(uuid.uuid4())[:8]
        
        registration_data = {
            "email": f"newpatient_{test_id}@test.com",
            "username": f"newpatient_{test_id}",
            "password": "12345678",
            "full_name": "Nguyễn Văn Bệnh Nhân Mới",
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
                    self.log_result("New Patient Registration", True, 
                                  "Successfully registered new patient account")
                    print(f"   New User ID: {user.get('id')}")
                    print(f"   Token received: {token[:20]}...")
                    
                    # Test immediate login with new account
                    login_data = {
                        "login": registration_data["email"],
                        "password": registration_data["password"]
                    }
                    
                    login_response = self.make_request("POST", "/auth/login", login_data)
                    if login_response and login_response.status_code == 200:
                        self.log_result("New Account Immediate Login", True, 
                                      "New account can login immediately")
                    else:
                        self.log_result("New Account Immediate Login", False, 
                                      "New account cannot login immediately")
                else:
                    self.log_result("New Patient Registration", False, 
                                  "Missing token or incorrect role in response")
            except Exception as e:
                self.log_result("New Patient Registration", False, 
                              f"Error parsing response: {str(e)}")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("New Patient Registration", False, 
                          f"Registration failed: {error_msg}")
    
    def test_duplicate_email_rejection(self):
        """Test registration with duplicate email should be rejected"""
        print("\n=== TESTING DUPLICATE EMAIL REJECTION ===")
        
        # Try to register with existing email
        duplicate_data = {
            "email": "patient1@test.com",  # Existing email
            "username": "duplicatetest",
            "password": "12345678",
            "full_name": "Duplicate Test User",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", duplicate_data)
        
        if response and response.status_code == 400:
            try:
                error_data = response.json()
                error_message = error_data.get("detail", "")
                
                if "Email đã được đăng ký" in error_message:
                    self.log_result("Duplicate Email Rejection", True, 
                                  "Correctly rejected duplicate email with Vietnamese message")
                else:
                    self.log_result("Duplicate Email Rejection", True, 
                                  f"Correctly rejected duplicate email: {error_message}")
            except:
                self.log_result("Duplicate Email Rejection", True, 
                              "Correctly rejected duplicate email")
        else:
            status = response.status_code if response else "No response"
            self.log_result("Duplicate Email Rejection", False, 
                          f"Should return 400, got: {status}")
    
    def test_password_validation(self):
        """Test password validation rules"""
        print("\n=== TESTING PASSWORD VALIDATION ===")
        
        test_id = str(uuid.uuid4())[:8]
        
        password_tests = [
            {
                "name": "Password Too Short",
                "password": "123",
                "should_fail": True
            },
            {
                "name": "Password Too Long",
                "password": "a" * 25,  # 25 characters
                "should_fail": True
            },
            {
                "name": "Password With Spaces",
                "password": "test 123 456",
                "should_fail": True
            },
            {
                "name": "Valid Password",
                "password": "validpass123",
                "should_fail": False
            }
        ]
        
        for test in password_tests:
            registration_data = {
                "email": f"passtest_{test_id}_{test['name'].replace(' ', '').lower()}@test.com",
                "username": f"passtest_{test_id}_{test['name'].replace(' ', '').lower()}",
                "password": test["password"],
                "full_name": "Password Test User",
                "phone": "0123456789",
                "role": "patient"
            }
            
            response = self.make_request("POST", "/auth/register", registration_data)
            
            if test["should_fail"]:
                if response and response.status_code == 422:  # Validation error
                    self.log_result(test["name"], True, 
                                  "Correctly rejected invalid password")
                else:
                    status = response.status_code if response else "No response"
                    self.log_result(test["name"], False, 
                                  f"Should reject invalid password, got: {status}")
            else:
                if response and response.status_code == 200:
                    self.log_result(test["name"], True, 
                                  "Correctly accepted valid password")
                else:
                    status = response.status_code if response else "No response"
                    self.log_result(test["name"], False, 
                                  f"Should accept valid password, got: {status}")
    
    def test_jwt_token_verification(self):
        """Test JWT token verification by accessing protected endpoint"""
        print("\n=== TESTING JWT TOKEN VERIFICATION ===")
        
        # First login to get a token
        login_data = {
            "login": "patient1@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            try:
                data = response.json()
                token = data.get("token")
                
                if token:
                    # Test accessing protected endpoint with token
                    headers = {
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {token}"
                    }
                    
                    me_response = requests.get(f"{self.base_url}/auth/me", 
                                             headers=headers, timeout=30, verify=False)
                    
                    if me_response.status_code == 200:
                        user_data = me_response.json()
                        self.log_result("JWT Token Verification", True, 
                                      f"Token valid, user: {user_data.get('full_name')}")
                    else:
                        self.log_result("JWT Token Verification", False, 
                                      f"Token verification failed: {me_response.status_code}")
                else:
                    self.log_result("JWT Token Verification", False, 
                                  "No token received from login")
            except Exception as e:
                self.log_result("JWT Token Verification", False, 
                              f"Error: {str(e)}")
        else:
            self.log_result("JWT Token Verification", False, 
                          "Could not login to get token")
    
    def test_backend_connectivity(self):
        """Test basic backend connectivity"""
        print("\n=== TESTING BACKEND CONNECTIVITY ===")
        
        # Test health endpoint
        try:
            response = requests.get(f"{self.base_url}/health", timeout=30, verify=False)
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_result("Backend Health Check", True, 
                                  f"Backend healthy, database: {data.get('database')}")
                else:
                    self.log_result("Backend Health Check", False, 
                                  f"Backend unhealthy: {data}")
            else:
                self.log_result("Backend Health Check", False, 
                              f"Health check failed: {response.status_code}")
        except Exception as e:
            self.log_result("Backend Health Check", False, 
                          f"Connection failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🔐 MediSchedule Authentication System Testing")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test backend connectivity first
        self.test_backend_connectivity()
        
        # Run authentication tests as requested
        self.test_login_with_existing_credentials()
        self.test_login_with_wrong_password()
        self.test_registration_new_account()
        self.test_duplicate_email_rejection()
        self.test_password_validation()
        self.test_jwt_token_verification()
        
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
            print("\n✅ ALL AUTHENTICATION TESTS PASSED!")
            print("🎉 Authentication system is working correctly!")
        else:
            print(f"\n❌ {failed_tests} AUTHENTICATION TESTS FAILED!")
            print("🔧 Authentication system needs fixes!")

if __name__ == "__main__":
    tester = AuthenticationTester()
    tester.run_all_tests()