import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(String(32), index=True, nullable=False)  # hotel, restaurant, activity, transport, agency, destination
    entity_id = Column(String(64), index=True, nullable=False)
    rating = Column(Float, nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_verified = Column(Boolean, default=False)  # True only if user completed a trip/booking for this item
    helpful_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reviews")


class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    destination_name = Column(String(128), index=True, nullable=False)
    content = Column(Text, nullable=False)
    cover_image = Column(String(512), nullable=True)
    tags = Column(JSON, default=list)
    itinerary_snapshot = Column(JSON, default=dict)  # Snapshot allowing other users to "Remix" into their own trip
    likes_count = Column(Integer, default=0)
    saves_count = Column(Integer, default=0)
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(32), index=True, nullable=False)  # booking, payment, group, expense, delay, weather, replanning, security, coin
    severity = Column(String(16), default="INFO")  # INFO, ATTENTION, URGENT
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    action_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")
