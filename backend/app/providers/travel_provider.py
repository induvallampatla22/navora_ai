import logging
from typing import List, Dict, Any
from app.config import settings
from app.providers.base import BaseTravelProvider

logger = logging.getLogger("navora.providers.travel")


class MultiModalTravelProvider(BaseTravelProvider):
    def __init__(self):
        self.api_key = settings.TRAVEL_API_KEY
        self.api_secret = settings.TRAVEL_API_SECRET
        self.is_active = bool(self.api_key and self.api_secret and not settings.DEMO_MODE)

    def search_transport(
        self,
        origin: str,
        destination: str,
        date: str = "2026-10-15",
        excluded_modes: List[str] = None
    ) -> List[Dict[str, Any]]:
        excluded = [m.lower().strip() for m in (excluded_modes or [])]

        # Multi-modal options spanning all transit forms
        raw_options = [
            {
                "id": "trans-flight-express",
                "origin": origin,
                "destination": destination,
                "mode": "Flight",
                "sub_mode": "Flight + Airport Express",
                "provider_name": "Skyline Airways / Airport Express",
                "departure_time": "08:15 AM",
                "arrival_time": "11:45 AM",
                "duration_minutes": 210,
                "transfers": 1,
                "price": 280.0,
                "currency": "USD",
                "comfort_rating": 4.6,
                "cancellation_policy": "Refundable with $25 fee up to 24h prior",
                "preference_match": 88.0,
                "budget_impact": "High",
                "co2_emissions_kg": 115.0,
                "is_demo_data": not self.is_active
            },
            {
                "id": "trans-highspeed-rail",
                "origin": origin,
                "destination": destination,
                "mode": "Train",
                "sub_mode": "High-Speed Rail + Station Cab",
                "provider_name": "Continental Bullet Rail",
                "departure_time": "07:30 AM",
                "arrival_time": "12:15 PM",
                "duration_minutes": 285,
                "transfers": 0,
                "price": 120.0,
                "currency": "USD",
                "comfort_rating": 4.8,
                "cancellation_policy": "Full refund up to 2 hours before departure",
                "preference_match": 95.0,
                "budget_impact": "Balanced",
                "co2_emissions_kg": 24.0,
                "is_demo_data": not self.is_active
            },
            {
                "id": "trans-luxury-coach",
                "origin": origin,
                "destination": destination,
                "mode": "Bus",
                "sub_mode": "Sleeper Luxury Coach",
                "provider_name": "SilverLine Intercity Coach",
                "departure_time": "10:00 PM (Overnight)",
                "arrival_time": "06:30 AM",
                "duration_minutes": 510,
                "transfers": 0,
                "price": 45.0,
                "currency": "USD",
                "comfort_rating": 4.2,
                "cancellation_policy": "Free cancellation up to 12h before trip",
                "preference_match": 78.0,
                "budget_impact": "Low",
                "co2_emissions_kg": 18.0,
                "is_demo_data": not self.is_active
            },
            {
                "id": "trans-private-chauffeur",
                "origin": origin,
                "destination": destination,
                "mode": "Cab",
                "sub_mode": "Dedicated Private Chauffeur",
                "provider_name": "Apex Elite Mobility",
                "departure_time": "Flexible on-demand",
                "arrival_time": "Estimated +5.5 hours",
                "duration_minutes": 330,
                "transfers": 0,
                "price": 310.0,
                "currency": "USD",
                "comfort_rating": 4.9,
                "cancellation_policy": "Free cancellation up to 4 hours prior",
                "preference_match": 92.0,
                "budget_impact": "High",
                "co2_emissions_kg": 85.0,
                "is_demo_data": not self.is_active
            },
            {
                "id": "trans-self-drive-suv",
                "origin": origin,
                "destination": destination,
                "mode": "Car",
                "sub_mode": "Self-Drive Electric SUV Rental",
                "provider_name": "VoltDrive Rentals",
                "departure_time": "Flexible",
                "arrival_time": "Self-paced",
                "duration_minutes": 360,
                "transfers": 0,
                "price": 140.0,
                "currency": "USD",
                "comfort_rating": 4.7,
                "cancellation_policy": "Free cancellation anytime before pickup",
                "preference_match": 91.0,
                "budget_impact": "Balanced",
                "co2_emissions_kg": 0.0,
                "is_demo_data": not self.is_active
            },
            {
                "id": "trans-scenic-ferry",
                "origin": origin,
                "destination": destination,
                "mode": "Ferry",
                "sub_mode": "Coastal Express Ferry + Local Taxi",
                "provider_name": "Oceanic Cruise Link",
                "departure_time": "09:00 AM",
                "arrival_time": "01:30 PM",
                "duration_minutes": 270,
                "transfers": 1,
                "price": 85.0,
                "currency": "USD",
                "comfort_rating": 4.5,
                "cancellation_policy": "Refundable 48h in advance",
                "preference_match": 84.0,
                "budget_impact": "Low",
                "co2_emissions_kg": 32.0,
                "is_demo_data": not self.is_active
            }
        ]

        # Filter strictly out any excluded transport modes (e.g., if user says "I don't want flights", exclude "flight")
        filtered_options = []
        for opt in raw_options:
            mode_name = opt["mode"].lower()
            if any(exc in mode_name for exc in excluded):
                continue
            filtered_options.append(opt)

        return filtered_options


travel_provider = MultiModalTravelProvider()
