#!/usr/bin/env python3
"""
Test script to verify Windows local setup
"""
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
from models import User, Patient, Doctor, Specialty, Appointment

DATABASE_URL = "mysql+aiomysql://root:190705@localhost:3306/medischedule"

async def test_connection():
    """Test database connection"""
    print("🔍 Testing database connection...")
    
    try:
        engine = create_async_engine(DATABASE_URL, echo=False)
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            result = await session.execute(select(1))
            print("✅ Database connection successful!")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    finally:
        await engine.dispose()

async def test_tables():
    """Test if all tables exist"""
    print("\n🔍 Testing tables...")
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    tables_to_check = [
        'users', 'patients', 'doctors', 'specialties',
        'appointments', 'payments', 'chat_messages',
        'ai_chat_history', 'admin_permissions'
    ]
    
    try:
        async with async_session() as session:
            for table in tables_to_check:
                result = await session.execute(
                    text(f"SELECT COUNT(*) as count FROM {table}")
                )
                count = result.scalar()
                print(f"  ✅ {table}: {count} rows")
        return True
    except Exception as e:
        print(f"  ❌ Table check failed: {e}")
        return False
    finally:
        await engine.dispose()

async def test_data():
    """Test if sample data exists"""
    print("\n🔍 Testing sample data...")
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Check users
            result = await session.execute(select(User))
            users = result.scalars().all()
            print(f"  ✅ Users: {len(users)}")
            
            # Check by role
            for role in ['admin', 'department_head', 'doctor', 'patient']:
                result = await session.execute(
                    select(User).where(User.role == role)
                )
                count = len(result.scalars().all())
                print(f"    - {role}: {count}")
            
            # Check specialties
            result = await session.execute(select(Specialty))
            specialties = result.scalars().all()
            print(f"  ✅ Specialties: {len(specialties)}")
            
            # Check doctors
            result = await session.execute(select(Doctor))
            doctors = result.scalars().all()
            print(f"  ✅ Doctors: {len(doctors)}")
            
            # Check patients
            result = await session.execute(select(Patient))
            patients = result.scalars().all()
            print(f"  ✅ Patients: {len(patients)}")
            
        return True
    except Exception as e:
        print(f"  ❌ Data check failed: {e}")
        return False
    finally:
        await engine.dispose()

async def test_ids():
    """Test if IDs are integers (auto-increment)"""
    print("\n🔍 Testing ID types (should be integers)...")
    
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    try:
        async with async_session() as session:
            # Check user IDs
            result = await session.execute(select(User).limit(3))
            users = result.scalars().all()
            
            if users:
                print("  ✅ User IDs:")
                for user in users:
                    print(f"    - ID: {user.id} (type: {type(user.id).__name__}) - {user.email}")
                    if not isinstance(user.id, int):
                        print(f"    ⚠️  WARNING: ID should be int, got {type(user.id).__name__}")
            
            # Check doctor IDs
            result = await session.execute(select(Doctor).limit(3))
            doctors = result.scalars().all()
            
            if doctors:
                print("  ✅ Doctor IDs:")
                for doctor in doctors:
                    print(f"    - ID: {doctor.id} (type: {type(doctor.id).__name__})")
                    if not isinstance(doctor.id, int):
                        print(f"    ⚠️  WARNING: ID should be int, got {type(doctor.id).__name__}")
        
        return True
    except Exception as e:
        print(f"  ❌ ID check failed: {e}")
        return False
    finally:
        await engine.dispose()

async def main():
    """Main test function"""
    print("="*60)
    print("🏥 MediSchedule Windows Local Setup Test")
    print("="*60)
    
    results = []
    
    # Test 1: Connection
    results.append(await test_connection())
    
    # Test 2: Tables
    if results[-1]:
        results.append(await test_tables())
    
    # Test 3: Data
    if results[-1]:
        results.append(await test_data())
    
    # Test 4: IDs
    if results[-1]:
        results.append(await test_ids())
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    
    if all(results):
        print("✅ All tests passed! Setup is working correctly.")
        print("\n🎉 You can now:")
        print("  1. Start backend: python server.py")
        print("  2. Start frontend: cd ../frontend && yarn start")
        print("  3. Open: http://localhost:3050")
        sys.exit(0)
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
