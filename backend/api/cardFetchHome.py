# cardFetchHome.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.product import Product
from models.organization import Organization
from models.venue import Venue
from datetime import datetime
from core.cdn import public_url

router = APIRouter(prefix="/v1", tags=["Home"])

@router.get("/home")
def get_home_data(db: Session = Depends(get_db)):
    hero_products = (
        db.query(Product, Venue, Organization)
        .join(Venue, Product.venue_id == Venue.id)
        .join(Organization, Product.organization_id == Organization.id)
        .filter(Product.is_featured == True)
        .limit(5)
        .all()
    )

    hero = [
        {
            "id": p.id,
            "image": public_url(p.cover_image_url),  # key → URL
            "title": p.title,
            "subtitle": f"{v.city or ''} • {p.category}",
        }
        for p, v, o in hero_products
    ]

    just_on_rush = (
        db.query(Product, Venue)
        .join(Venue, Product.venue_id == Venue.id)
        .order_by(Product.created_at.desc())
        .limit(10)
        .all()
    )

    just_on_rush_list = [
        {
            "id": p.id,
            "image": public_url(p.cover_image_url),  # key → URL
            "title": p.title,
            "venue": v.name,
            "date": p.valid_from.strftime("%d %b %Y") if p.valid_from else "",
        }
        for p, v in just_on_rush
    ]

    picks = (
        db.query(Product, Venue)
        .join(Venue, Product.venue_id == Venue.id)
        .order_by(Product.price.desc())
        .limit(5)
        .all()
    )

    picks_list = [
        {
            "id": p.id,
            "image": public_url(p.cover_image_url),  # key → URL
            "title": p.title,
            "venue": v.name,
            "date": p.valid_from.strftime("%a, %b %d") if p.valid_from else "",
            "price": f"₺{p.price/100:,.0f}",
        }
        for p, v in picks
    ]

    now = datetime.utcnow()
    this_week_products = (
        db.query(Product, Venue)
        .join(Venue, Product.venue_id == Venue.id)
        .filter(Product.valid_from != None)
        .order_by(Product.valid_from.asc())
        .limit(10)
        .all()
    )

    this_week_list = [
        {
            "id": p.id,
            "image": public_url(p.cover_image_url),  # key → URL
            "title": p.title,
            "venue": v.name,
            "date": p.valid_from.strftime("%d %b %Y") if p.valid_from else "",
        }
        for p, v in this_week_products
    ]

    return {
        "hero": hero,
        "just_on_rush": just_on_rush_list,
        "picks": picks_list,
        "this_week": this_week_list,
    }
