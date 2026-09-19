import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    destinations = Column(JSON, default=list)  # ["Tokyo", "Kyoto"] or ["Goa"]
    primary_destination = Column(String(128), index=True, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    duration_days = Column(Integer, default=5)
    travelers_count = Column(Integer, default=2)
    trip_type = Column(String(32), default="Leisure")  # Solo, Couple, Family, Friends, Luxury, Adventure
    status = Column(String(32), default="Planning", index=True)  # Planning, Decided, Booked, Active, Completed, Cancelled
    total_budget = Column(Float, default=2000.0)
    currency = Column(String(8), default="USD")
    current_estimated_cost = Column(Float, default=0.0)
    active_plan_id = Column(String(36), nullable=True)
    invite_code = Column(String(32), unique=True, index=True, default=lambda: uuid.uuid4().hex[:8].upper())
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    members = relationship("TripMember", back_populates="trip", cascade="all, delete-orphan")
    preferences = relationship("TripPreference", back_populates="trip", uselist=False, cascade="all, delete-orphan")
    itineraries = relationship("Itinerary", back_populates="trip", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    alerts = relationship("TripAlert", back_populates="trip", cascade="all, delete-orphan")
    packing_items = relationship("PackingItem", back_populates="trip", cascade="all, delete-orphan")


class TripMember(Base):
    __tablename__ = "trip_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(32), default="member")  # organizer, editor, member
    status = Column(String(32), default="accepted")  # invited, accepted, declined
    budget_contribution = Column(Float, default=0.0)
    preferences = Column(JSON, default=dict)
    location_sharing_consent = Column(Boolean, default=False)
    last_latitude = Column(Float, nullable=True)
    last_longitude = Column(Float, nullable=True)
    last_location_update = Column(DateTime, nullable=True)
    joined_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="members")
    user = relationship("User", back_populates="trips")


class TripPreference(Base):
    __tablename__ = "trip_preferences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), unique=True, nullable=False)
    starting_location = Column(String(128), default="New York, USA")
    interests = Column(JSON, default=list)  # ["Sightseeing", "Food", "History", "Beaches"]
    dietary_preferences = Column(JSON, default=list)  # ["Vegetarian", "Halal"]
    accommodation_preferences = Column(JSON, default=list)  # ["Boutique Hotel", "Resort"]
    transport_preferences = Column(JSON, default=list)  # ["Train", "Car Rental", "Public Transit"]
    excluded_transport = Column(JSON, default=list)  # ["Flight"] -> User says: "I don't want flights"
    weather_preference = Column(String(64), default="Mild and Sunny")
    accessibility_requirements = Column(JSON, default=list)
    things_to_avoid = Column(JSON, default=list)
    custom_instructions = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="preferences")


class Itinerary(Base):
    __tablename__ = "itineraries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    plan_tier = Column(String(32), default="Plan B")  # Plan A (Value), Plan B (Comfort), Plan C (Premium)
    total_cost = Column(Float, default=0.0)
    currency = Column(String(8), default="USD")
    summary = Column(Text, nullable=True)
    trade_offs = Column(Text, nullable=True)
    fit_rationale = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="itineraries")
    items = relationship("ItineraryItem", back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryItem.order_index")


class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    itinerary_id = Column(String(36), ForeignKey("itineraries.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)
    time_slot = Column(String(32), default="Morning")  # Morning, Afternoon, Evening
    item_type = Column(String(32), default="activity")  # activity, transport, hotel, restaurant, shopping
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    start_time = Column(String(16), default="09:00 AM")
    duration_minutes = Column(Integer, default=120)
    cost = Column(Float, default=0.0)
    currency = Column(String(8), default="USD")
    travel_time_from_previous_min = Column(Integer, default=15)
    transport_mode = Column(String(64), default="Walk / Metro")
    weather_suitability = Column(String(64), default="Ideal in clear/mild weather")
    nearby_restaurant_hint = Column(String(255), nullable=True)
    status = Column(String(32), default="Scheduled")  # Scheduled, Completed, Delayed, Cancelled, Replanned
    order_index = Column(Integer, default=0)

    itinerary = relationship("Itinerary", back_populates="items")
