"""
Create database tables using SQLAlchemy
"""
import asyncio
from database import engine, Base
from sqlalchemy import text

async def create_tables():
    print("Creating database tables...")
    
    async with engine.begin() as conn:
        # Drop all tables first (for clean setup)
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        print("Creating new tables...")
        await conn.run_sync(Base.metadata.create_all)
        
        # Verify tables were created
        result = await conn.execute(text("SHOW TABLES"))
        tables = result.fetchall()
        
        print("\n✅ Database tables created successfully!")
        print("\nTables in database:")
        for table in tables:
            print(f"  - {table[0]}")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_tables())
