from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class CompareItemOut(BaseModel):
    id: str
    category: str  # transport, stay, activity, dining, agency
    name: str
    sub_title: str
    price: float
    currency: str
    rating: float
    duration: Optional[str] = None
    location: Optional[str] = None
    distance_km: Optional[float] = None
    preference_match_score: float
    budget_impact: str  # Low, Balanced, High
    cancellation_terms: str
    pros: List[str]
    trade_offs: List[str]
    metadata: Dict[str, Any] = {}
    is_demo_data: bool = False


class CompareMatrixOut(BaseModel):
    destination: str
    active_tab: str
    items: List[CompareItemOut]
    summary: str
    trade_off_explanation: str
