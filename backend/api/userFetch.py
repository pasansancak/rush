from fastapi import APIRouter, Depends
from models.user import User
from core.auth import get_current_user

router = APIRouter(
    prefix="/api/user",
    tags=["user"]
)

@router.get("/me")
def get_my_user(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "birthday": current_user.birthday.isoformat() if current_user.birthday else None,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "profile_image": current_user.profile_image,
        "gender": current_user.gender,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
    }
