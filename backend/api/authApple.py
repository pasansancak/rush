from pydantic import BaseModel
from jose import jwt as pyjwt, JWTError
import requests
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.user import User
from core.database import get_db

router = APIRouter()

class AppleLoginRequest(BaseModel):
    id_token: str
    client_type: str

def get_apple_public_keys():
    # Apple public keys endpoint
    resp = requests.get("https://appleid.apple.com/auth/keys")
    return resp.json()["keys"]

def verify_apple_token(id_token):
    # Apple public key'lerini al
    keys = get_apple_public_keys()

    # Header'dan kid ve alg al
    unverified_header = pyjwt.get_unverified_header(id_token)
    key = None
    for k in keys:
        if k["kid"] == unverified_header["kid"]:
            key = k
            break
    if key is None:
        raise HTTPException(status_code=401, detail="Apple anahtar bulunamadı")

    # Public key ile doğrula
    try:
        public_key = pyjwt.construct_rsa_public_key(key)
        decoded = pyjwt.decode(
            id_token,
            public_key,
            algorithms=[unverified_header["alg"]],
            audience=os.getenv("EXPO_PUBLIC_APPLE_SERVICE_ID"),  # Service ID veya Bundle ID
            options={"verify_exp": True},
        )
        return decoded
    except Exception as e:
        print("Apple token doğrulama hatası:", e)
        raise HTTPException(status_code=401, detail="Apple token doğrulanamadı")

@router.post("/auth/apple-login")
def apple_login(data: AppleLoginRequest, db: Session = Depends(get_db)):
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    JWT_ALGORITHM = "HS256"

    # Apple token'ı doğrula
    try:
        idinfo = verify_apple_token(data.id_token)
    except Exception as e:
        print("Apple token doğrulama hatası:", e)
        raise HTTPException(status_code=401, detail="Apple token doğrulanamadı")

    # Apple sub unique id (email çoğu zaman gelmez! İlk kayıtta geliyor olabilir)
    apple_sub = idinfo["sub"]
    email = idinfo.get("email")  # Sadece ilk girişte gelir
    name = "Apple User"

    # Kullanıcı DB'de var mı? (email yoksa apple_sub üzerinden kontrol)
    user = db.query(User).filter((User.email == email) | (User.apple_sub == apple_sub)).first()

    if not user:
        # Apple kullanıcı adı ve email'i sadece ilk seferde alabiliyorsun
        user = User(
            name=name,
            email=email if email else f"{apple_sub}@appleid.apple.com",
            phone="0000000000",
            birthday=datetime(1970, 1, 1).date(),
            created_at=datetime.utcnow(),
            is_active=True,
            is_verified=True,
            last_login_at=datetime.utcnow(),
            apple_sub=apple_sub  # Modelde bir apple_sub alanı varsa!
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login_at = datetime.utcnow()
        db.commit()

    # JWT oluştur
    expire = datetime.utcnow() + timedelta(days=90)
    token_data = {
        "sub": user.email,
        "exp": int(expire.timestamp())
    }
    access_token = pyjwt.encode(token_data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    # Response
    return {
        "access_token": access_token,
        "user": {
            "email": user.email,
            "name": user.name,
            "profile_image": user.profile_image if hasattr(user, "profile_image") else None,
            "gender": user.gender if hasattr(user, "gender") else None,
            "phone": user.phone,
            "birthday": user.birthday.isoformat() if user.birthday else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        }
    }
