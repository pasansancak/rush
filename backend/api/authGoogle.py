from pydantic import BaseModel
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as grequests
from jose import jwt
import os
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.user import User
from core.database import get_db

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    id_token: str
    client_type: str

# Android eklenecek
@router.post("/auth/google-login")
def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    GOOGLE_CLIENT_ID_IOS = os.getenv("EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS")
    GOOGLE_CLIENT_ID_WEB = os.getenv("EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = "HS256"

    # Google client id seç
    if data.client_type == "ios":
        google_client_id = GOOGLE_CLIENT_ID_IOS
    elif data.client_type == "web":
        google_client_id = GOOGLE_CLIENT_ID_WEB
    else:
        raise HTTPException(status_code=400, detail="Geçersiz client_type")

    # Google token'ı doğrula
    try:
        idinfo = google_id_token.verify_oauth2_token(
            data.id_token, grequests.Request(), google_client_id
        )
    except Exception as e:
        print("Google token doğrulama hatası:", e)
        raise HTTPException(status_code=401, detail="Google token doğrulanamadı")

    # Kullanıcı DB'de var mı bak
    user = db.query(User).filter(User.email == idinfo["email"]).first()
    if not user:
        # Google profilinden mevcutsa çek, yoksa dummy değer ata:
        name = idinfo.get("name") or "Google User"
        email = idinfo["email"]
        profile_image = idinfo.get("picture")
        gender = idinfo.get("gender")  # (çoğu zaman gelmez)
        # phone, birthday Google id_token ile gelmez, sonradan güncellenecek dummy ekle
        phone = "0000000000"
        birthday = datetime(1970, 1, 1).date()
        created_at = datetime.utcnow()

        user = User(
            name=name,
            email=email,
            phone=phone,
            birthday=birthday,
            created_at=created_at,
            profile_image=profile_image,
            gender=gender,
            is_active=True,
            is_verified=True,
            last_login_at=datetime.utcnow(),
            provider="google",  # <-- BUNU EKLE
            google_sub=idinfo.get("sub"),  # Google unique sub
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Kullanıcı varsa last_login_at güncellenir
        user.last_login_at = datetime.utcnow()
        db.commit()

    # Kendi JWT token'ını üret
    expire = datetime.utcnow() + timedelta(days=90)
    token_data = {
        "sub": user.email,
        "exp": int(expire.timestamp())
    }
    access_token = jwt.encode(token_data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    # Response
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/google-login")  # tokenUrl önemli değil, Google login için

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = "HS256"
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulama başarısız.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
