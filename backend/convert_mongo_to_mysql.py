"""
Script để convert server.py từ MongoDB sang MySQL/SQLAlchemy
"""

import re

# Read MongoDB server.py
with open('server_mongodb_backup.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replacements
replacements = [
    # Imports
    ('from motor.motor_asyncio import AsyncIOMotorClient', ''),
    ('# MongoDB connection settings', '# MySQL/SQLAlchemy imports'),
    
    # Add SQLAlchemy imports at top
    ('from contextlib import asynccontextmanager', '''from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_, or_, desc
from sqlalchemy.orm import selectinload, joinedload
from decimal import Decimal

# Import database models and session
from database import (
    engine, AsyncSessionLocal, get_db, Base,
    User as DBUser, Patient as DBPatient, Doctor as DBDoctor,
    Specialty as DBSpecialty, Appointment as DBAppointment,
    ChatMessage as DBChatMessage, AIChatHistory as DBAIChatHistory,
    AdminPermission as DBAdminPermission
)'''),
    
    # Remove MongoDB settings
    (r'MONGO_URL = .*', ''),
    (r'DB_NAME = .*', ''),
    (r'MONGO_CONNECT_TIMEOUT = .*', ''),
    (r'MONGO_SERVER_SELECTION_TIMEOUT = .*', ''),
    (r'client: Optional\[AsyncIOMotorClient\] = None', ''),
    (r'db: Any = None', ''),
]

for old, new in replacements:
    content = re.sub(old, new, content)

# Save converted file
with open('server_converted.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Conversion started. Manual fixes needed for database queries.")
print("Please check server_converted.py")
