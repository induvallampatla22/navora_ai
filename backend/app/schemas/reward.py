from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class CoinTransactionOut(BaseModel):
    id: str
    transaction_type: str
    amount: int
    balance_after: int
    reason: str
    reference_entity_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CoinWalletOut(BaseModel):
    id: str
    user_id: str
    balance: int
    total_earned: int
    total_redeemed: int
    credit_exchange_rate: float
    travel_credit_usd: float
    recent_transactions: List[CoinTransactionOut] = []

    class Config:
        from_attributes = True


class RedeemCoinsRequest(BaseModel):
    amount: int
    purpose: str = "travel_discount"
    trip_id: Optional[str] = None


class RedeemCoinsResponse(BaseModel):
    success: bool
    coins_deducted: int
    remaining_balance: int
    discount_credit_value: float
    voucher_code: str
    message: str
