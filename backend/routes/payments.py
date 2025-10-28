from fastapi import APIRouter

router = APIRouter()

@router.get("/my")
async def get_my_payments():
    return {"message": "Payment feature coming soon"}
