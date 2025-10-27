import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

# MySQL connection settings
MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
MYSQL_PORT = int(os.getenv('MYSQL_PORT', 3306))
MYSQL_USER = os.getenv('MYSQL_USER', 'root')
MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '190705')
MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'medischedule')

def create_database():
    """Create MySQL database and tables"""
    conn = None
    cursor = None
    try:
        # Connect to MySQL server (without database)
        conn = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        cursor = conn.cursor()
        
        # Create database if not exists
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DATABASE} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✓ Database '{MYSQL_DATABASE}' created successfully!")
        
        # Connect to the database
        conn.database = MYSQL_DATABASE
        
        # Drop existing tables (in correct order due to foreign keys)
        print("\nDropping existing tables...")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        cursor.execute("DROP TABLE IF EXISTS ai_chat_history")
        cursor.execute("DROP TABLE IF EXISTS chat_messages")
        cursor.execute("DROP TABLE IF EXISTS appointments")
        cursor.execute("DROP TABLE IF EXISTS doctors")
        cursor.execute("DROP TABLE IF EXISTS patients")
        cursor.execute("DROP TABLE IF EXISTS users")
        cursor.execute("DROP TABLE IF EXISTS specialties")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        print("✓ Existing tables dropped")
        
        # Create specialties table
        cursor.execute("""
        CREATE TABLE specialties (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'specialties' created")
        
        # Create users table
        cursor.execute("""
        CREATE TABLE users (
            id VARCHAR(36) PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            phone VARCHAR(20),
            date_of_birth DATE,
            address TEXT,
            role ENUM('patient', 'doctor', 'department_head', 'admin') NOT NULL DEFAULT 'patient',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_username (username),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'users' created")
        
        # Create patients table
        cursor.execute("""
        CREATE TABLE patients (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL UNIQUE,
            medical_history TEXT,
            allergies TEXT,
            blood_type VARCHAR(10),
            emergency_contact VARCHAR(100),
            emergency_phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'patients' created")
        
        # Create doctors table
        cursor.execute("""
        CREATE TABLE doctors (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL UNIQUE,
            specialty_id VARCHAR(36),
            experience_years INT DEFAULT 0,
            consultation_fee DECIMAL(10, 2) DEFAULT 0.00,
            bio TEXT,
            status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            approved_by VARCHAR(36),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL,
            INDEX idx_user_id (user_id),
            INDEX idx_specialty_id (specialty_id),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'doctors' created")
        
        # Create appointments table
        cursor.execute("""
        CREATE TABLE appointments (
            id VARCHAR(36) PRIMARY KEY,
            patient_id VARCHAR(36) NOT NULL,
            doctor_id VARCHAR(36) NOT NULL,
            appointment_date DATE NOT NULL,
            appointment_time TIME NOT NULL,
            status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
            symptoms TEXT,
            diagnosis TEXT,
            prescription TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_patient_id (patient_id),
            INDEX idx_doctor_id (doctor_id),
            INDEX idx_appointment_date (appointment_date),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'appointments' created")
        
        # Create chat_messages table
        cursor.execute("""
        CREATE TABLE chat_messages (
            id VARCHAR(36) PRIMARY KEY,
            appointment_id VARCHAR(36) NOT NULL,
            sender_id VARCHAR(36) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_appointment_id (appointment_id),
            INDEX idx_sender_id (sender_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'chat_messages' created")
        
        # Create ai_chat_history table
        cursor.execute("""
        CREATE TABLE ai_chat_history (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            session_id VARCHAR(36) NOT NULL,
            role ENUM('user', 'assistant') NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id),
            INDEX idx_session_id (session_id),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'ai_chat_history' created")
        
        # Create admin_permissions table
        cursor.execute("""
        CREATE TABLE admin_permissions (
            user_id VARCHAR(36) PRIMARY KEY,
            can_manage_doctors BOOLEAN DEFAULT TRUE,
            can_manage_patients BOOLEAN DEFAULT TRUE,
            can_manage_appointments BOOLEAN DEFAULT TRUE,
            can_view_stats BOOLEAN DEFAULT TRUE,
            can_manage_specialties BOOLEAN DEFAULT TRUE,
            can_create_admins BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        print("✓ Table 'admin_permissions' created")
        
        conn.commit()
        print("\n✅ All tables created successfully!")
        
    except mysql.connector.Error as e:
        print(f"❌ Error: {e}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Creating MySQL database and tables...")
    print(f"Host: {MYSQL_HOST}:{MYSQL_PORT}")
    print(f"Database: {MYSQL_DATABASE}\n")
    create_database()
