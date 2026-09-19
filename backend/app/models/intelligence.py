import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class WeatherSnapshot(Base):
    __tablename__ = "weather_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    destination_name = Column(String(128), index=True, nullable=False)
    temperature_c = Column(Float, nullable=False)
    condition = Column(String(64), nullable=False)  # Sunny, Rain, Overcast, Snow, Storm
    humidity_pct = Column(Integer, default=60)
    wind_kmh = Column(Float, default=12.0)
    rain_chance_pct = Column(Integer, default=10)
    forecast_days = Column(JSON, default=list)  # [{"day": "Mon", "temp": 28, "condition": "Sunny"}]
    risk_level = Column(String(32), default="Low")  # Low, Moderate, High, Severe
    risk_advisory = Column(Text, nullable=True)
    source = Column(String(64), default="NAVORA Travel Intelligence Engine")
    is_demo_data = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)


class TripAlert(Base):
    __tablename__ = "trip_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    alert_type = Column(String(32), index=True, nullable=False)  # delay, cancellation, weather_risk, conflict, emergency
    severity = Column(String(16), default="INFO", index=True)  # INFO, ATTENTION, URGENT
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    downstream_impact = Column(JSON, default=list)  # e.g. ["Hotel check-in delayed", "Missed Sunset Tour"]
    recommended_action = Column(JSON, default=dict)  # {"action": "Replan Day 1", "approval_required": True}
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="alerts")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=True, index=True)
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    doc_type = Column(String(32), index=True, default="ticket")  # ticket, voucher, id, insurance, receipt
    file_path = Column(String(512), nullable=False)
    file_size_kb = Column(Integer, default=120)
    is_encrypted = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="documents")


class PackingItem(Base):
    __tablename__ = "packing_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to_user_id = Column(String(36), nullable=True)
    item_name = Column(String(128), nullable=False)
    category = Column(String(32), default="Clothing")  # Clothing, Electronics, Toiletries, Documents, Gear, Medicine
    is_packed = Column(Boolean, default=False)
    is_essential = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="packing_items")
