#!/usr/bin/env python3
"""
Migration script to add conversations table and update chat_messages
"""
import asyncio
import os
from sqlalchemy import text
from database import engine, AsyncSessionLocal

async def run_migration():
    """Run the conversations migration"""
    
    # Read migration SQL
    migration_file = '/app/backend/migrations/add_conversations_table.sql'
    with open(migration_file, 'r') as f:
        sql_content = f.read()
    
    # Split by semicolons and filter out comments
    statements = []
    for statement in sql_content.split(';'):
        # Remove comments and strip whitespace
        lines = []
        for line in statement.split('\n'):
            line = line.strip()
            if line and not line.startswith('--'):
                lines.append(line)
        
        cleaned = ' '.join(lines).strip()
        if cleaned:
            statements.append(cleaned)
    
    print(f"Found {len(statements)} SQL statements to execute")
    
    # Execute each statement
    async with AsyncSessionLocal() as session:
        for i, statement in enumerate(statements, 1):
            try:
                print(f"\n[{i}/{len(statements)}] Executing:")
                print(f"  {statement[:100]}..." if len(statement) > 100 else f"  {statement}")
                
                await session.execute(text(statement))
                await session.commit()
                print(f"  ✅ Success")
                
            except Exception as e:
                error_msg = str(e)
                # Ignore "already exists" errors
                if "already exists" in error_msg.lower() or "duplicate" in error_msg.lower():
                    print(f"  ⚠️  Already exists (skipping): {error_msg}")
                    await session.rollback()
                else:
                    print(f"  ❌ Error: {error_msg}")
                    await session.rollback()
                    # Continue with next statement
    
    print("\n✅ Migration completed!")
    print("\nVerifying tables...")
    
    # Verify the migration
    async with AsyncSessionLocal() as session:
        # Check conversations table
        result = await session.execute(text("SHOW TABLES LIKE 'conversations'"))
        if result.fetchone():
            print("✅ conversations table exists")
            
            # Count conversations
            result = await session.execute(text("SELECT COUNT(*) FROM conversations"))
            count = result.scalar()
            print(f"   → {count} conversations found")
        else:
            print("❌ conversations table not found")
        
        # Check chat_messages has conversation_id
        result = await session.execute(text("DESCRIBE chat_messages"))
        columns = [row[0] for row in result.fetchall()]
        if 'conversation_id' in columns:
            print("✅ chat_messages.conversation_id column exists")
        else:
            print("❌ chat_messages.conversation_id column not found")

if __name__ == "__main__":
    print("🚀 Starting conversations migration...\n")
    asyncio.run(run_migration())
