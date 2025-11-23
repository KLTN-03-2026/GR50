"""
Script to create all database tables using SQLAlchemy models
"""
import asyncio
from database import Base, engine
from models import User, Patient, Doctor, Specialty, Appointment, Payment, Conversation, ChatMessage, AdminPermission, AIChatHistory

async def create_tables():
    print("Creating all database tables...")
    try:
        async with engine.begin() as conn:
            # Drop all tables (optional - for fresh start)
            # await conn.run_sync(Base.metadata.drop_all)
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
        
        print("✅ All tables created successfully!")
        print("Tables created:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        raise
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())
