"""
Chat utilities for image upload and handling
"""
import os
import aiofiles
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile, HTTPException

UPLOAD_DIR = Path(__file__).parent / "uploads" / "chat_images"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}

async def save_chat_image(file: UploadFile) -> str:
    """
    Save uploaded chat image and return the image URL
    
    Args:
        file: UploadFile from FastAPI
        
    Returns:
        str: Relative path to the saved image
        
    Raises:
        HTTPException: If file validation fails
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024*1024):.0f}MB"
        )
    
    # Generate unique filename using timestamp
    timestamp = int(datetime.now().timestamp() * 1000000)
    unique_filename = f"{timestamp}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Ensure upload directory exists
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save file
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Return relative URL
    return f"/uploads/chat_images/{unique_filename}"


def get_image_path(image_url: str) -> Path:
    """
    Convert image URL to file system path
    
    Args:
        image_url: Relative URL like /uploads/chat_images/xxx.jpg
        
    Returns:
        Path: Full file system path
    """
    if not image_url:
        return None
    
    # Extract filename from URL
    filename = Path(image_url).name
    return UPLOAD_DIR / filename


def delete_chat_image(image_url: str) -> bool:
    """
    Delete a chat image file
    
    Args:
        image_url: Relative URL of the image
        
    Returns:
        bool: True if deleted, False otherwise
    """
    try:
        file_path = get_image_path(image_url)
        if file_path and file_path.exists():
            file_path.unlink()
            return True
    except Exception:
        pass
    return False
