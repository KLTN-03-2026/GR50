import mysql.connector
from dotenv import load_dotenv
import os

load_dotenv()

def test_connection():
    """Test MySQL connection"""
    try:
        print("Testing MySQL connection...")
        print(f"Host: {os.getenv('MYSQL_HOST', 'localhost')}")
        print(f"Port: {os.getenv('MYSQL_PORT', '3306')}")
        print(f"User: {os.getenv('MYSQL_USER', 'root')}")
        print(f"Database: {os.getenv('MYSQL_DATABASE', 'medischedule')}\n")
        
        conn = mysql.connector.connect(
            host=os.getenv('MYSQL_HOST', 'localhost'),
            port=int(os.getenv('MYSQL_PORT', 3306)),
            user=os.getenv('MYSQL_USER', 'root'),
            password=os.getenv('MYSQL_PASSWORD', ''),
            database=os.getenv('MYSQL_DATABASE', 'medischedule')
        )
        
        cursor = conn.cursor()
        
        # Test query
        cursor.execute("SELECT VERSION()")
        version = cursor.fetchone()
        print(f"✅ Connected to MySQL successfully!")
        print(f"MySQL version: {version[0]}\n")
        
        # Show tables
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        print(f"Tables in database:")
        for table in tables:
            print(f"  - {table[0]}")
        
        cursor.close()
        conn.close()
        
        print("\n✅ MySQL connection test passed!")
        return True
        
    except mysql.connector.Error as e:
        print(f"❌ MySQL connection failed!")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    test_connection()
