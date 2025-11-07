#!/usr/bin/env python3
"""
Payment System Backend Testing
Testing the newly implemented payment system endpoints
"""

import asyncio
import aiohttp
import json
import sys
from datetime import datetime, timezone
import uuid

# Backend URL from environment
BACKEND_URL = "https://auth-troubleshoot-20.preview.emergentagent.com/api"

# Test credentials
TEST_PATIENT = {
    "username": "patient1@test.com",
    "password": "12345678"
}

class PaymentSystemTester:
    def __init__(self):
        self.session = None
        self.patient_token = None
        self.patient_data = None
        self.appointment_id = None
        self.payment_id = None
        self.doctor_id = None
        
    async def setup_session(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    async def make_request(self, method, endpoint, headers=None, json_data=None):
        """Make HTTP request with error handling"""
        url = f"{BACKEND_URL}{endpoint}"
        try:
            async with self.session.request(
                method, url, 
                headers=headers or {}, 
                json=json_data,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                response_text = await response.text()
                try:
                    response_json = json.loads(response_text) if response_text else {}
                except json.JSONDecodeError:
                    response_json = {"raw_response": response_text}
                
                return {
                    "status": response.status,
                    "data": response_json,
                    "headers": dict(response.headers)
                }
        except Exception as e:
            return {
                "status": 0,
                "data": {"error": str(e)},
                "headers": {}
            }
    
    async def test_patient_login(self):
        """Test 1: Patient Login (verify credentials work)"""
        print("🔐 Test 1: Patient Login")
        
        response = await self.make_request(
            "POST", "/auth/login",
            json_data={
                "login": TEST_PATIENT["username"],
                "password": TEST_PATIENT["password"]
            }
        )
        
        if response["status"] == 200:
            self.patient_token = response["data"].get("token")
            self.patient_data = response["data"].get("user")
            print(f"✅ Login successful - Token: {self.patient_token[:20]}...")
            print(f"   Patient ID: {self.patient_data.get('id')}")
            print(f"   Patient Name: {self.patient_data.get('full_name')}")
            return True
        else:
            print(f"❌ Login failed - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_get_approved_doctors(self):
        """Get approved doctors to get doctor_id for appointment creation"""
        print("\n👨‍⚕️ Getting approved doctors list")
        
        response = await self.make_request("GET", "/doctors")
        
        if response["status"] == 200:
            doctors = response["data"]
            if doctors:
                self.doctor_id = doctors[0].get("user_id")
                print(f"✅ Found {len(doctors)} approved doctors")
                print(f"   Using Doctor ID: {self.doctor_id}")
                print(f"   Doctor Name: {doctors[0].get('full_name')}")
                return True
            else:
                print("❌ No approved doctors found")
                return False
        else:
            print(f"❌ Failed to get doctors - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_get_existing_appointments(self):
        """Test 2: Get Patient's Existing Appointments"""
        print("\n📅 Test 2: Get Patient's Existing Appointments")
        
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = await self.make_request("GET", "/appointments/my", headers=headers)
        
        if response["status"] == 200:
            appointments = response["data"]
            print(f"✅ Retrieved {len(appointments)} appointments")
            if appointments:
                self.appointment_id = appointments[0].get("id")
                print(f"   First appointment ID: {self.appointment_id}")
                for apt in appointments[:3]:  # Show first 3
                    print(f"   - {apt.get('appointment_date')} {apt.get('appointment_time')} with Dr. {apt.get('doctor_name')}")
            return True
        else:
            print(f"❌ Failed to get appointments - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_get_payment_history(self):
        """Test 3: Get Patient Payment History"""
        print("\n💳 Test 3: Get Patient Payment History")
        
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = await self.make_request("GET", "/payments/my", headers=headers)
        
        if response["status"] == 200:
            payments = response["data"]
            print(f"✅ Retrieved {len(payments)} payments")
            if payments:
                for payment in payments[:3]:  # Show first 3
                    print(f"   - Payment ID: {payment.get('id')}")
                    print(f"     Amount: {payment.get('amount')} VND")
                    print(f"     Status: {payment.get('status')}")
                    print(f"     Doctor: {payment.get('doctor_name')}")
            else:
                print("   No payment history found (expected for new account)")
            return True
        else:
            print(f"❌ Failed to get payment history - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_create_appointment(self):
        """Test 4: Create New Appointment (should auto-create payment)"""
        print("\n📝 Test 4: Create New Appointment")
        
        if not self.doctor_id:
            print("❌ No doctor ID available - skipping appointment creation")
            return False
            
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        appointment_data = {
            "doctor_id": self.doctor_id,
            "appointment_date": "2025-02-01",
            "appointment_time": "10:00",
            "symptoms": "Test payment system integration"
        }
        
        response = await self.make_request(
            "POST", "/appointments", 
            headers=headers, 
            json_data=appointment_data
        )
        
        if response["status"] == 200:
            appointment = response["data"]
            self.appointment_id = appointment.get("id")
            print(f"✅ Appointment created successfully")
            print(f"   Appointment ID: {self.appointment_id}")
            print(f"   Date: {appointment.get('appointment_date')} {appointment.get('appointment_time')}")
            print(f"   Doctor: {appointment.get('doctor_name')}")
            print(f"   Patient: {appointment.get('patient_name')}")
            return True
        else:
            print(f"❌ Failed to create appointment - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_verify_payment_auto_created(self):
        """Test 5: Verify Payment Auto-Created"""
        print("\n🔍 Test 5: Verify Payment Auto-Created")
        
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = await self.make_request("GET", "/payments/my", headers=headers)
        
        if response["status"] == 200:
            payments = response["data"]
            # Look for payment with our appointment_id
            new_payment = None
            for payment in payments:
                if payment.get("appointment_id") == self.appointment_id:
                    new_payment = payment
                    break
            
            if new_payment:
                self.payment_id = new_payment.get("id")
                print(f"✅ Payment auto-created successfully")
                print(f"   Payment ID: {self.payment_id}")
                print(f"   Amount: {new_payment.get('amount')} VND")
                print(f"   Status: {new_payment.get('status')}")
                print(f"   Payment Method: {new_payment.get('payment_method')}")
                return True
            else:
                print(f"❌ No payment found for appointment {self.appointment_id}")
                print(f"   Available payments: {len(payments)}")
                return False
        else:
            print(f"❌ Failed to verify payment creation - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_get_payment_details(self):
        """Test 6: Get Payment Details"""
        print("\n📋 Test 6: Get Payment Details")
        
        if not self.payment_id:
            print("❌ No payment ID available - skipping payment details test")
            return False
            
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = await self.make_request("GET", f"/payments/{self.payment_id}", headers=headers)
        
        if response["status"] == 200:
            payment = response["data"]
            print(f"✅ Payment details retrieved successfully")
            print(f"   Payment ID: {payment.get('id')}")
            print(f"   Amount: {payment.get('amount')} VND")
            print(f"   Patient Name: {payment.get('patient_name')}")
            print(f"   Doctor Name: {payment.get('doctor_name')}")
            print(f"   Status: {payment.get('status')}")
            print(f"   Created: {payment.get('created_at')}")
            return True
        else:
            print(f"❌ Failed to get payment details - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_process_payment(self):
        """Test 7: Process Payment (simulate payment completion)"""
        print("\n💰 Test 7: Process Payment")
        
        if not self.payment_id:
            print("❌ No payment ID available - skipping payment processing")
            return False
            
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        payment_data = {
            "payment_method": "mock_wallet",
            "success": True
        }
        
        response = await self.make_request(
            "POST", f"/payments/{self.payment_id}/process",
            headers=headers,
            json_data=payment_data
        )
        
        if response["status"] == 200:
            payment = response["data"]
            print(f"✅ Payment processed successfully")
            print(f"   Payment ID: {payment.get('id')}")
            print(f"   Status: {payment.get('status')}")
            print(f"   Transaction ID: {payment.get('transaction_id')}")
            print(f"   Completed At: {payment.get('completed_at')}")
            return True
        else:
            print(f"❌ Failed to process payment - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def test_verify_payment_completed(self):
        """Test 8: Verify Payment Completed"""
        print("\n✅ Test 8: Verify Payment Completed")
        
        if not self.payment_id:
            print("❌ No payment ID available - skipping verification")
            return False
            
        headers = {"Authorization": f"Bearer {self.patient_token}"}
        response = await self.make_request("GET", f"/payments/{self.payment_id}", headers=headers)
        
        if response["status"] == 200:
            payment = response["data"]
            status = payment.get("status")
            transaction_id = payment.get("transaction_id")
            
            if status == "completed" and transaction_id:
                print(f"✅ Payment verification successful")
                print(f"   Status: {status}")
                print(f"   Transaction ID: {transaction_id}")
                print(f"   Amount: {payment.get('amount')} VND")
                return True
            else:
                print(f"❌ Payment not properly completed")
                print(f"   Status: {status}")
                print(f"   Transaction ID: {transaction_id}")
                return False
        else:
            print(f"❌ Failed to verify payment completion - Status: {response['status']}")
            print(f"   Error: {response['data']}")
            return False
    
    async def run_all_tests(self):
        """Run all payment system tests"""
        print("🚀 Starting Payment System Backend Testing")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        await self.setup_session()
        
        test_results = []
        
        try:
            # Test 1: Patient Login
            result = await self.test_patient_login()
            test_results.append(("Patient Login", result))
            
            if not result:
                print("\n❌ Cannot proceed without valid login")
                return test_results
            
            # Get doctors for appointment creation
            doctor_result = await self.test_get_approved_doctors()
            if not doctor_result:
                print("\n⚠️ No approved doctors found - some tests may fail")
            
            # Test 2: Get existing appointments
            result = await self.test_get_existing_appointments()
            test_results.append(("Get Existing Appointments", result))
            
            # Test 3: Get payment history
            result = await self.test_get_payment_history()
            test_results.append(("Get Payment History", result))
            
            # Test 4: Create new appointment
            result = await self.test_create_appointment()
            test_results.append(("Create New Appointment", result))
            
            # Test 5: Verify payment auto-created
            result = await self.test_verify_payment_auto_created()
            test_results.append(("Verify Payment Auto-Created", result))
            
            # Test 6: Get payment details
            result = await self.test_get_payment_details()
            test_results.append(("Get Payment Details", result))
            
            # Test 7: Process payment
            result = await self.test_process_payment()
            test_results.append(("Process Payment", result))
            
            # Test 8: Verify payment completed
            result = await self.test_verify_payment_completed()
            test_results.append(("Verify Payment Completed", result))
            
        finally:
            await self.cleanup_session()
        
        return test_results
    
    def print_summary(self, test_results):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🏁 PAYMENT SYSTEM TEST SUMMARY")
        print("=" * 60)
        
        passed = 0
        failed = 0
        
        for test_name, result in test_results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")
            if result:
                passed += 1
            else:
                failed += 1
        
        print(f"\nTotal Tests: {len(test_results)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        print(f"Success Rate: {(passed/len(test_results)*100):.1f}%" if test_results else "0%")
        
        if failed == 0:
            print("\n🎉 ALL TESTS PASSED! Payment system is working correctly.")
        else:
            print(f"\n⚠️ {failed} test(s) failed. Please check the issues above.")

async def main():
    """Main test runner"""
    tester = PaymentSystemTester()
    test_results = await tester.run_all_tests()
    tester.print_summary(test_results)
    
    # Return exit code based on results
    failed_tests = sum(1 for _, result in test_results if not result)
    return failed_tests

if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\n⚠️ Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Testing failed with error: {e}")
        sys.exit(1)