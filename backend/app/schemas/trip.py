from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class TripPreferenceIn(BaseModel):
    starting_location: str = "New York, USA"
    interests: List[str] = ["Culture", "Sightseeing", "Food"]
    dietary_preferences: List[str] = ["Vegetarian"]
    accommodation_preferences: List[str] = ["Boutique Hotel", "Resort"]
    transport_preferences: List[str] = ["Train", "Car Rental", "Public Transit"]
    excluded_transport: List[str] = Field(default_factory=list, description="List of transport modes to exclude e.g. ['Flight']")
    weather_preference: str = "Mild and Sunny"
    accessibility_requirements: List[str] = []
    things_to_avoid: List[str] = []
    custom_instructions: Optional[str] = None


class TripCreate(BaseModel):
    title: str
    primary_destination: str
    destinations: List[str] = []
    start_date: datetime
    end_date: datetime
    travelers_count: int = 2
    trip_type: str = "Leisure"
    total_budget: float = 2500.0
    currency: str = "USD"
    preferences: Optional[TripPreferenceIn] = None


class TripMemberOut(BaseModel):
    id: str
    user_id: str
    role: str
    status: str
    budget_contribution: float
    location_sharing_consent: bool
    last_latitude: Optional[float] = None
    last_longitude: Optional[float] = None

    class Config:
        from_attributes = True


class ItineraryItemOut(BaseModel):
    id: str
    day_number: int
    time_slot: str
    item_type: str
    title: str
    description: Optional[str] = None
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: str
    duration_minutes: int
    cost: float
    currency: str
    travel_time_from_previous_min: int
    transport_mode: str
    weather_suitability: str
    nearby_restaurant_hint: Optional[str] = None
    status: str
    order_index: int

    class Config:
        from_attributes = True


class ItineraryOut(BaseModel):
    id: str
    trip_id: str
    title: str
    plan_tier: str
    total_cost: float
    currency: str
    summary: Optional[str] = None
    trade_offs: Optional[str] = None
    fit_rationale: Optional[str] = None
    is_active: bool
    items: List[ItineraryItemOut] = []

    class Config:
        from_attributes = True


class TripOut(BaseModel):
    id: str
    creator_id: str
    title: str
    primary_destination: str
    destinations: List[str]
    start_date: datetime
    end_date: datetime
    duration_days: int
    travelers_count: int
    trip_type: str
    status: str
    total_budget: float
    currency: str
    current_estimated_cost: float
    active_plan_id: Optional[str] = None
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIPlanTier(BaseModel):
    plan_tier: str  # Plan A (Value), Plan B (Comfort), Plan C (Premium Experience)
    title: str
    total_cost: float
    remaining_budget: float
    currency: str
    fit_rationale: str
    trade_offs: str
    transport: Dict[str, Any]
    hotel: Dict[str, Any]
    activities: List[Dict[str, Any]]
    dining_highlights: List[Dict[str, Any]]
    agency_option: Optional[Dict[str, Any]] = None
    estimated_daily_expenses: float
    sample_itinerary: List[Dict[str, Any]]


class AIPlanABCResponse(BaseModel):
    trip_id: str
    primary_destination: str
    plans: List[AIPlanTier]
    disclaimer: str = "Dynamically calculated based on real-time parameters and user constraints."
