import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base


class CoinWallet(Base):
    __tablename__ = "coin_wallets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance = Column(Integer, default=100)  # Starting welcome bonus of 100 NAVORA Coins
    total_earned = Column(Integer, default=100)
    total_redeemed = Column(Integer, default=0)
    credit_exchange_rate = Column(Float, default=0.05)  # 100 coins = $5.00 travel credit
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="wallet")
    transactions = relationship("CoinTransaction", back_populates="wallet", cascade="all, delete-orphan", order_by="desc(CoinTransaction.created_at)")


class CoinTransaction(Base):
    __tablename__ = "coin_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = Column(String(36), ForeignKey("coin_wallets.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_type = Column(String(16), nullable=False)  # EARNED, REDEEMED, BONUS, EXPIRED
    amount = Column(Integer, nullable=False)
    balance_after = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)  # "Trip completion to Goa", "Verified review reward", "Discount redemption"
    reference_entity_type = Column(String(32), nullable=True)  # trip, booking, review, profile
    reference_entity_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    wallet = relationship("CoinWallet", back_populates="transactions")
