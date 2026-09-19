from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class WeatherForecastDay(BaseModel):
    day: str
    temp_high_c: float
    temp_low_c: float
    condition: str
    icon: str
    rain_chance_pct: int


class WeatherOut(BaseModel):
    destination_name: str
    temperature_c: float
    condition: str
    humidity_pct: int
    wind_kmh: float
    rain_chance_pct: int
    risk_level: str
    risk_advisory: Optional[str] = None
    forecast: List[WeatherForecastDay]
    source: str
    is_demo_data: bool
    timestamp: datetime


class TripAlertOut(BaseModel):
    id: str
    trip_id: str
    alert_type: str
    severity: str  # INFO, ATTENTION, URGENT
    title: str
    message: str
    downstream_impact: List[str]
    recommended_action: Dict[str, Any]
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PackingItemCreate(BaseModel):
    item_name: str
    category: str = "Clothing"
    assigned_to_user_id: Optional[str] = None
    is_essential: bool = False


class PackingItemOut(BaseModel):
    id: str
    trip_id: str
    item_name: str
    category: str
    assigned_to_user_id: Optional[str] = None
    is_packed: bool
    is_essential: bool

    class Config:
        from_attributes = True


class DocumentOut(BaseModel):
    id: str
    user_id: str
    trip_id: Optional[str] = None
    booking_id: Optional[str] = None
    title: str
    doc_type: str
    file_path: str
    file_size_kb: int
    is_encrypted: bool
    created_at: datetime

    class Config:
        from_attributes = True
