import pymysql
import sys

def test_connection():
    print("Testing connection and checking users...")
    try:
        conn = pymysql.connect(
            host='127.0.0.1',
            user='root',
            password='190705',
            database='medischedule',
            port=3306
        )
        print("✅ Connection successful!")
        with conn.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM users")
            count = cursor.fetchone()[0]
            print(f"Users count: {count}")
            
            if count > 0:
                cursor.execute("SELECT email, role FROM users LIMIT 5")
                users = cursor.fetchall()
                print("Sample users:")
                for u in users:
                    print(f" - {u[0]} ({u[1]})")
        conn.close()
    except Exception as e:
        print(f"❌ Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
