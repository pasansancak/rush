from sqlalchemy import (
    Boolean, Column, Integer, String, Text, DateTime,
    CheckConstraint, Index, func
)
from core.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)              # Partner ID

    name = Column(String(255), nullable=False)                      # Organizasyon adı
    description = Column(Text, nullable=True)                       # Tanıtım metni
    logo_url = Column(String(1024), nullable=True)                  # Logo URL (HTTPS önerilir)

    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)                       # E.164 önerilir (+905xx...)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)

    __table_args__ = (
        CheckConstraint("char_length(email) > 5", name="org_email_min_len"),
        Index("ix_org_name_active", "name", "is_active"),
    )
