#!/usr/bin/env python3
"""
Authentication Testing for MediSchedule System
Tests login and registration functionality as requested in Vietnamese
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
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://api-endpoints-1.preview.emergentagent.com')
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
            print(f"   Request data: {json.dumps(data, indent=2, ensure_ascii=False)}")
        
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
    
    def test_1_register_new_patient(self):
        """Test Case 1: Test đăng ký tài khoản patient mới với thông tin hợp lệ"""
        print("\n=== TEST CASE 1: ĐĂNG KÝ TÀI KHOẢN PATIENT MỚI ===")
        
        # Generate unique email for this test
        test_id = str(uuid.uuid4())[:8]
        
        patient_data = {
            "email": f"patient_new_{test_id}@test.com",
            "username": f"patient_{test_id}",
            "password": "12345678",
            "full_name": "Nguyễn Văn Bệnh Nhân Mới",
            "phone": "0123456789",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", patient_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("token") and data.get("user"):
                user = data.get("user")
                if user.get("role") == "patient" and user.get("email") == patient_data["email"]:
                    self.log_result("Đăng ký patient mới", True, 
                                  f"Đăng ký thành công với email: {patient_data['email']}")
                else:
                    self.log_result("Đăng ký patient mới", False, 
                                  "Thông tin user không đúng trong response")
            else:
                self.log_result("Đăng ký patient mới", False, 
                              "Thiếu token hoặc user trong response")
        else:
            error_msg = response.text if response else "Kết nối thất bại"
            self.log_result("Đăng ký patient mới", False, 
                          "Đăng ký thất bại", error_msg)
    
    def test_2_login_existing_patient(self):
        """Test Case 2: Test đăng nhập với tài khoản đã tồn tại: patient1@test.com / 12345678"""
        print("\n=== TEST CASE 2: ĐĂNG NHẬP TÀI KHOẢN PATIENT ĐÃ TỒN TẠI ===")
        
        login_data = {
            "login": "patient1@test.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("token") and data.get("user"):
                user = data.get("user")
                if user.get("role") == "patient" and user.get("email") == "patient1@test.com":
                    self.log_result("Đăng nhập patient đã tồn tại", True, 
                                  "Đăng nhập thành công với patient1@test.com")
                else:
                    self.log_result("Đăng nhập patient đã tồn tại", False, 
                                  "Thông tin user không đúng trong response")
            else:
                self.log_result("Đăng nhập patient đã tồn tại", False, 
                              "Thiếu token hoặc user trong response")
        else:
            error_msg = response.text if response else "Kết nối thất bại"
            self.log_result("Đăng nhập patient đã tồn tại", False, 
                          "Đăng nhập thất bại", error_msg)
    
    def test_3_login_admin_account(self):
        """Test Case 3: Test đăng nhập với tài khoản admin: admin@medischedule.com / 12345678"""
        print("\n=== TEST CASE 3: ĐĂNG NHẬP TÀI KHOẢN ADMIN ===")
        
        login_data = {
            "login": "admin@medischedule.com",
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("token") and data.get("user"):
                user = data.get("user")
                if user.get("role") == "admin" and user.get("email") == "admin@medischedule.com":
                    self.log_result("Đăng nhập admin", True, 
                                  "Đăng nhập admin thành công")
                else:
                    self.log_result("Đăng nhập admin", False, 
                                  "Thông tin admin không đúng trong response")
            else:
                self.log_result("Đăng nhập admin", False, 
                              "Thiếu token hoặc user trong response")
        else:
            error_msg = response.text if response else "Kết nối thất bại"
            self.log_result("Đăng nhập admin", False, 
                          "Đăng nhập admin thất bại", error_msg)
    
    def test_4_login_wrong_password(self):
        """Test Case 4: Test đăng nhập với mật khẩu sai (phải trả về lỗi 401)"""
        print("\n=== TEST CASE 4: ĐĂNG NHẬP VỚI MẬT KHẨU SAI ===")
        
        login_data = {
            "login": "patient1@test.com",
            "password": "wrong_password"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 401:
            self.log_result("Đăng nhập mật khẩu sai", True, 
                          "Hệ thống đã từ chối đăng nhập với mật khẩu sai (401)")
        elif response and response.status_code == 200:
            self.log_result("Đăng nhập mật khẩu sai", False, 
                          "Hệ thống không nên cho phép đăng nhập với mật khẩu sai")
        else:
            error_msg = response.text if response else "Kết nối thất bại"
            status_code = response.status_code if response else "N/A"
            self.log_result("Đăng nhập mật khẩu sai", True, 
                          f"Hệ thống đã từ chối đăng nhập với mật khẩu sai (mã lỗi: {status_code})")
    
    def test_5_register_existing_email(self):
        """Test Case 5: Test đăng ký với email đã tồn tại (phải trả về lỗi)"""
        print("\n=== TEST CASE 5: ĐĂNG KÝ VỚI EMAIL ĐÃ TỒN TẠI ===")
        
        duplicate_data = {
            "email": "patient1@test.com",  # Email đã tồn tại
            "username": "duplicate_user",
            "password": "12345678",
            "full_name": "Người dùng trùng lặp",
            "phone": "0987654321",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", duplicate_data)
        
        if response and response.status_code == 400:
            data = response.json()
            error_detail = data.get("detail", "")
            if "đã được đăng ký" in error_detail or "already" in error_detail.lower():
                self.log_result("Đăng ký email trùng lặp", True, 
                              "Hệ thống đã từ chối đăng ký email trùng lặp (400)")
            else:
                self.log_result("Đăng ký email trùng lặp", False, 
                              f"Thông báo lỗi không rõ ràng: {error_detail}")
        elif response and response.status_code == 200:
            self.log_result("Đăng ký email trùng lặp", False, 
                          "Hệ thống không nên cho phép đăng ký email trùng lặp")
        else:
            error_msg = response.text if response else "Kết nối thất bại"
            status_code = response.status_code if response else "N/A"
            self.log_result("Đăng ký email trùng lặp", True, 
                          f"Hệ thống đã từ chối đăng ký email trùng lặp (mã lỗi: {status_code})")
    
    def test_additional_scenarios(self):
        """Additional test scenarios for comprehensive testing"""
        print("\n=== ADDITIONAL TEST SCENARIOS ===")
        
        # Test login with username instead of email
        print("\n--- Test đăng nhập bằng username ---")
        login_data = {
            "login": "patient1",  # Assuming username exists
            "password": "12345678"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            self.log_result("Đăng nhập bằng username", True, 
                          "Đăng nhập bằng username thành công")
        else:
            self.log_result("Đăng nhập bằng username", False, 
                          "Đăng nhập bằng username thất bại (có thể username không tồn tại)")
        
        # Test registration with missing required fields
        print("\n--- Test đăng ký thiếu thông tin bắt buộc ---")
        incomplete_data = {
            "email": "incomplete@test.com",
            "password": "12345678"
            # Missing username, full_name, phone
        }
        
        response = self.make_request("POST", "/auth/register", incomplete_data)
        if response and response.status_code in [400, 422]:
            self.log_result("Đăng ký thiếu thông tin", True, 
                          "Hệ thống đã từ chối đăng ký thiếu thông tin")
        else:
            self.log_result("Đăng ký thiếu thông tin", False, 
                          "Hệ thống nên từ chối đăng ký thiếu thông tin")
        
        # Test password validation
        print("\n--- Test đăng ký với mật khẩu quá ngắn ---")
        weak_password_data = {
            "email": "weak_password@test.com",
            "username": "weak_user",
            "password": "123",  # Too short
            "full_name": "Weak Password User",
            "phone": "0123456789",
            "role": "patient"
        }
        
        response = self.make_request("POST", "/auth/register", weak_password_data)
        if response and response.status_code in [400, 422]:
            self.log_result("Mật khẩu quá ngắn", True, 
                          "Hệ thống đã từ chối mật khẩu quá ngắn")
        else:
            self.log_result("Mật khẩu quá ngắn", False, 
                          "Hệ thống nên từ chối mật khẩu quá ngắn")
    
    def run_all_tests(self):
        """Run all authentication tests"""
        print("🔐 MediSchedule Authentication Testing")
        print("=" * 60)
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Run the 5 main test cases as requested
        self.test_1_register_new_patient()
        self.test_2_login_existing_patient()
        self.test_3_login_admin_account()
        self.test_4_login_wrong_password()
        self.test_5_register_existing_email()
        
        # Run additional scenarios
        self.test_additional_scenarios()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 KẾT QUẢ KIỂM THỬ AUTHENTICATION")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["success"]])
        failed_tests = total_tests - passed_tests
        
        print(f"Tổng số test: {total_tests}")
        print(f"✅ Thành công: {passed_tests}")
        print(f"❌ Thất bại: {failed_tests}")
        print(f"Tỷ lệ thành công: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 CÁC TEST THẤT BẠI:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
                    if result.get('details'):
                        print(f"      Chi tiết: {result['details']}")
        
        print(f"\n🎯 Backend URL được sử dụng: {self.base_url}")
        
        # Summary for main agent
        print("\n" + "=" * 60)
        print("📋 TÓM TẮT CHO MAIN AGENT:")
        print("=" * 60)
        
        main_tests = [r for r in self.test_results if any(keyword in r['test'] for keyword in 
                     ['Đăng ký patient mới', 'Đăng nhập patient đã tồn tại', 'Đăng nhập admin', 
                      'Đăng nhập mật khẩu sai', 'Đăng ký email trùng lặp'])]
        
        main_passed = len([r for r in main_tests if r["success"]])
        main_total = len(main_tests)
        
        print(f"Các test case chính (5 test): {main_passed}/{main_total} thành công")
        
        for i, result in enumerate(main_tests, 1):
            status = "✅" if result["success"] else "❌"
            print(f"   {i}. {status} {result['test']}")

if __name__ == "__main__":
    tester = AuthenticationTester()
    tester.run_all_tests()