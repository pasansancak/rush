from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timezone
from models.event import Event
from models.venue import Venue
from models.product import Product
from models.product_occurence import ProductOccurrence
from core.cdn import public_url

def now_utc(): return datetime.now(timezone.utc)

def fetch_events_for_home(db: Session, limit: int = 10) -> list[dict]:
    rows = (
        db.query(
            Event.id, Event.slug, Event.title, Event.cover_image_url, Event.category,
            Venue.name.label("venue_name"), Venue.city.label("venue_city"),
            Event.start_at, Event.end_at, Event.timezone,
            Event.price.label("min_price"), Event.currency
        )
        .join(Venue, Venue.id == Event.venue_id)
        .filter(Event.status == "published", Event.end_at >= now_utc(), Event.is_active.is_(True))
        .order_by(Event.start_at.asc()).limit(limit)
    ).all()

    return [{
        "type": "event",
        "id": r.id, "slug": r.slug, "title": r.title,
        "cover_image_url": public_url(r.cover_image_url),  # ✅ key → URL
        "category": r.category,
        "venue": {"name": r.venue_name, "city": r.venue_city},
        "start_at": r.start_at.isoformat(), "end_at": r.end_at.isoformat(), "timezone": r.timezone,
        "min_price": r.min_price, "currency": r.currency, "is_free": r.min_price == 0
    } for r in rows]

def fetch_products_for_home(db: Session, limit: int = 10) -> list[dict]:
    sub_next = (
        db.query(
            ProductOccurrence.product_id.label("pid"),
            func.min(ProductOccurrence.start_at).label("next_start"),
        )
        .filter(ProductOccurrence.start_at >= now_utc(), ProductOccurrence.inventory_remaining > 0)
        .group_by(ProductOccurrence.product_id).subquery()
    )

    po_alias = db.query(
        ProductOccurrence.product_id, ProductOccurrence.start_at,
        ProductOccurrence.end_at, ProductOccurrence.timezone
    ).subquery()

    rows = (
        db.query(
            Product.id, Product.slug, Product.title, Product.cover_image_url, Product.category,
            Product.price.label("min_price"), Product.currency,
            Venue.name.label("venue_name"), Venue.city.label("venue_city"),
            sub_next.c.next_start, po_alias.c.end_at.label("next_end"), po_alias.c.timezone.label("next_tz"),
        )
        .outerjoin(sub_next, sub_next.c.pid == Product.id)
        .outerjoin(po_alias, and_(po_alias.c.product_id == Product.id, po_alias.c.start_at == sub_next.c.next_start))
        .outerjoin(Venue, Venue.id == Product.venue_id)
        .filter(Product.status == "published", Product.is_active.is_(True))
        .order_by(func.coalesce(sub_next.c.next_start, func.now()).asc()).limit(limit)
    ).all()

    items = []
    for r in rows:
        next_occ = None
        if r.next_start:
            next_occ = {
                "start_at": r.next_start.isoformat(),
                "end_at": r.next_end.isoformat() if r.next_end else None,
                "timezone": r.next_tz or "Europe/Istanbul"
            }
        items.append({
            "type": "product",
            "id": r.id, "slug": r.slug, "title": r.title,
            "cover_image_url": public_url(r.cover_image_url),  # key → URL
            "category": r.category,
            "venue": {"name": r.venue_name, "city": r.venue_city},
            "next_occurrence": next_occ,
            "min_price": r.min_price, "currency": r.currency, "is_free": r.min_price == 0
        })
    return items
