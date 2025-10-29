# backend/routes/__init__.py
from fastapi import APIRouter
from . import auth  # đảm bảo có file auth.py cùng thư mục

router = APIRouter()
router.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
