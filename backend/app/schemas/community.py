from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    entity_type: str = Field(..., description="hotel, restaurant, activity, transport, agency, destination")
    entity_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    title: str
    content: str


class ReviewOut(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = "Verified Traveler"
    entity_type: str
    entity_id: str
    rating: float
    title: str
    content: str
    is_verified: bool
    helpful_votes: int
    created_at: datetime

    class Config:
        from_attributes = True


class CommunityPostCreate(BaseModel):
    trip_id: Optional[str] = None
    title: str
    destination_name: str
    content: str
    cover_image: Optional[str] = None
    tags: List[str] = []
    itinerary_snapshot: Optional[Dict[str, Any]] = None


class CommunityPostOut(BaseModel):
    id: str
    user_id: str
    author_name: Optional[str] = "Explorer"
    trip_id: Optional[str] = None
    title: str
    destination_name: str
    content: str
    cover_image: Optional[str] = None
    tags: List[str]
    likes_count: int
    saves_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationOut(BaseModel):
    id: str
    type: str
    severity: str
    title: str
    message: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
