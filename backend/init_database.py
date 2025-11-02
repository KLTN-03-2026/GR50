import asyncio
from database import engine, Base
from models import User, Patient, Doctor, Specialty, Appointment, Payment, ChatMessage, AdminPermission, AIChatHistory

async def init_db():
    print("Creating all tables...")
    async with engine.begin() as conn:
        # Drop all tables first
        await conn.run_sync(Base.metadata.drop_all)
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
