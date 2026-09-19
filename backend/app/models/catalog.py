import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Destination(Base):
    __tablename__ = "destinations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(128), index=True, nullable=False)
    slug = Column(String(128), unique=True, index=True, nullable=False)
    country = Column(String(128), index=True, nullable=False)
    region = Column(String(128), nullable=False)
    continent = Column(String(64), index=True, default="Global")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    editorial_description = Column(Text, nullable=False)
    hero_image = Column(String(512), nullable=False)
    gallery_images = Column(JSON, default=list)
    categories = Column(JSON, default=list)  # ["Beaches", "Luxury", "International", etc.]
    best_season = Column(String(128), nullable=False)
    ideal_duration_days = Column(Integer, default=5)
    approx_budget_per_day = Column(Float, default=150.0)
    currency = Column(String(8), default="USD")
    safety_score = Column(Float, default=8.8)
    safety_overview = Column(Text, nullable=True)
    emergency_numbers = Column(JSON, default=dict)
    shopping_highlights = Column(JSON, default=list)
    transport_overview = Column(Text, nullable=True)
    is_demo_data = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    experiences = relationship("Experience", back_populates="destination", cascade="all, delete-orphan")
    hotels = relationship("Hotel", back_populates="destination", cascade="all, delete-orphan")
    restaurants = relationship("Restaurant", back_populates="destination", cascade="all, delete-orphan")
    agencies = relationship("Agency", back_populates="destination", cascade="all, delete-orphan")


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    destination_id = Column(String(36), ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(64), index=True, nullable=False)  # Attraction, Adventure, Culture, Water sports, etc.
    description = Column(Text, nullable=False)
    duration_hours = Column(Float, default=2.5)
    price = Column(Float, default=0.0)
    currency = Column(String(8), default="USD")
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=120)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(512), nullable=False)
    suitable_weather = Column(JSON, default=list)  # ["clear", "sunny", "mild"]
    tags = Column(JSON, default=list)
    is_demo_data = Column(Boolean, default=False)

    destination = relationship("Destination", back_populates="experiences")


class TransportOption(Base):
    __tablename__ = "transport_options"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    origin = Column(String(128), index=True, nullable=False)
    destination = Column(String(128), index=True, nullable=False)
    mode = Column(String(32), index=True, nullable=False)  # Flight, Train, Bus, Car, Cab, Ferry, Metro, Walking
    sub_mode = Column(String(64), nullable=True)  # e.g. "Train + Cab", "Flight + Metro"
    provider_name = Column(String(128), nullable=False)
    departure_time = Column(String(32), nullable=False)
    arrival_time = Column(String(32), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    transfers = Column(Integer, default=0)
    price = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    comfort_rating = Column(Float, default=4.5)
    cancellation_policy = Column(String(128), default="Free cancellation up to 24h")
    preference_match = Column(Float, default=90.0)
    budget_impact = Column(String(32), default="Moderate")  # Low, Moderate, High
    co2_emissions_kg = Column(Float, default=45.0)
    is_demo_data = Column(Boolean, default=False)


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    destination_id = Column(String(36), ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    stay_type = Column(String(32), default="hotel")  # hotel, resort, homestay, hostel, villa
    stars = Column(Integer, default=4)
    rating = Column(Float, default=4.7)
    review_count = Column(Integer, default=240)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price_per_night = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    amenities = Column(JSON, default=list)  # ["Wifi", "Pool", "Spa", "Breakfast Included"]
    has_breakfast = Column(Boolean, default=True)
    free_cancellation = Column(Boolean, default=True)
    image_url = Column(String(512), nullable=False)
    preference_match = Column(Float, default=92.0)
    is_demo_data = Column(Boolean, default=False)

    destination = relationship("Destination", back_populates="hotels")


class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    destination_id = Column(String(36), ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    cuisine = Column(String(128), nullable=False)
    dietary_options = Column(JSON, default=list)  # ["Vegetarian", "Vegan", "Jain", "Halal", "Gluten-Free"]
    price_range = Column(String(8), default="$$")  # $, $$, $$$, $$$$
    approx_cost_for_two = Column(Float, default=40.0)
    currency = Column(String(8), default="USD")
    rating = Column(Float, default=4.6)
    review_count = Column(Integer, default=180)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    opening_hours = Column(String(64), default="11:00 AM - 11:00 PM")
    phone = Column(String(32), nullable=True)
    image_url = Column(String(512), nullable=False)
    is_demo_data = Column(Boolean, default=False)

    destination = relationship("Destination", back_populates="restaurants")


class Agency(Base):
    __tablename__ = "agencies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    destination_id = Column(String(36), ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    package_title = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    duration_days = Column(Integer, default=4)
    hotel_included = Column(Boolean, default=True)
    transport_included = Column(Boolean, default=True)
    guide_included = Column(Boolean, default=True)
    inclusions = Column(JSON, default=list)
    exclusions = Column(JSON, default=list)
    rating = Column(Float, default=4.8)
    review_count = Column(Integer, default=85)
    contact_phone = Column(String(32), nullable=True)
    contact_email = Column(String(128), nullable=True)
    is_demo_data = Column(Boolean, default=True)

    destination = relationship("Destination", back_populates="agencies")


class SavedPlace(Base):
    __tablename__ = "saved_places"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_name = Column(String(128), nullable=False)
    place_name = Column(String(255), nullable=False)
    category = Column(String(64), default="Attraction")
    notes = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
