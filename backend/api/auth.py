from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.core.database import get_db
import os
from dotenv import load_dotenv

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email: str = payload.get("sub")
        if user_email is None:
            raise HTTPException(status_code=401, detail="Token geçersiz (sub yok)")

        user = db.query(User).filter(User.email == user_email).first()
        if user is None:
            raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

        print(f"Kullanıcı bulundu: {user}")
        return user

    except JWTError as e:
        print("JWT decode hatası:", str(e))
        raise HTTPException(status_code=403, detail="Token doğrulanamadı")
