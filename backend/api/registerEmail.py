from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from jose import jwt
from datetime import datetime, timedelta
import os
from models.user import User
from core.database import get_db
from passlib.hash import bcrypt

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    gender: str = None
    birthday: str  # "YYYY-MM-DD"
    provider: str = "normal"
    profile_image: str = None

@router.post("/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = "HS256"

    # E-posta benzersiz mi?
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu e-posta ile bir kullanıcı zaten kayıtlı.")

    # Şifreyi hashle (asla düz şifre kaydetme!)
    password_hash = bcrypt.hash(data.password)

    # Tarih formatı: "YYYY-MM-DD"
    try:
        birthday = datetime.strptime(data.birthday, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="Doğum tarihi formatı hatalı.")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=password_hash,
        gender=data.gender,
        birthday=birthday,
        provider="normal",
        profile_image=data.profile_image,
        created_at=datetime.utcnow(),
        is_active=True,
        is_verified=False,
        last_login_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    expire = datetime.utcnow() + timedelta(days=90)
    token_data = {
        "sub": user.email,
        "exp": int(expire.timestamp())
    }
    access_token = jwt.encode(token_data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    return {
        "access_token": access_token,
        "user": {
            "email": user.email,
            "name": user.name,
            "profile_image": user.profile_image,
            "gender": user.gender,
            "phone": user.phone,
            "birthday": user.birthday.isoformat() if user.birthday else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    }
