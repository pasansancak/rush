from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models.user import User
from core.database import get_db
from datetime import datetime, timedelta, timezone
from jose import jwt
import os

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 15

def _now_utc() -> datetime:
    return datetime.now(timezone.utc)

def _to_unix(dt: datetime) -> int:
    return int(dt.timestamp())

def create_access_token(user, expires_delta: timedelta = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    issued_at = _now_utc()
    not_before = issued_at - timedelta(seconds=5) 
    expire_at  = issued_at + expires_delta

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "iat": _to_unix(issued_at),
        "nbf": _to_unix(not_before),
        "exp": _to_unix(expire_at),
    }

    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


@router.post("/auth/login")
def login_with_email(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email ve şifre gereklidir.")

    user = db.query(User).filter(User.email == email).first()
    if not user or not pwd_context.verify(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Kullanıcı veya şifre yanlış.")

    # Eğer email doğrulama gerekiyorsa:
    # if not user.is_verified:
    #     raise HTTPException(status_code=403, detail="Email adresinizi doğrulayın.")

    jwt_token = create_access_token(user)
    return {"jwt": jwt_token}

