import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_type = Column(String(32), index=True, nullable=False)  # flight, train, bus, hotel, activity, restaurant, tour
    title = Column(String(255), nullable=False)
    reference_code = Column(String(64), unique=True, index=True, default=lambda: f"NAV-{uuid.uuid4().hex[:8].upper()}")
    provider_name = Column(String(128), nullable=False)
    status = Column(String(32), default="Pending", index=True)  # Pending, Confirmed, Cancelled, Completed
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    details = Column(JSON, default=dict)  # {"room_type": "Deluxe", "seats": ["12A"], "pickup": "Terminal 2"}
    total_amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    is_demo_data = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False, cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(String(36), ForeignKey("bookings.id", ondelete="CASCADE"), unique=True, nullable=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String(32), default="Razorpay Sandbox")  # Razorpay, Demo Sandbox
    order_id = Column(String(128), index=True, nullable=False)
    payment_id = Column(String(128), nullable=True)
    signature = Column(String(255), nullable=True)
    status = Column(String(32), default="created", index=True)  # created, authorized, captured, refunded, failed
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    payment_method = Column(String(32), default="UPI / Card / NetBanking")
    receipt = Column(String(64), nullable=True)
    notes = Column(JSON, default=dict)
    server_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    paid_by_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(32), default="dining")  # stay, transport, dining, activity, shopping, other
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    split_method = Column(String(32), default="equal")  # equal, percentage, custom, selected
    receipt_url = Column(String(512), nullable=True)
    notes = Column(Text, nullable=True)
    expense_date = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trip = relationship("Trip", back_populates="expenses")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")


class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expense_id = Column(String(36), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    share_amount = Column(Float, nullable=False)
    percentage = Column(Float, nullable=True)
    is_settled = Column(Boolean, default=False)
    settled_at = Column(DateTime, nullable=True)

    expense = relationship("Expense", back_populates="splits")
