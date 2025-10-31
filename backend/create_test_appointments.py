import asyncio
import uuid
from datetime import datetime, date, time, timedelta
from database import AsyncSessionLocal
from models import Appointment as DBAppointment, Payment as DBPayment
from sqlalchemy import select
from models import User as DBUser

async def create_test_data():
    async with AsyncSessionLocal() as db:
        # Get patient1 and doctor1
        patient = await db.execute(select(DBUser).where(DBUser.email == "patient1@test.com"))
        patient = patient.scalar_one_or_none()
        
        doctor = await db.execute(select(DBUser).where(DBUser.email == "doctor1@test.com"))
        doctor = doctor.scalar_one_or_none()
        
        if not patient or not doctor:
            print("❌ Patient or doctor not found")
            return
        
        # Create appointment
        appt_id = str(uuid.uuid4())
        appointment = DBAppointment(
            id=appt_id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            appointment_date=date.today() + timedelta(days=1),
            appointment_time=time(10, 0),
            status="confirmed",
            symptoms="Đau đầu",
            appointment_type="online"
        )
        db.add(appointment)
        await db.flush()
        
        # Create payment
        payment = DBPayment(
            appointment_id=appt_id,
            patient_id=patient.id,
            doctor_id=doctor.id,
            amount=200000,
            payment_method="mock_card",
            status="completed",
            transaction_id=f"TXN{str(uuid.uuid4())[:8]}"
        )
        db.add(payment)
        
        await db.commit()
        print(f"✅ Created test appointment: {appt_id}")
        print(f"   Patient: {patient.email}")
        print(f"   Doctor: {doctor.email}")
        print(f"   Date: {date.today() + timedelta(days=1)}")

if __name__ == "__main__":
    asyncio.run(create_test_data())
