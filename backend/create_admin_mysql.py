"""
Create root admin account for MySQL database
"""
import asyncio
import os
import uuid
import hashlib
from pathlib import Path
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import select
from database import AsyncSessionLocal
from models import User as DBUser, AdminPermission as DBAdminPermission

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Passlib CryptContext - sử dụng bcrypt (bạn có thể thêm schemes khác nếu muốn)
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__truncate_error=True  # giữ để passlib ghi log nếu có vấn đề truncate
)

def prepare_password_for_bcrypt(password: str) -> str:
    if len(password.encode('utf-8')) > 72:
        return hashlib.sha256(password.encode('utf-8')).hexdigest()
    return password

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

        raw_password = "12345678"  # thay đổi nếu cần
        prepared = prepare_password_for_bcrypt(raw_password)
        hashed_password = pwd_context.hash(prepare_password_for_bcrypt("12345678"))
        
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
        print(f"Password: {raw_password}")
        print("\n⚠️  IMPORTANT: Please change the password after first login!")

if __name__ == "__main__":
    try:
        asyncio.run(create_admin())
    except RuntimeError as e:
        if "Event loop is closed" in str(e):
            import asyncio
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(create_admin())
            loop.close()
        else:
            raise
