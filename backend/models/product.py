from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Boolean, CheckConstraint,
    Index, func
)
from sqlalchemy.dialects.postgresql import JSONB  # PG kullanıyorsan JSONB tercih et
from core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)                       # product ID
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False, index=True)  # eğitim yeri

    slug = Column(String(255), unique=True, nullable=False)                  # URL-dostu kısa ad
    title = Column(String(255), nullable=False)                              # Ürün başlığı
    description = Column(Text, nullable=True)                                # Açıklama
    category = Column(String(50), nullable=False)                            # egitim / abonelik / vs.
    cover_image_url = Column(Text, nullable=True)                            # Kapak görseli URL

    price = Column(Integer, nullable=False)                                   # minor unit (kuruş)
    currency = Column(String(3), nullable=False, default="TRY")               # ISO-4217

    valid_from = Column(DateTime(timezone=True), nullable=True)
    valid_until = Column(DateTime(timezone=True), nullable=True)
    total_credits = Column(Integer, nullable=True)                            # NULL = sınırsız

    rules = Column(JSONB, nullable=True)

    status = Column(String(20), nullable=False, default="draft")              # draft/published/archived
    is_featured = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        CheckConstraint("char_length(currency) = 3", name="products_currency_len_3"),
        Index("ix_products_org_venue_status", "organization_id", "venue_id", "status"),
    )
