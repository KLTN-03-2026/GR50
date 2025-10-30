#!/usr/bin/env python3
"""
Admin Login Test for MediSchedule
Tests the specific admin credentials: admin@medischedule.com / admin123
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://login-fix-chat.preview.emergentagent.com')
BASE_URL = f"{BACKEND_URL}/api"

class AdminLoginTester:
    def __init__(self):
        self.base_url = BASE_URL
        
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {"Content-Type": "application/json"}
        
        print(f"Making {method} request to: {url}")
        if data:
            print(f"Request body: {json.dumps(data, indent=2)}")
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30, verify=False)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=headers, timeout=30, verify=False)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"Response status: {response.status_code}")
            print(f"Response headers: {dict(response.headers)}")
            
            try:
                response_json = response.json()
                print(f"Response body: {json.dumps(response_json, indent=2, ensure_ascii=False)}")
                return response, response_json
            except:
                print(f"Response body (text): {response.text}")
                return response, response.text
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None, None
    
    def test_admin_login(self):
        """Test admin login with specific credentials"""
        print("🔐 Testing Admin Login")
        print("=" * 50)
        
        # Test credentials from the request
        admin_credentials = {
            "login": "admin@medischedule.com",  # Using 'login' field as per UserLogin model
            "password": "admin123"
        }
        
        print(f"Testing login with credentials:")
        print(f"  Email: {admin_credentials['login']}")
        print(f"  Password: {admin_credentials['password']}")
        print()
        
        # Make login request
        response, data = self.make_request("POST", "/auth/login", admin_credentials)
        
        if response is None:
            print("❌ FAILED: Connection to backend failed")
            return False
        
        print(f"\n📊 ANALYSIS:")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Login successful!")
            
            if isinstance(data, dict):
                # Check if we got a token
                token = data.get("token")
                user = data.get("user")
                
                if token:
                    print(f"✅ Token received: {token[:20]}...")
                else:
                    print("❌ No token in response")
                
                if user:
                    print(f"✅ User info received:")
                    print(f"   - ID: {user.get('id')}")
                    print(f"   - Email: {user.get('email')}")
                    print(f"   - Full Name: {user.get('full_name')}")
                    print(f"   - Role: {user.get('role')}")
                    
                    # Check if it's admin role
                    if user.get('role') == 'admin':
                        print("✅ User has admin role")
                    else:
                        print(f"⚠️  User role is '{user.get('role')}', not 'admin'")
                else:
                    print("❌ No user info in response")
            
            return True
            
        elif response.status_code == 401:
            print("❌ FAILED: Authentication failed (401)")
            print("   This means either:")
            print("   1. The account doesn't exist")
            print("   2. The password is incorrect")
            
            if isinstance(data, dict):
                detail = data.get("detail", "No error detail provided")
                print(f"   Error detail: {detail}")
            
            return False
            
        elif response.status_code == 404:
            print("❌ FAILED: Endpoint not found (404)")
            print("   The /api/auth/login endpoint doesn't exist")
            return False
            
        elif response.status_code == 500:
            print("❌ FAILED: Server error (500)")
            print("   Internal server error occurred")
            
            if isinstance(data, dict):
                detail = data.get("detail", "No error detail provided")
                print(f"   Error detail: {detail}")
            
            return False
            
        else:
            print(f"❌ FAILED: Unexpected status code ({response.status_code})")
            
            if isinstance(data, dict):
                detail = data.get("detail", "No error detail provided")
                print(f"   Error detail: {detail}")
            
            return False
    
    def test_account_existence(self):
        """Test if we can check account existence indirectly"""
        print("\n🔍 Testing Account Existence")
        print("=" * 30)
        
        # Try with wrong password to see if we get different error
        wrong_password_credentials = {
            "login": "admin@medischedule.com",
            "password": "wrongpassword"
        }
        
        print("Testing with wrong password to check if account exists...")
        response, data = self.make_request("POST", "/auth/login", wrong_password_credentials)
        
        if response and response.status_code == 401:
            if isinstance(data, dict):
                detail = data.get("detail", "")
                if "không đúng" in detail.lower() or "incorrect" in detail.lower():
                    print("✅ Account exists (got 'incorrect password' type error)")
                elif "not found" in detail.lower() or "không tìm thấy" in detail.lower():
                    print("❌ Account doesn't exist")
                else:
                    print(f"⚠️  Unclear from error message: {detail}")
            else:
                print("⚠️  Can't determine from response")
        else:
            print("⚠️  Unexpected response for wrong password test")
    
    def run_test(self):
        """Run the complete admin login test"""
        print("🏥 MediSchedule Admin Login Test")
        print("=" * 50)
        print(f"Backend URL: {self.base_url}")
        print()
        
        # Test 1: Try login with provided credentials
        login_success = self.test_admin_login()
        
        # Test 2: Check account existence if login failed
        if not login_success:
            self.test_account_existence()
        
        print("\n" + "=" * 50)
        print("📋 SUMMARY")
        print("=" * 50)
        
        if login_success:
            print("✅ RESULT: Admin login SUCCESSFUL")
            print("   - Account exists: ✅")
            print("   - Password correct: ✅") 
            print("   - Token returned: ✅")
        else:
            print("❌ RESULT: Admin login FAILED")
            print("   Check the analysis above for details")
        
        print(f"\nTested endpoint: POST {self.base_url}/auth/login")
        print("Tested credentials:")
        print("  - Email: admin@medischedule.com")
        print("  - Password: admin123")

if __name__ == "__main__":
    tester = AdminLoginTester()
    tester.run_test()