import asyncio
from database import engine, Base
from models import User, Patient, Doctor, Specialty, Appointment, Payment, ChatMessage, AdminPermission, AIChatHistory

async def recreate_tables():
    async with engine.begin() as conn:
        # Drop all tables
        await conn.run_sync(Base.metadata.drop_all)
        print("✓ Dropped all existing tables")
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
        print("✓ Created all tables from models")
    
    print("\n✅ Database recreated successfully!")

if __name__ == "__main__":
    asyncio.run(recreate_tables())
