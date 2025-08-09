from sqlalchemy import (
    Column, Integer, DateTime, ForeignKey, UniqueConstraint, Index, func
)
from core.database import Base


class PackageRedemption(Base):
    __tablename__ = "package_redemptions"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    product_occurrence_id = Column(Integer, ForeignKey("product_occurrences.id"), nullable=True, index=True)

    redeemed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        # Aynı kullanıcı aynı seansı iki kez rezerve edemesin
        UniqueConstraint("user_id", "product_occurrence_id", name="uq_user_occurrence_once"),
        # En sık sorgular için birleşik indeks
        Index("ix_redemptions_user_product", "user_id", "product_id"),
    )
