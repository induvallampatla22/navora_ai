from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class DestinationSummary(BaseModel):
    id: str
    name: str
    slug: str
    country: str
    region: str
    continent: str
    editorial_description: str
    hero_image: str
    categories: List[str]
    best_season: str
    approx_budget_per_day: float
    currency: str
    safety_score: float
    is_demo_data: bool

    class Config:
        from_attributes = True


class ExperienceOut(BaseModel):
    id: str
    title: str
    category: str
    description: str
    duration_hours: float
    price: float
    currency: str
    rating: float
    review_count: int
    location_name: str
    image_url: str
    suitable_weather: List[str]
    tags: List[str]
    is_demo_data: bool

    class Config:
        from_attributes = True


class TransportOptionOut(BaseModel):
    id: str
    origin: str
    destination: str
    mode: str
    sub_mode: Optional[str] = None
    provider_name: str
    departure_time: str
    arrival_time: str
    duration_minutes: int
    transfers: int
    price: float
    currency: str
    comfort_rating: float
    cancellation_policy: str
    preference_match: float
    budget_impact: str
    co2_emissions_kg: float
    is_demo_data: bool

    class Config:
        from_attributes = True


class HotelOut(BaseModel):
    id: str
    name: str
    stay_type: str
    stars: int
    rating: float
    review_count: int
    address: str
    price_per_night: float
    currency: str
    amenities: List[str]
    has_breakfast: bool
    free_cancellation: bool
    image_url: str
    preference_match: float
    is_demo_data: bool

    class Config:
        from_attributes = True


class RestaurantOut(BaseModel):
    id: str
    name: str
    cuisine: str
    dietary_options: List[str]
    price_range: str
    approx_cost_for_two: float
    currency: str
    rating: float
    review_count: int
    address: str
    opening_hours: str
    image_url: str
    is_demo_data: bool

    class Config:
        from_attributes = True


class AgencyOut(BaseModel):
    id: str
    name: str
    package_title: str
    price: float
    currency: str
    duration_days: int
    hotel_included: bool
    transport_included: bool
    guide_included: bool
    inclusions: List[str]
    exclusions: List[str]
    rating: float
    review_count: int
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    is_demo_data: bool

    class Config:
        from_attributes = True


class DestinationDetail(DestinationSummary):
    latitude: float
    longitude: float
    gallery_images: List[str]
    ideal_duration_days: int
    safety_overview: Optional[str] = None
    emergency_numbers: Dict[str, Any] = {}
    shopping_highlights: List[Dict[str, Any]] = []
    transport_overview: Optional[str] = None
    experiences: List[ExperienceOut] = []
    hotels: List[HotelOut] = []
    restaurants: List[RestaurantOut] = []
    agencies: List[AgencyOut] = []

    class Config:
        from_attributes = True


class SavedPlaceCreate(BaseModel):
    destination_name: str
    place_name: str
    category: str = "Attraction"
    notes: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class SavedPlaceOut(SavedPlaceCreate):
    id: str
    user_id: str

    class Config:
        from_attributes = True
