from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class BookingCreate(BaseModel):
    trip_id: Optional[str] = None
    booking_type: str = "Hotel"
    title: Optional[str] = None
    item_name: Optional[str] = None
    provider_name: str = "NAVORA Partner"
    total_amount: float = 0.0
    currency: str = "USD"
    start_time: Optional[datetime] = None
    start_date: Optional[str] = None
    end_time: Optional[datetime] = None
    end_date: Optional[str] = None
    details: Dict[str, Any] = {}

    def model_post_init(self, __context: Any) -> None:
        if not self.title and self.item_name:
            self.title = self.item_name
        elif not self.title:
            self.title = "Reservation"


class BookingOut(BaseModel):
    id: str
    trip_id: str
    user_id: str
    booking_type: str
    title: str
    reference_code: str
    provider_name: str
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    details: Dict[str, Any]
    total_amount: float
    currency: str
    is_demo_data: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentCreateOrder(BaseModel):
    trip_id: Optional[str] = None
    booking_id: Optional[str] = None
    amount: float
    currency: str = "USD"
    receipt: Optional[str] = None


class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    key_id: str
    provider: str
    is_sandbox: bool


class PaymentVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str


class PaymentOut(BaseModel):
    id: str
    booking_id: Optional[str] = None
    trip_id: str
    user_id: str
    provider: str
    order_id: str
    payment_id: Optional[str] = None
    status: str
    amount: float
    currency: str
    payment_method: str
    server_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseSplitIn(BaseModel):
    user_id: str
    share_amount: float
    percentage: Optional[float] = None


class ExpenseCreate(BaseModel):
    trip_id: str
    title: str
    category: str = "dining"
    amount: float
    currency: str = "USD"
    split_method: str = "equal"  # equal, percentage, custom, selected
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    splits: Optional[List[ExpenseSplitIn]] = None


class ExpenseSplitOut(BaseModel):
    id: str
    user_id: str
    share_amount: float
    percentage: Optional[float] = None
    is_settled: bool

    class Config:
        from_attributes = True


class ExpenseOut(BaseModel):
    id: str
    trip_id: str
    paid_by_id: str
    title: str
    category: str
    amount: float
    currency: str
    split_method: str
    notes: Optional[str] = None
    expense_date: datetime
    splits: List[ExpenseSplitOut] = []

    class Config:
        from_attributes = True


class SettlementTransfer(BaseModel):
    from_user_id: str
    from_user_name: str
    to_user_id: str
    to_user_name: str
    amount: float
    currency: str = "USD"
