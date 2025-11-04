#!/usr/bin/env python3
"""
MySQL Backend API Testing for MediSchedule System
Tests authentication, appointments, payments, and chat functionality after MySQL setup
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
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://code-mysql-local.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class MySQLMediScheduleTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.patient1_token = None
        self.doctor1_token = None
        self.admin_token = None
        self.departmenthead_token = None
        self.test_appointment_id = None
        self.test_results = []
        
        # Test credentials from review request
        self.test_accounts = {
            'patient1': {'email': 'patient1@test.com', 'password': '12345678'},
            'doctor1': {'email': 'doctor1@test.com', 'password': '12345678'},
            'admin': {'email': 'admin@medischedule.com', 'password': '12345678'},
            'departmenthead': {'email': 'departmenthead@test.com', 'password': '12345678'}
        }
        
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
    
    def test_authentication_priority1(self):
        """Priority 1: Test Authentication - Login and Registration"""
        print("\n=== PRIORITY 1: AUTHENTICATION TESTS ===")
        
        # Test 1: Login with patient1@test.com
        print("\n--- Test 1: Patient1 Login ---")
        login_data = {
            "login": self.test_accounts['patient1']['email'],
            "password": self.test_accounts['patient1']['password']
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "patient":
                self.patient1_token = token
                self.log_result("Patient1 Login", True, f"Successfully logged in as patient, token received")
                print(f"   User: {user.get('full_name')} ({user.get('email')})")
            else:
                self.log_result("Patient1 Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Patient1 Login", False, "Login failed", error_msg)
        
        # Test 2: Login with doctor1@test.com
        print("\n--- Test 2: Doctor1 Login ---")
        login_data = {
            "login": self.test_accounts['doctor1']['email'],
            "password": self.test_accounts['doctor1']['password']
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "doctor":
                self.doctor1_token = token
                self.log_result("Doctor1 Login", True, f"Successfully logged in as doctor, token received")
                print(f"   User: {user.get('full_name')} ({user.get('email')})")
            else:
                self.log_result("Doctor1 Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Doctor1 Login", False, "Login failed", error_msg)
        
        # Test 3: Login with admin@medischedule.com
        print("\n--- Test 3: Admin Login ---")
        login_data = {
            "login": self.test_accounts['admin']['email'],
            "password": self.test_accounts['admin']['password']
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "admin":
                self.admin_token = token
                self.log_result("Admin Login", True, f"Successfully logged in as admin, token received")
                print(f"   User: {user.get('full_name')} ({user.get('email')})")
            else:
                self.log_result("Admin Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Admin Login", False, "Login failed", error_msg)
        
        # Test 4: Login with departmenthead@test.com
        print("\n--- Test 4: Department Head Login ---")
        login_data = {
            "login": self.test_accounts['departmenthead']['email'],
            "password": self.test_accounts['departmenthead']['password']
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("role") == "department_head":
                self.departmenthead_token = token
                self.log_result("Department Head Login", True, f"Successfully logged in as department head, token received")
                print(f"   User: {user.get('full_name')} ({user.get('email')})")
            else:
                self.log_result("Department Head Login", False, "Missing token or incorrect role in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Department Head Login", False, "Login failed", error_msg)
        
        # Test 5: Registration Test
        print("\n--- Test 5: New User Registration ---")
        test_id = str(uuid.uuid4())[:8]
        register_data = {
            "email": f"newuser_{test_id}@test.com",
            "username": f"newuser_{test_id}",
            "password": "12345678",
            "full_name": "Nguyễn Văn Test User",
            "phone": "0123456789",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", register_data)
        if response and response.status_code == 200:
            data = response.json()
            token = data.get("token")
            user = data.get("user", {})
            
            if token and user.get("email") == register_data["email"]:
                self.log_result("New User Registration", True, f"Successfully registered new user")
                print(f"   New User: {user.get('full_name')} ({user.get('email')})")
            else:
                self.log_result("New User Registration", False, "Missing token or incorrect user data in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("New User Registration", False, "Registration failed", error_msg)
    
    def test_appointments_priority2(self):
        """Priority 2: Test Appointment functionality"""
        print("\n=== PRIORITY 2: APPOINTMENT TESTS ===")
        
        if not self.patient1_token:
            self.log_result("Appointments Test", False, "No patient1 token available")
            return
        
        # Test 1: Get Patient Appointments
        print("\n--- Test 1: Get Patient Appointments ---")
        response = self.make_request("GET", "/appointments/my", token=self.patient1_token)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get Patient Appointments", True, f"Successfully retrieved {len(data)} appointments")
                
                # Check if appointments have required fields
                if data:
                    appointment = data[0]
                    required_fields = ['id', 'patient_id', 'doctor_id', 'appointment_date', 'appointment_time', 'status', 'doctor_name']
                    missing_fields = [field for field in required_fields if field not in appointment]
                    
                    if not missing_fields:
                        self.log_result("Appointment Fields Check", True, "All required fields present in appointment")
                        
                        # Check for appointment_type field specifically mentioned in review
                        if 'appointment_type' in appointment:
                            self.log_result("Appointment Type Field", True, f"appointment_type field exists: {appointment.get('appointment_type')}")
                        else:
                            self.log_result("Appointment Type Field", False, "appointment_type field missing")
                        
                        print(f"   Sample appointment: {appointment}")
                    else:
                        self.log_result("Appointment Fields Check", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Appointment Fields Check", True, "No appointments to check (empty list)")
            else:
                self.log_result("Get Patient Appointments", False, "Response should be a list")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Get Patient Appointments", False, "Failed to get appointments", error_msg)
        
        # Test 2: Create New Appointment
        print("\n--- Test 2: Create New Appointment ---")
        if self.doctor1_token:
            # First get doctor ID from doctor login
            doctor_response = self.make_request("GET", "/auth/me", token=self.doctor1_token)
            if doctor_response and doctor_response.status_code == 200:
                doctor_data = doctor_response.json()
                doctor_id = doctor_data.get("id")
                
                if doctor_id:
                    appointment_data = {
                        "doctor_id": doctor_id,
                        "appointment_date": "2024-12-25",
                        "appointment_time": "14:00",
                        "symptoms": "Đau đầu và sốt nhẹ - test appointment"
                    }
                    
                    response = self.make_request("POST", "/appointments", appointment_data, token=self.patient1_token)
                    if response and response.status_code == 200:
                        data = response.json()
                        appointment_id = data.get("id")
                        
                        if appointment_id:
                            self.test_appointment_id = appointment_id
                            self.log_result("Create New Appointment", True, f"Successfully created appointment: {appointment_id}")
                            print(f"   Appointment details: {data}")
                        else:
                            self.log_result("Create New Appointment", False, "Missing appointment_id in response")
                    else:
                        error_msg = response.text if response else "Connection failed"
                        self.log_result("Create New Appointment", False, "Failed to create appointment", error_msg)
                else:
                    self.log_result("Create New Appointment", False, "Could not get doctor ID")
            else:
                self.log_result("Create New Appointment", False, "Could not get doctor info")
        else:
            self.log_result("Create New Appointment", False, "No doctor1 token available")
    
    def test_payments_priority3(self):
        """Priority 3: Test Payment functionality"""
        print("\n=== PRIORITY 3: PAYMENT TESTS ===")
        
        if not self.patient1_token:
            self.log_result("Payments Test", False, "No patient1 token available")
            return
        
        # Test 1: Get Patient Payments
        print("\n--- Test 1: Get Patient Payments ---")
        response = self.make_request("GET", "/payments/my", token=self.patient1_token)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get Patient Payments", True, f"Successfully retrieved {len(data)} payments")
                
                # Check payment fields
                if data:
                    payment = data[0]
                    required_fields = ['payment_id', 'appointment_id', 'patient_id', 'doctor_id', 'amount', 'payment_method', 'status']
                    missing_fields = [field for field in required_fields if field not in payment]
                    
                    if not missing_fields:
                        self.log_result("Payment Fields Check", True, "All required fields present in payment")
                        print(f"   Sample payment: {payment}")
                    else:
                        self.log_result("Payment Fields Check", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Payment Fields Check", True, "No payments to check (empty list)")
            else:
                self.log_result("Get Patient Payments", False, "Response should be a list")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Get Patient Payments", False, "Failed to get payments", error_msg)
    
    def test_chat_priority4(self):
        """Priority 4: Test Chat functionality"""
        print("\n=== PRIORITY 4: CHAT TESTS ===")
        
        if not self.patient1_token or not self.doctor1_token:
            self.log_result("Chat Test", False, "Missing patient1 or doctor1 token")
            return
        
        # Use the test appointment ID if we created one, otherwise try to get existing appointments
        appointment_id = self.test_appointment_id
        
        if not appointment_id:
            # Try to get an existing appointment
            response = self.make_request("GET", "/appointments/my", token=self.patient1_token)
            if response and response.status_code == 200:
                appointments = response.json()
                if appointments:
                    appointment_id = appointments[0].get("id")
        
        if not appointment_id:
            self.log_result("Chat Test Setup", False, "No appointment ID available for chat testing")
            return
        
        # Test 1: Get Chat Messages
        print(f"\n--- Test 1: Get Chat Messages for appointment {appointment_id} ---")
        response = self.make_request("GET", f"/chat/{appointment_id}", token=self.patient1_token)
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_result("Get Chat Messages", True, f"Successfully retrieved {len(data)} chat messages")
                
                # Check message fields if any exist
                if data:
                    message = data[0]
                    required_fields = ['id', 'appointment_id', 'sender_id', 'message', 'created_at', 'sender_name']
                    missing_fields = [field for field in required_fields if field not in message]
                    
                    if not missing_fields:
                        self.log_result("Chat Message Fields Check", True, "All required fields present in message")
                        print(f"   Sample message: {message}")
                    else:
                        self.log_result("Chat Message Fields Check", False, f"Missing fields: {missing_fields}")
                else:
                    self.log_result("Chat Message Fields Check", True, "No messages to check (empty list)")
            else:
                self.log_result("Get Chat Messages", False, "Response should be a list")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Get Chat Messages", False, "Failed to get chat messages", error_msg)
        
        # Test 2: Send Chat Message (as patient)
        print(f"\n--- Test 2: Send Chat Message as Patient ---")
        message_data = {
            "appointment_id": appointment_id,
            "message": "Xin chào bác sĩ, tôi muốn hỏi về tình trạng sức khỏe của mình."
        }
        
        response = self.make_request("POST", "/chat/send", message_data, token=self.patient1_token)
        if response and response.status_code == 200:
            data = response.json()
            message_id = data.get("id")
            
            if message_id:
                self.log_result("Send Chat Message (Patient)", True, f"Successfully sent message: {message_id}")
                print(f"   Message details: {data}")
            else:
                self.log_result("Send Chat Message (Patient)", False, "Missing message ID in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Send Chat Message (Patient)", False, "Failed to send message", error_msg)
        
        # Test 3: Send Chat Message (as doctor)
        print(f"\n--- Test 3: Send Chat Message as Doctor ---")
        message_data = {
            "appointment_id": appointment_id,
            "message": "Chào bạn! Tôi đã xem thông tin của bạn. Bạn có thể mô tả chi tiết hơn về triệu chứng không?"
        }
        
        response = self.make_request("POST", "/chat/send", message_data, token=self.doctor1_token)
        if response and response.status_code == 200:
            data = response.json()
            message_id = data.get("id")
            
            if message_id:
                self.log_result("Send Chat Message (Doctor)", True, f"Successfully sent message: {message_id}")
                print(f"   Message details: {data}")
            else:
                self.log_result("Send Chat Message (Doctor)", False, "Missing message ID in response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("Send Chat Message (Doctor)", False, "Failed to send message", error_msg)
    
    def test_database_connection(self):
        """Test MySQL database connection"""
        print("\n=== DATABASE CONNECTION TEST ===")
        
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy" and data.get("database") == "mysql":
                self.log_result("MySQL Database Connection", True, "Database connection healthy")
                print(f"   Health check response: {data}")
            else:
                self.log_result("MySQL Database Connection", False, "Unexpected health check response")
        else:
            error_msg = response.text if response else "Connection failed"
            self.log_result("MySQL Database Connection", False, "Health check failed", error_msg)
    
    def run_all_tests(self):
        """Run all tests in priority order"""
        print("🏥 MediSchedule MySQL Backend Testing")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test database connection first
        self.test_database_connection()
        
        # Priority 1: Authentication Tests
        self.test_authentication_priority1()
        
        # Priority 2: Appointment Tests
        self.test_appointments_priority2()
        
        # Priority 3: Payment Tests
        self.test_payments_priority3()
        
        # Priority 4: Chat Tests
        self.test_chat_priority4()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 MYSQL MEDISCHEDULE TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Group results by priority
        priority_groups = {
            "Database Connection": [],
            "Priority 1 - Authentication": [],
            "Priority 2 - Appointments": [],
            "Priority 3 - Payments": [],
            "Priority 4 - Chat": []
        }
        
        for result in self.test_results:
            test_name = result["test"]
            if "Database" in test_name:
                priority_groups["Database Connection"].append(result)
            elif any(auth_term in test_name for auth_term in ["Login", "Registration"]):
                priority_groups["Priority 1 - Authentication"].append(result)
            elif "Appointment" in test_name:
                priority_groups["Priority 2 - Appointments"].append(result)
            elif "Payment" in test_name:
                priority_groups["Priority 3 - Payments"].append(result)
            elif "Chat" in test_name:
                priority_groups["Priority 4 - Chat"].append(result)
        
        for group_name, results in priority_groups.items():
            if results:
                passed = len([r for r in results if r["success"]])
                total = len(results)
                print(f"\n{group_name}: {passed}/{total} passed")
                for result in results:
                    status = "✅" if result["success"] else "❌"
                    print(f"   {status} {result['test']}")
        
        if failed_tests > 0:
            print(f"\n🔍 FAILED TESTS DETAILS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
                    if result.get("details"):
                        print(f"      Details: {result['details']}")
        
        print(f"\n🎯 Backend URL: {self.base_url}")
        print(f"🗄️  Database: MySQL (medischedule)")
        print(f"🔑 Test Accounts: patient1@test.com, doctor1@test.com, admin@medischedule.com, departmenthead@test.com")
        print(f"🔒 Password: 12345678 (for all accounts)")

if __name__ == "__main__":
    tester = MySQLMediScheduleTester()
    tester.run_all_tests()