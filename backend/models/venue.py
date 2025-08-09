from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Boolean,
    CheckConstraint, Index, func
)
from core.database import Base

class Venue(Base):
    __tablename__ = "venues"

    id = Column(Integer, primary_key=True, index=True)                     # Mekan ID
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)

    name = Column(String(255), nullable=False)                             # Mekan adı
    description = Column(Text, nullable=True)                              # Mekan açıklaması
    address = Column(Text, nullable=True)                                  # Adres
    city = Column(String(100), nullable=True, index=True)                  # Şehir
    latitude = Column(Numeric(9, 6), nullable=True)                        # -90..90
    longitude = Column(Numeric(9, 6), nullable=True)                       # -180..180

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    is_active = Column(Boolean, default=True, nullable=False)              # Mekan aktif mi

    __table_args__ = (
        # Koordinat aralığı güvenliği
        CheckConstraint("(latitude IS NULL) OR (latitude >= -90 AND latitude <= 90)",  name="venues_lat_range"),
        CheckConstraint("(longitude IS NULL) OR (longitude >= -180 AND longitude <= 180)", name="venues_lng_range"),
        # Sık kullanılan sütunlara indeks (ek performans)
        Index("ix_venues_org_city", "organization_id", "city"),
    )
