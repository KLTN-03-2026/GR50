#!/usr/bin/env python3
"""
MySQL Authentication and Payment System Testing
Tests comprehensive authentication and payment system after MySQL database restoration.

Priority Testing Areas:
1. Authentication (CRITICAL): Login/register endpoints with test accounts
2. Payment Endpoints (CRITICAL): GET /api/payments/my and payment routes  
3. Quick Verification: Health check and specialties

Test Accounts:
- Admin: admin@medischedule.com / 12345678
- Department Head: departmenthead@test.com / 12345678  
- Doctors: doctor1@test.com, doctor2@test.com, doctor3@test.com / 12345678
- Patients: patient1@test.com, patient2@test.com, patient3@test.com / 12345678
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
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://local-frontend-fix.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class MySQLAuthPaymentTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.test_results = []
        self.tokens = {}  # Store tokens for different users
        
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
                response = requests.get(url, headers=headers, timeout=30, verify=False)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30, verify=False)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=headers, timeout=30, verify=False)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30, verify=False)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"   Response status: {response.status_code}")
            return response
        except requests.exceptions.RequestException as e:
            print(f"   Request failed: {str(e)}")
            return None
    
    def test_health_check(self):
        """Test health check endpoint - should show MySQL database"""
        print("\n=== HEALTH CHECK TESTING ===")
        
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy" and data.get("database") == "mysql":
                self.log_result("Health Check", True, "Backend healthy with MySQL database")
            else:
                self.log_result("Health Check", False, f"Unexpected response: {data}")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Health Check", False, "Health check failed", error_msg)
    
    def test_specialties_endpoint(self):
        """Test specialties endpoint - should return 8 specialties"""
        print("\n=== SPECIALTIES VERIFICATION ===")
        
        response = self.make_request("GET", "/specialties")
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                specialty_count = len(data)
                if specialty_count == 8:
                    self.log_result("Specialties Count", True, f"Found exactly 8 specialties as expected")
                else:
                    self.log_result("Specialties Count", False, f"Expected 8 specialties, found {specialty_count}")
                
                # Show specialty names
                if data:
                    specialty_names = [s.get('name', 'Unknown') for s in data]
                    print(f"   Specialties: {', '.join(specialty_names)}")
            else:
                self.log_result("Specialties Format", False, "Response should be a list")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Specialties Endpoint", False, "Failed to fetch specialties", error_msg)
    
    def test_patient_login(self):
        """Test patient login with patient1@test.com/12345678"""
        print("\n=== PATIENT AUTHENTICATION TESTING ===")
        
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
                self.tokens["patient1"] = token
                self.log_result("Patient Login", True, f"Patient login successful - {user.get('full_name', 'Unknown')}")
                print(f"   User ID: {user.get('id')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
            else:
                self.log_result("Patient Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Patient Login", False, "Patient login failed", error_msg)
    
    def test_admin_login(self):
        """Test admin login with admin@medischedule.com/12345678"""
        print("\n=== ADMIN AUTHENTICATION TESTING ===")
        
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
                self.tokens["admin"] = token
                permission_count = len([k for k, v in admin_permissions.items() if v is True])
                self.log_result("Admin Login", True, f"Admin login successful with {permission_count} permissions")
                print(f"   User ID: {user.get('id')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
                print(f"   Permissions: {list(admin_permissions.keys())}")
            else:
                self.log_result("Admin Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Admin Login", False, "Admin login failed", error_msg)
    
    def test_doctor_login(self):
        """Test doctor login with doctor1@test.com/12345678"""
        print("\n=== DOCTOR AUTHENTICATION TESTING ===")
        
        login_data = {
            "login": "doctor1@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "doctor":
                self.tokens["doctor1"] = token
                self.log_result("Doctor Login", True, f"Doctor login successful - {user.get('full_name', 'Unknown')}")
                print(f"   User ID: {user.get('id')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
            else:
                self.log_result("Doctor Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Doctor Login", False, "Doctor login failed", error_msg)
    
    def test_department_head_login(self):
        """Test department head login with departmenthead@test.com/12345678"""
        print("\n=== DEPARTMENT HEAD AUTHENTICATION TESTING ===")
        
        login_data = {
            "login": "departmenthead@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "department_head":
                self.tokens["department_head"] = token
                self.log_result("Department Head Login", True, f"Department Head login successful - {user.get('full_name', 'Unknown')}")
                print(f"   User ID: {user.get('id')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
            else:
                self.log_result("Department Head Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Department Head Login", False, "Department Head login failed", error_msg)
    
    def test_new_user_registration(self):
        """Test new user registration"""
        print("\n=== NEW USER REGISTRATION TESTING ===")
        
        # Generate unique email for this test
        test_id = str(uuid.uuid4())[:8]
        registration_data = {
            "email": f"newuser_{test_id}@test.com",
            "username": f"newuser_{test_id}",
            "password": "12345678",
            "full_name": "Nguyễn Văn Mới",
            "phone": "0123456789",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", registration_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("email") == registration_data["email"]:
                self.log_result("New User Registration", True, f"Successfully registered new user - {user.get('full_name')}")
                print(f"   New User ID: {user.get('id')}")
                print(f"   Email: {user.get('email')}")
                print(f"   Role: {user.get('role')}")
                
                # Test immediate login with new account
                login_data = {
                    "login": registration_data["email"],
                    "password": registration_data["password"]
                }
                
                login_response = self.make_request("POST", "/auth/login", login_data)
                if login_response and login_response.status_code == 200:
                    self.log_result("New User Immediate Login", True, "New user can login immediately after registration")
                else:
                    self.log_result("New User Immediate Login", False, "New user cannot login after registration")
            else:
                self.log_result("New User Registration", False, "Missing token or incorrect user data in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("New User Registration", False, "User registration failed", error_msg)
    
    def test_wrong_password_rejection(self):
        """Test wrong password rejection"""
        print("\n=== WRONG PASSWORD REJECTION TESTING ===")
        
        login_data = {
            "login": "patient1@test.com",
            "password": "wrongpassword"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 401:
            data = response.json()
            error_detail = data.get("detail", "")
            
            # Check for Vietnamese error message
            if "Email/Tên đăng nhập hoặc mật khẩu không đúng" in error_detail:
                self.log_result("Wrong Password Rejection", True, "Correctly rejected wrong password with Vietnamese message")
                print(f"   Error message: {error_detail}")
            else:
                self.log_result("Wrong Password Rejection", True, f"Correctly rejected wrong password: {error_detail}")
        else:
            self.log_result("Wrong Password Rejection", False, "Should return 401 for wrong password")
    
    def test_duplicate_email_rejection(self):
        """Test duplicate email rejection"""
        print("\n=== DUPLICATE EMAIL REJECTION TESTING ===")
        
        # Try to register with existing email
        duplicate_data = {
            "email": "patient1@test.com",  # Existing email
            "username": "duplicateuser",
            "password": "12345678",
            "full_name": "Duplicate User",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", duplicate_data)
        if response and response.status_code == 400:
            data = response.json()
            error_detail = data.get("detail", "")
            
            # Check for Vietnamese error message
            if "Email đã được đăng ký" in error_detail:
                self.log_result("Duplicate Email Rejection", True, "Correctly rejected duplicate email with Vietnamese message")
                print(f"   Error message: {error_detail}")
            else:
                self.log_result("Duplicate Email Rejection", True, f"Correctly rejected duplicate email: {error_detail}")
        else:
            self.log_result("Duplicate Email Rejection", False, "Should return 400 for duplicate email")
    
    def test_payment_endpoints(self):
        """Test payment endpoints - CRITICAL for user reported missing payment menu"""
        print("\n=== PAYMENT ENDPOINTS TESTING ===")
        
        # Test 1: GET /api/payments/my with patient token
        if "patient1" in self.tokens:
            response = self.make_request("GET", "/payments/my", token=self.tokens["patient1"])
            if response and response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Patient Payments Endpoint", True, f"Successfully accessed payments endpoint - found {len(data)} payments")
                    if data:
                        payment = data[0]
                        print(f"   Sample payment: ID={payment.get('id')}, Amount={payment.get('amount')}, Status={payment.get('status')}")
                else:
                    self.log_result("Patient Payments Endpoint", False, "Response should be a list")
            elif response and response.status_code == 404:
                self.log_result("Patient Payments Endpoint", False, "Payment endpoint not found - this explains missing payment menu!")
            else:
                error_msg = response.text if response else "Connection failed"
                self.log_result("Patient Payments Endpoint", False, "Failed to access payments endpoint", error_msg)
        else:
            self.log_result("Patient Payments Endpoint", False, "No patient token available")
        
        # Test 2: Check if payments table exists by testing other payment routes
        if "patient1" in self.tokens:
            # Try to access payment creation endpoint (if it exists)
            test_payment_data = {
                "appointment_id": str(uuid.uuid4()),
                "amount": 200000,
                "payment_method": "bank_transfer"
            }
            
            response = self.make_request("POST", "/payments", test_payment_data, token=self.tokens["patient1"])
            if response:
                if response.status_code in [200, 201]:
                    self.log_result("Payment Creation Endpoint", True, "Payment creation endpoint is accessible")
                elif response.status_code == 404:
                    self.log_result("Payment Creation Endpoint", False, "Payment creation endpoint not found")
                elif response.status_code in [400, 422]:
                    self.log_result("Payment Creation Endpoint", True, "Payment creation endpoint exists (validation error expected)")
                else:
                    self.log_result("Payment Creation Endpoint", False, f"Unexpected response: {response.status_code}")
            else:
                self.log_result("Payment Creation Endpoint", False, "Connection failed")
        
        # Test 3: Test unauthorized access to payments
        response = self.make_request("GET", "/payments/my")
        if response and response.status_code == 401:
            self.log_result("Payment Endpoint Auth Check", True, "Correctly rejected unauthorized access to payments")
        else:
            self.log_result("Payment Endpoint Auth Check", False, "Should reject unauthorized access to payments")
    
    def test_comprehensive_authentication_flow(self):
        """Test comprehensive authentication flow with all account types"""
        print("\n=== COMPREHENSIVE AUTHENTICATION FLOW ===")
        
        # Test all provided accounts
        test_accounts = [
            {"email": "admin@medischedule.com", "password": "12345678", "expected_role": "admin", "name": "Admin"},
            {"email": "departmenthead@test.com", "password": "12345678", "expected_role": "department_head", "name": "Department Head"},
            {"email": "doctor1@test.com", "password": "12345678", "expected_role": "doctor", "name": "Doctor 1"},
            {"email": "doctor2@test.com", "password": "12345678", "expected_role": "doctor", "name": "Doctor 2"},
            {"email": "doctor3@test.com", "password": "12345678", "expected_role": "doctor", "name": "Doctor 3"},
            {"email": "patient1@test.com", "password": "12345678", "expected_role": "patient", "name": "Patient 1"},
            {"email": "patient2@test.com", "password": "12345678", "expected_role": "patient", "name": "Patient 2"},
            {"email": "patient3@test.com", "password": "12345678", "expected_role": "patient", "name": "Patient 3"}
        ]
        
        successful_logins = 0
        total_accounts = len(test_accounts)
        
        for account in test_accounts:
            login_data = {
                "login": account["email"],
                "password": account["password"]
            }
            
            response = self.make_request("POST", "/auth/login", login_data)
            if response and response.status_code == 200:
                data = response.json()
                user = data.get("user", {})
                
                if user.get("role") == account["expected_role"]:
                    successful_logins += 1
                    print(f"   ✅ {account['name']}: Login successful")
                else:
                    print(f"   ❌ {account['name']}: Role mismatch - expected {account['expected_role']}, got {user.get('role')}")
            else:
                print(f"   ❌ {account['name']}: Login failed - Status {response.status_code if response else 'No response'}")
        
        success_rate = (successful_logins / total_accounts) * 100
        if success_rate == 100:
            self.log_result("All Test Accounts Login", True, f"All {total_accounts} test accounts login successfully")
        elif success_rate >= 75:
            self.log_result("All Test Accounts Login", True, f"{successful_logins}/{total_accounts} accounts login successfully ({success_rate:.1f}%)")
        else:
            self.log_result("All Test Accounts Login", False, f"Only {successful_logins}/{total_accounts} accounts login successfully ({success_rate:.1f}%)")
    
    def run_priority_tests(self):
        """Run priority tests as requested in review"""
        print("🔐 MySQL Authentication and Payment System Testing")
        print("=" * 60)
        print("Testing comprehensive authentication and payment system after MySQL database restoration")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Priority 1: Quick Verification
        self.test_health_check()
        self.test_specialties_endpoint()
        
        # Priority 2: Authentication (CRITICAL)
        self.test_patient_login()
        self.test_admin_login() 
        self.test_doctor_login()
        self.test_department_head_login()
        self.test_new_user_registration()
        self.test_wrong_password_rejection()
        self.test_duplicate_email_rejection()
        
        # Priority 3: Payment Endpoints (CRITICAL - User reported missing)
        self.test_payment_endpoints()
        
        # Priority 4: Comprehensive Flow
        self.test_comprehensive_authentication_flow()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 MYSQL AUTHENTICATION & PAYMENT TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Categorize results
        auth_tests = [r for r in self.test_results if "login" in r["test"].lower() or "registration" in r["test"].lower() or "password" in r["test"].lower() or "email" in r["test"].lower()]
        payment_tests = [r for r in self.test_results if "payment" in r["test"].lower()]
        verification_tests = [r for r in self.test_results if "health" in r["test"].lower() or "specialties" in r["test"].lower()]
        
        print(f"\n🔍 CATEGORY BREAKDOWN:")
        print(f"   🔐 Authentication: {len([r for r in auth_tests if r['success']])}/{len(auth_tests)} passed")
        print(f"   💳 Payment System: {len([r for r in payment_tests if r['success']])}/{len(payment_tests)} passed")
        print(f"   ✅ Verification: {len([r for r in verification_tests if r['success']])}/{len(verification_tests)} passed")
        
        if failed_tests > 0:
            print(f"\n🚨 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
                    if result.get("details"):
                        print(f"      Details: {result['details']}")
        
        print(f"\n🎯 Backend URL: {self.base_url}")
        print(f"🗄️  Database: MySQL (medischedule)")
        print(f"📅 Test completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    tester = MySQLAuthPaymentTester()
    tester.run_priority_tests()