from sqlalchemy import (
    Column, DateTime, ForeignKey, Integer, String, func,
    CheckConstraint, Index
)
from core.database import Base

class ProductOccurrence(Base):
    __tablename__ = "product_occurrences"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)

    start_at = Column(DateTime(timezone=True), nullable=False)
    end_at   = Column(DateTime(timezone=True), nullable=False)

    timezone = Column(String(50), nullable=False)

    inventory_total = Column(Integer, nullable=False)
    inventory_remaining = Column(Integer, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        # Envanter negatif olamaz
        CheckConstraint("inventory_total >= 0", name="occ_inventory_total_nonneg"),
        CheckConstraint("inventory_remaining >= 0", name="occ_inventory_remaining_nonneg"),
        # Tarih tutarlılığı: başlangıç bitişten önce olmalı
        CheckConstraint("start_at < end_at", name="occ_start_before_end"),
        # Sık sorgular için indeks
        Index("ix_occurrence_product_start", "product_id", "start_at"),
    )
