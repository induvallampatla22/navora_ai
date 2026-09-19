import datetime
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone = Column(String(32), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(128), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_2fa_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    two_factor = relationship("TwoFactorAuth", back_populates="user", uselist=False, cascade="all, delete-orphan")
    recovery_codes = relationship("RecoveryCode", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("AuthSession", back_populates="user", cascade="all, delete-orphan")
    otps = relationship("OTP", back_populates="user", cascade="all, delete-orphan")
    trips = relationship("TripMember", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("CoinWallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    avatar_url = Column(String(512), nullable=True)
    home_city = Column(String(128), nullable=True)
    home_country = Column(String(128), nullable=True)
    preferred_currency = Column(String(8), default="USD")
    preferred_language = Column(String(16), default="en")
    bio = Column(Text, nullable=True)
    travel_styles = Column(JSON, default=list)  # ["luxury", "adventure", "culture"]
    dietary_preferences = Column(JSON, default=list)  # ["vegetarian", "halal", "vegan"]
    interests = Column(JSON, default=list)
    accessibility_needs = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token = Column(String(512), unique=True, index=True, nullable=False)
    user_agent = Column(String(512), nullable=True)
    ip_address = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="sessions")


class OTP(Base):
    __tablename__ = "otps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    identifier = Column(String(255), index=True, nullable=False)  # email or phone
    otp_code = Column(String(16), nullable=False)
    purpose = Column(String(32), default="registration")  # registration, login, reset_password
    attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="otps")


class TwoFactorAuth(Base):
    __tablename__ = "two_factor_auths"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    secret_key = Column(String(128), nullable=False)
    is_confirmed = Column(Boolean, default=False)
    confirmed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="two_factor")


class RecoveryCode(Base):
    __tablename__ = "recovery_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    code_hash = Column(String(255), nullable=False)
    is_used = Column(Boolean, default=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recovery_codes")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(64), nullable=False, index=True)
    entity_type = Column(String(64), nullable=True)
    entity_id = Column(String(64), nullable=True)
    details = Column(JSON, default=dict)
    ip_address = Column(String(64), nullable=True)
    status = Column(String(32), default="success")  # success, failure
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
