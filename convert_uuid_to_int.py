#!/usr/bin/env python3
"""
Script to convert UUID-based IDs to Integer IDs in server.py
"""

import re

def convert_server_py():
    print("🔄 Converting server.py from UUID to Integer IDs...")
    
    with open('/app/backend/server.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Backup original
    with open('/app/backend/server_uuid_backup.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("✅ Backup created: server_uuid_backup.py")
    
    # Remove uuid import
    content = re.sub(r'import uuid\n', '', content)
    content = re.sub(r'from uuid import uuid4\n', '', content)
    
    # Replace all UUID field definitions in Pydantic models
    # Pattern: id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    content = re.sub(
        r'id:\s*str\s*=\s*Field\(default_factory=lambda:\s*str\(uuid\.uuid4\(\)\)\)',
        'id: Optional[int] = None',
        content
    )
    
    # Replace UUID generation in code
    # Pattern: user_id = str(uuid.uuid4())
    # Remove these lines as SQLAlchemy will auto-generate IDs
    lines = content.split('\n')
    new_lines = []
    skip_next = False
    
    for i, line in enumerate(lines):
        # Skip lines that generate UUID IDs
        if re.search(r'\w+_id\s*=\s*str\(uuid\.uuid4\(\)\)', line):
            print(f"  Removing line {i+1}: {line.strip()}")
            continue
        
        # Skip standalone id generation
        if re.search(r'^\s+id\s*=\s*str\(uuid\.uuid4\(\)\)', line):
            print(f"  Removing line {i+1}: {line.strip()}")
            continue
            
        new_lines.append(line)
    
    content = '\n'.join(new_lines)
    
    # Fix transaction_id generation (keep this one as it's a string transaction ID)
    # transaction_id = f"TXN{uuid.uuid4().hex[:12].upper()}"
    # Change to: transaction_id = f"TXN{int(datetime.now().timestamp() * 1000)}"
    content = re.sub(
        r'transaction_id\s*=\s*f"TXN\{uuid\.uuid4\(\)\.hex\[:12\]\.upper\(\)\}"',
        'transaction_id = f"TXN{int(datetime.now().timestamp() * 1000)}"',
        content
    )
    
    # Fix chat_utils.py filename generation
    content = re.sub(
        r'f"\{uuid\.uuid4\(\)\}\{file_ext\}"',
        'f"{int(datetime.now().timestamp() * 1000000)}{file_ext}"',
        content
    )
    
    # Change str type hints to int for IDs in function parameters and return types
    content = re.sub(r'user_id:\s*str', 'user_id: int', content)
    content = re.sub(r'patient_id:\s*str', 'patient_id: int', content)
    content = re.sub(r'doctor_id:\s*str', 'doctor_id: int', content)
    content = re.sub(r'specialty_id:\s*str', 'specialty_id: int', content)
    content = re.sub(r'appointment_id:\s*str', 'appointment_id: int', content)
    content = re.sub(r'message_id:\s*str', 'message_id: int', content)
    content = re.sub(r'admin_id:\s*str', 'admin_id: int', content)
    
    # Write converted content
    with open('/app/backend/server.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Conversion complete!")
    print("   - UUID imports removed")
    print("   - ID fields converted to Integer")
    print("   - UUID generation code removed")
    print("   - Type hints updated")

if __name__ == '__main__':
    convert_server_py()
