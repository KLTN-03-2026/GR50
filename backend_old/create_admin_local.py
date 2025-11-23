"""
Create admin account for LOCAL WINDOWS MySQL database
Run this on your Windows machine: python create_admin_local.py
"""
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy import select
from database import AsyncSessionLocal, Base
from models import User as DBUser, AdminPermission as DBAdminPermission

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    print("=" * 60)
    print("CREATING ADMIN ACCOUNT FOR LOCAL WINDOWS MYSQL")
    print("=" * 60)
    print()
    
    try:
        async with AsyncSessionLocal() as db:
            print("✓ Connected to MySQL database")
            print()
            
            # Check if admin already exists
            result = await db.execute(
                select(DBUser).where(DBUser.email == "admin@medischedule.com")
            )
            existing_admin = result.scalar_one_or_none()
            
            if existing_admin:
                print("⚠️  Admin account already exists!")
                print()
                print("Admin Information:")
                print(f"  Email: {existing_admin.email}")
                print(f"  Username: {existing_admin.username}")
                print(f"  Full Name: {existing_admin.full_name}")
                print(f"  Role: {existing_admin.role}")
                print()
                print("If you want to reset the password, delete the user first:")
                print("  mysql -u root -p190705 -e \"USE medischedule; DELETE FROM users WHERE email='admin@medischedule.com';\"")
                return
            
            # Create admin user
            print("Creating admin user...")
            admin_user = DBUser(
                email="admin@medischedule.com",
                username="admin",
                password=pwd_context.hash("12345678"),
                full_name="System Administrator",
                role="admin"
            )
            db.add(admin_user)
            await db.flush()  # Get the ID
            print(f"  ✓ Admin user created with ID: {admin_user.id}")
            
            # Create admin permissions
            print("Creating admin permissions...")
            admin_permissions = DBAdminPermission(
                user_id=admin_user.id,
                can_manage_doctors=True,
                can_manage_patients=True,
                can_manage_appointments=True,
                can_view_stats=True,
                can_manage_specialties=True,
                can_create_admins=True
            )
            db.add(admin_permissions)
            
            await db.commit()
            print("  ✓ Admin permissions created")
            print()
            
            print("=" * 60)
            print("✅ Admin created successfully!")
            print("=" * 60)
            print()
            print("Login Information:")
            print("-" * 60)
            print("  Email: admin@medischedule.com")
            print("  Password: 12345678")
            print()
            print("⚠️  IMPORTANT: Please change the password after first login!")
            print()
            print("You can now:")
            print("  1. Start the backend: python server.py")
            print("  2. Login at: http://localhost:3000/login")
            print("=" * 60)
            
    except Exception as e:
        print()
        print("=" * 60)
        print("❌ ERROR OCCURRED:")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print()
        print("TROUBLESHOOTING:")
        print("1. Make sure MySQL is running:")
        print("   Get-Service MySQL*")
        print()
        print("2. Make sure database 'medischedule' exists:")
        print("   mysql -u root -p190705 -e \"SHOW DATABASES;\"")
        print()
        print("3. Create database if needed:")
        print("   mysql -u root -p190705 < create_database_integer_id.sql")
        print()
        print("4. Check .env file has correct DATABASE_URL:")
        print("   DATABASE_URL=mysql+aiomysql://root:190705@localhost:3306/medischedule")
        print("=" * 60)
        raise

if __name__ == "__main__":
    asyncio.run(create_admin())
