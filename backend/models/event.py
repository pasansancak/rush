from core.database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum, CheckConstraint, func

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)

    slug = Column(String, unique=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)     # festival/yarış/turnuva
    cover_image_url = Column(Text)

    start_at = Column(DateTime(timezone=True), nullable=False)  # UTC
    end_at   = Column(DateTime(timezone=True), nullable=False)  # UTC
    timezone = Column(String, nullable=False)   # IANA: Europe/Istanbul

    price = Column(Integer, nullable=False)     # kuruş
    currency = Column(String(3), nullable=False, default="TRY")
    __table_args__ = (CheckConstraint("char_length(currency)=3", name="events_currency_len_3"),)

    inventory_total = Column(Integer, nullable=False)
    inventory_remaining = Column(Integer, nullable=False)
    is_free = Column(Boolean, default=False)

    status = Column(Enum("draft","published","archived", name="event_status_enum"), default="draft", nullable=False)
    is_featured = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
