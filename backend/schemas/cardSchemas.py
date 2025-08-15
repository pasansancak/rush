from pydantic import BaseModel
from typing import Optional, List, Literal

class VenueMini(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None

class OccurrenceMini(BaseModel):
    start_at: Optional[str] = None
    end_at: Optional[str] = None
    timezone: Optional[str] = None

class EventCardDTO(BaseModel):
    type: Literal["event"] = "event"
    id: int
    slug: str
    title: str
    cover_image_url: Optional[str]
    category: str
    venue: VenueMini
    start_at: str
    end_at: str
    timezone: str
    min_price: int
    currency: str
    is_free: bool

class ProductCardDTO(BaseModel):
    type: Literal["product"] = "product"
    id: int
    slug: str
    title: str
    cover_image_url: Optional[str]
    category: str
    venue: VenueMini
    next_occurrence: Optional[OccurrenceMini] = None
    min_price: int
    currency: str
    is_free: bool

class FeedSection(BaseModel):
    key: str
    layout: str
    title: Optional[str] = None
    items: List[EventCardDTO | ProductCardDTO]

class HomeResponse(BaseModel):
    sections: List[FeedSection]
