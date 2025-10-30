import re
import os
import shutil
from datetime import datetime

SOURCE_FILE = "server.py"

def backup_file(file_path):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"server_backup_{timestamp}.py"
    shutil.copy(file_path, backup_path)
    print(f"✅ Đã tạo bản sao lưu: {backup_path}")

def fix_imports(content):
    pattern = r"from sqlalchemy import ([^\n]+)"
    match = re.search(pattern, content)
    if match:
        existing = match.group(1)
        missing = []
        for kw in ["and_", "desc", "func", "or_"]:
            if kw not in existing:
                missing.append(kw)
        if missing:
            fixed = existing.strip() + ", " + ", ".join(missing)
            content = re.sub(pattern, f"from sqlalchemy import {fixed}", content, count=1)
            print(f"🛠️ Đã thêm các import còn thiếu: {', '.join(missing)}")
    else:
        print("ℹ️ Không tìm thấy dòng import sqlalchemy để chỉnh.")
    return content

def fix_query_usage(content):
    pattern = r"db\.query\((.*?)\)\.all\(\)"
    if re.search(pattern, content):
        content = re.sub(pattern, r"result = await db.execute(select(\1))\n    payments = result.scalars().all()", content)
        print("🛠️ Đã sửa lỗi dùng db.query() với AsyncSession")
    return content

def remove_duplicate_router(content):
    if content.count("app.include_router(api_router)") > 1:
        content = re.sub(r"(app\.include_router\(api_router\)\n)+", "app.include_router(api_router)\n", content)
        print("🛠️ Đã xóa dòng include_router trùng lặp")
    return content

def remove_duplicate_import(content):
    before = len(content)
    content = re.sub(r"(?m)^import sys, os\s*\n(?=.*import sys, os)", "", content)
    if len(content) != before:
        print("🛠️ Đã gộp import sys, os")
    return content

def remove_sync_create_all(content):
    pattern = r"Base\.metadata\.create_all\(bind=engine\)"
    if re.search(pattern, content):
        content = re.sub(pattern, "# ⚙️ Đã tắt create_all để tránh lỗi khi dùng async engine", content)
        print("🛠️ Đã xóa Base.metadata.create_all(bind=engine)")
    return content

def fix_chat_message_field(content):
    pattern = r"message=message_data\.message"
    if re.search(pattern, content):
        content = re.sub(pattern, "content=message_data.message", content)
        print("🛠️ Đã đồng bộ key ChatMessage: message → content")
    return content

def clean_duplicate_excepts(content):
    before = len(content)
    content = re.sub(
        r"except Exception as e:\n\s+logger\.warning[^\n]+\n\s+raise HTTPException[^\n]+\n\s+except Exception as e:",
        "except Exception as e:",
        content
    )
    if len(content) != before:
        print("🛠️ Đã gộp except Exception trùng lặp")
    return content

def auto_fix():
    print("🔍 Đang kiểm tra tệp server.py...")

    if not os.path.exists(SOURCE_FILE):
        print(f"❌ Không tìm thấy file {SOURCE_FILE} trong thư mục hiện tại: {os.getcwd()}")
        print("👉 Hãy chắc rằng bạn đang chạy lệnh trong đúng thư mục chứa server.py")
        return

    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        content = f.read()

    print("🚧 Bắt đầu vá lỗi...")

    backup_file(SOURCE_FILE)
    content = fix_imports(content)
    content = fix_query_usage(content)
    content = remove_duplicate_router(content)
    content = remove_duplicate_import(content)
    content = remove_sync_create_all(content)
    content = fix_chat_message_field(content)
    content = clean_duplicate_excepts(content)

    with open(SOURCE_FILE, "w", encoding="utf-8") as f:
        f.write(content)

    print("\n✅ Hoàn tất vá lỗi cho server.py")
    print("👉 Bạn có thể chạy lại server bằng:")
    print("   python -m uvicorn server:app --reload --port 8001")

if __name__ == "__main__":
    auto_fix()
