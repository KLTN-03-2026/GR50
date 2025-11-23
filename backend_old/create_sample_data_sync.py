import pymysql
import os
from passlib.context import CryptContext
from datetime import datetime

# Configuration
DB_HOST = "127.0.0.1"
DB_USER = "root"
DB_PASS = "190705"
DB_NAME = "medischedule"

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_connection():
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def create_sample_data():
    print("Creating sample data (SYNC)...")
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Clear existing data
            print("Clearing existing data...")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
            cursor.execute("TRUNCATE TABLE admin_permissions")
            cursor.execute("TRUNCATE TABLE doctors")
            cursor.execute("TRUNCATE TABLE patients")
            cursor.execute("TRUNCATE TABLE users")
            cursor.execute("TRUNCATE TABLE specialties")
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
            print("✓ Data cleared")

            # === SPECIALTIES ===
            specialties = [
                {"name": "Tim mạch", "description": "Chuyên khoa tim mạch"},
                {"name": "Nội khoa", "description": "Chuyên khoa nội tổng quát"},
                {"name": "Ngoại khoa", "description": "Chuyên khoa ngoại tổng quát"},
                {"name": "Nhi khoa", "description": "Chuyên khoa nhi"},
                {"name": "Sản phụ khoa", "description": "Chuyên khoa sản phụ khoa"},
                {"name": "Răng hàm mặt", "description": "Chuyên khoa răng hàm mặt"},
                {"name": "Da liễu", "description": "Chuyên khoa da liễu"},
                {"name": "Mắt", "description": "Chuyên khoa mắt"},
            ]
            
            for spec in specialties:
                cursor.execute("SELECT id FROM specialties WHERE name = %s", (spec["name"],))
                if not cursor.fetchone():
                    cursor.execute(
                        "INSERT INTO specialties (name, description) VALUES (%s, %s)",
                        (spec["name"], spec["description"])
                    )
                    print(f"✓ Created specialty: {spec['name']}")

            # === ADMIN ===
            cursor.execute("SELECT id FROM users WHERE email = %s", ("admin@medischedule.com",))
            admin = cursor.fetchone()
            if not admin:
                hashed = pwd_context.hash("12345678")
                cursor.execute(
                    """INSERT INTO users (email, username, password, full_name, role, created_at, updated_at) 
                       VALUES (%s, %s, %s, %s, %s, NOW(), NOW())""",
                    ("admin@medischedule.com", "admin", hashed, "System Administrator", "admin")
                )
                admin_id = cursor.lastrowid
                
                cursor.execute(
                    """INSERT INTO admin_permissions 
                       (user_id, can_manage_doctors, can_manage_patients, can_manage_appointments, 
                        can_view_stats, can_manage_specialties, can_create_admins)
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (admin_id, 1, 1, 1, 1, 1, 1)
                )
                print("✓ Created admin account")

            # === DEPARTMENT HEAD ===
            cursor.execute("SELECT id FROM users WHERE email = %s", ("departmenthead@test.com",))
            if not cursor.fetchone():
                hashed = pwd_context.hash("12345678")
                cursor.execute(
                    """INSERT INTO users (email, username, password, full_name, role, created_at, updated_at) 
                       VALUES (%s, %s, %s, %s, %s, NOW(), NOW())""",
                    ("departmenthead@test.com", "deptheaduser", hashed, "Department Head", "department_head")
                )
                print("✓ Created department head account")

            # === DOCTORS ===
            doctors_data = [
                {"email": "doctor1@test.com", "username": "doctor1", "full_name": "Dr. Nguyễn Văn A", "specialty_idx": 1, "exp": 10, "fee": 200000},
                {"email": "doctor2@test.com", "username": "doctor2", "full_name": "Dr. Trần Thị B", "specialty_idx": 2, "exp": 8, "fee": 180000},
                {"email": "doctor3@test.com", "username": "doctor3", "full_name": "Dr. Lê Văn C", "specialty_idx": 3, "exp": 12, "fee": 250000},
            ]

            for doc in doctors_data:
                cursor.execute("SELECT id FROM users WHERE email = %s", (doc["email"],))
                if not cursor.fetchone():
                    hashed = pwd_context.hash("12345678")
                    cursor.execute(
                        """INSERT INTO users (email, username, password, full_name, role, created_at, updated_at) 
                           VALUES (%s, %s, %s, %s, %s, NOW(), NOW())""",
                        (doc["email"], doc["username"], hashed, doc["full_name"], "doctor")
                    )
                    user_id = cursor.lastrowid
                    
                    cursor.execute(
                        """INSERT INTO doctors (user_id, specialty_id, experience_years, consultation_fee, bio, status, created_at, updated_at)
                           VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                        (user_id, doc["specialty_idx"], doc["exp"], doc["fee"], 
                         f"Bác sĩ {doc['full_name']} với {doc['exp']} năm kinh nghiệm", "approved")
                    )
                    print(f"✓ Created doctor: {doc['full_name']}")

            # === PATIENTS ===
            patients_data = [
                {"email": "patient1@test.com", "username": "patient1", "full_name": "Nguyễn Văn X"},
                {"email": "patient2@test.com", "username": "patient2", "full_name": "Trần Thị Y"},
                {"email": "patient3@test.com", "username": "patient3", "full_name": "Lê Văn Z"},
            ]

            for pat in patients_data:
                cursor.execute("SELECT id FROM users WHERE email = %s", (pat["email"],))
                if not cursor.fetchone():
                    hashed = pwd_context.hash("12345678")
                    cursor.execute(
                        """INSERT INTO users (email, username, password, full_name, role, created_at, updated_at) 
                           VALUES (%s, %s, %s, %s, %s, NOW(), NOW())""",
                        (pat["email"], pat["username"], hashed, pat["full_name"], "patient")
                    )
                    user_id = cursor.lastrowid
                    
                    cursor.execute("INSERT INTO patients (user_id) VALUES (%s)", (user_id,))
                    print(f"✓ Created patient: {pat['full_name']}")

        print("\n✅ Sample data created successfully!")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_sample_data()
