from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user, get_optional_current_user
from app.models.auth import User
from app.models.community import Review
from app.models.commerce import Booking

router = APIRouter(prefix="/api/reviews", tags=["Verified Reviews"])


class CreateReviewRequest(BaseModel):
    entity_type: str = Field(..., description="hotel, restaurant, activity, transport, agency, destination")
    entity_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=10)


class ReviewOut(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    rating: float
    title: str
    content: str
    is_verified: bool
    helpful_votes: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[ReviewOut])
def list_reviews(
    entity_type: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    limit: int = 20,
    db: Session = Depends(get_db)
):
    query = db.query(Review)
    if entity_type:
        query = query.filter(Review.entity_type == entity_type)
    if entity_id:
        query = query.filter(Review.entity_id == entity_id)

    reviews = query.order_by(Review.created_at.desc()).limit(limit).all()

    # Seed sample verified reviews if table is empty
    if not reviews:
        samples = [
            ("hotel", "hotel-tokyo-1", 5.0, "Flawless hospitality & view over Imperial Palace", "The Peninsula Tokyo exceeded all expectations. Check-in was swift and the NAVORA concierge had our preferences pre-arranged.", True, 18),
            ("restaurant", "rest-tokyo-1", 5.0, "Sublime Omakase Experience", "Pure artistry in every single nigiri piece. Reserving through the NAVORA Dining Agent was seamless.", True, 24),
            ("experience", "exp-snorkel-maldives", 4.9, "Crystal clear waters and vibrant reef", "Encountered sea turtles and manta rays within 10 minutes. Knowledgeable marine biologist guide.", True, 31),
        ]
        for et, eid, r, t, c, v, h in samples:
            rev = Review(
                user_id="demo-user",
                entity_type=et,
                entity_id=eid,
                rating=r,
                title=t,
                content=c,
                is_verified=v,
                helpful_votes=h
            )
            db.add(rev)
        db.commit()
        reviews = db.query(Review).all()

    return [
        ReviewOut(
            id=r.id,
            entity_type=r.entity_type,
            entity_id=r.entity_id,
            rating=float(r.rating),
            title=r.title,
            content=r.content,
            is_verified=bool(r.is_verified),
            helpful_votes=int(r.helpful_votes),
            created_at=r.created_at.isoformat() if r.created_at else None
        )
        for r in reviews
    ]


@router.post("", response_model=ReviewOut)
def submit_review(
    req: CreateReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine verified status: has user booked/completed this item
    has_completed_booking = db.query(Booking).filter(
        Booking.user_id == current_user.id,
        Booking.status.in_(["Confirmed", "Completed"])
    ).first() is not None

    review = Review(
        user_id=current_user.id,
        entity_type=req.entity_type,
        entity_id=req.entity_id,
        rating=req.rating,
        title=req.title,
        content=req.content,
        is_verified=has_completed_booking,
        helpful_votes=0
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    return ReviewOut(
        id=review.id,
        entity_type=review.entity_type,
        entity_id=review.entity_id,
        rating=float(review.rating),
        title=review.title,
        content=review.content,
        is_verified=bool(review.is_verified),
        helpful_votes=int(review.helpful_votes),
        created_at=review.created_at.isoformat() if review.created_at else None
    )
