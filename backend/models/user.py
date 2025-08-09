from sqlalchemy import (
    Column, Integer, String, Boolean, Date, DateTime,
    CheckConstraint, Index, func
)
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # Kimlik bilgileri
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)  # E.164 format önerilir

    password_hash = Column(String(255), nullable=True)      # only for "normal" provider
    provider = Column(String(20), nullable=False)           # 'google', 'apple', 'normal'
    google_sub = Column(String(255), unique=True, nullable=True)
    apple_sub = Column(String(255), unique=True, nullable=True)

    birthday = Column(Date, nullable=False)                 # YYYY-MM-DD (ISO-8601)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    profile_image = Column(String(1024), nullable=True)     # HTTPS URL önerilir
    gender = Column(String(20), nullable=True)              # 'male', 'female', 'other' veya boş

    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    __table_args__ = (
        CheckConstraint("char_length(email) > 5", name="users_email_min_len"),
        Index("ix_users_provider_email", "provider", "email"),
    )
