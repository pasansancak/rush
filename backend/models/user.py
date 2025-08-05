from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True) #Sonraki aşamada zorunlu kılınacak / Google ve Apple login sonrası numara alınacak
    password_hash = Column(String, nullable=True)    # traditional için
    provider = Column(String, nullable=False)         # 'google', 'apple', 'normal'
    google_sub = Column(String, unique=True, nullable=True)
    apple_sub = Column(String, unique=True, nullable=True)
    birthday = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Opsiyonel, kullanıcı tarafından editleyebileceği alanlar:
    profile_image = Column(String, nullable=True)
    gender = Column(String, nullable=True)

    # Sadece sistemin görebileceği, otomatik alanlar:
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    last_login_at = Column(DateTime, nullable=True)

