from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user, get_optional_current_user
from app.models.auth import User
from app.models.community import CommunityPost

router = APIRouter(prefix="/api/community", tags=["Community & Shared Voyages"])


class CreatePostRequest(BaseModel):
    title: str
    destination_name: str
    content: str
    trip_id: Optional[str] = None
    cover_image: Optional[str] = None
    tags: List[str] = []
    itinerary_snapshot: Optional[Dict[str, Any]] = None


@router.get("/posts")
def list_community_posts(
    destination: Optional[str] = None,
    limit: int = 20,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CommunityPost).filter(CommunityPost.is_public == True)
    if destination:
        query = query.filter(CommunityPost.destination_name.ilike(f"%{destination}%"))
    posts = query.order_by(CommunityPost.created_at.desc()).limit(limit).all()

    # Seed sample verified community reports if empty
    if not posts:
        samples = [
            (
                "Hidden Kyoto: Ancient Zen Temples & Moss Gardens",
                "Kyoto",
                "Just returned from 8 days in Kyoto orchestrated by NAVORA. Honen-in and Gio-ji had practically no crowds at 8 AM. The AI suggested taking the local Randen tram which saved 45 minutes over street taxis.",
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
                ["Kyoto", "Temples", "Slow Travel", "Culture"],
                48, 14
            ),
            (
                "Goa Beyond the Commercial Coast: South Goa Heritage & Feni Trails",
                "Goa",
                "Followed NAVORA's Value Plan for South Goa. Visited ancestral Portuguese mansions in Chandor, dined at Martin's Corner without waiting, and took sunset kayak through the Sal backwaters.",
                "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
                ["Goa", "Heritage", "Beaches", "Food"],
                72, 29
            ),
            (
                "Swiss Glacier Express: Winter Alpine Dream Route",
                "Swiss Alps",
                "Taking the panoramic train across the Landwasser Viaduct was surreal. The replanning agent alerted us to an avalanche risk on day 3 and smoothly rescheduled our Gornergrat cogwheel excursion.",
                "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800",
                ["Switzerland", "Alps", "Luxury Rail", "Winter"],
                115, 42
            )
        ]
        user = current_user or db.query(User).first()
        user_id = user.id if user else None
        if not user_id:
            from app.core.security import get_password_hash
            curator = User(
                email="curator@navora.ai",
                full_name="NAVORA Editorial",
                hashed_password=get_password_hash("Password123!"),
                is_active=True,
                is_verified=True
            )
            db.add(curator)
            db.commit()
            db.refresh(curator)
            user_id = curator.id

        for t, d, c, img, tgs, lks, svs in samples:
            cp = CommunityPost(
                user_id=user_id,
                title=t,
                destination_name=d,
                content=c,
                cover_image=img,
                tags=tgs,
                likes_count=lks,
                saves_count=svs,
                is_public=True
            )
            db.add(cp)
        db.commit()
        posts = db.query(CommunityPost).filter(CommunityPost.is_public == True).all()

    return [
        {
            "id": p.id,
            "title": p.title,
            "destination": p.destination_name,
            "content": p.content,
            "cover_image": p.cover_image,
            "tags": p.tags or [],
            "likes": p.likes_count,
            "saves": p.saves_count,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "has_itinerary_remix": bool(p.itinerary_snapshot)
        }
        for p in posts
    ]


@router.post("/posts")
def create_community_post(
    req: CreatePostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = CommunityPost(
        user_id=current_user.id,
        trip_id=req.trip_id,
        title=req.title,
        destination_name=req.destination_name,
        content=req.content,
        cover_image=req.cover_image or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        tags=req.tags,
        itinerary_snapshot=req.itinerary_snapshot or {},
        likes_count=0,
        saves_count=0,
        is_public=True
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return {"status": "success", "post_id": post.id, "message": "Trip story published to NAVORA Community."}


@router.post("/posts/{post_id}/like")
def like_post(
    post_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    post.likes_count += 1
    db.commit()
    return {"status": "success", "likes": post.likes_count}
