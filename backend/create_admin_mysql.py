"""
Create root admin account for MySQL database
"""
import asyncio
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import select
from database import AsyncSessionLocal, User as DBUser, AdminPermission as DBAdminPermission

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    async with AsyncSessionLocal() as db:
        # Check if admin exists
        result = await db.execute(select(DBUser).where(DBUser.email == "admin@medischedule.com"))
        admin = result.scalar_one_or_none()
        
        if admin:
            print("Admin already exists")
            return
        
        # Create admin user
        admin_id = str(uuid.uuid4())
        hashed_password = pwd_context.hash("12345678")
        
        admin_user = DBUser(
            id=admin_id,
            email="admin@medischedule.com",
            username="admin",
            password=hashed_password,
            full_name="System Administrator",
            phone="0123456789",
            role="admin"
        )
        db.add(admin_user)
        
        # Create admin permissions (root admin with all permissions)
        admin_permissions = DBAdminPermission(
            user_id=admin_id,
            can_manage_doctors=True,
            can_manage_patients=True,
            can_manage_appointments=True,
            can_view_stats=True,
            can_manage_specialties=True,
            can_create_admins=True  # Root admin can create other admins
        )
        db.add(admin_permissions)
        
        await db.commit()
        
        print("✓ Admin created successfully!")
        print("Email: admin@medischedule.com")
        print("Password: 12345678")
        print("\n⚠️  IMPORTANT: Please change the password after first login!")

if __name__ == "__main__":
    asyncio.run(create_admin())
