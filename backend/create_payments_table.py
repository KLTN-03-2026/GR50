"""
Add payments table to database
"""
import asyncio
from database import engine, Base, Payment

async def create_payments_table():
    """Create payments table"""
    async with engine.begin() as conn:
        # Create payments table
        await conn.run_sync(Base.metadata.create_all, tables=[Payment.__table__])
        print("✅ Payments table created successfully!")

if __name__ == "__main__":
    asyncio.run(create_payments_table())
