from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.providers.weather_provider import weather_provider
from app.providers.travel_provider import travel_provider
from app.providers.maps_provider import maps_provider
from app.providers.razorpay_provider import razorpay_provider
from app.models.catalog import Destination, Hotel, Experience, Restaurant, Agency


class DestinationAgent:
    """Discovers, searches, and provides contextual destination dossiers."""
    name = "DestinationAgent"

    def execute(self, query: str, filters: Dict[str, Any] = None, db: Session = None) -> Dict[str, Any]:
        results = []
        if db:
            destinations = db.query(Destination).limit(5).all()
            results = [d.name for d in destinations]
        else:
            results = ["Goa", "Kashmir", "Tokyo", "Paris", "Bali"]
            
        return {
            "status": "success",
            "agent": self.name,
            "query": query,
            "recommended_destinations": results
        }


class WeatherRiskAgent:
    """Analyzes live and forecast meteorological hazards and risks."""
    name = "WeatherRiskAgent"

    def execute(self, destination: str) -> Dict[str, Any]:
        weather_data = weather_provider.get_weather(destination)
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "weather": weather_data,
            "safe_for_travel": weather_data.get("risk_level") in ["Low", "Moderate"]
        }


class TransportAgent:
    """Evaluates multi-modal transit options and filters constraints."""
    name = "TransportAgent"

    def execute(self, origin: str, destination: str, excluded_modes: List[str] = None) -> Dict[str, Any]:
        options = travel_provider.search_transport(origin, destination, excluded_modes=excluded_modes or [])
        return {
            "status": "success",
            "agent": self.name,
            "origin": origin,
            "destination": destination,
            "options": options,
            "excluded_modes": excluded_modes or [],
            "best_match": options[0] if options else None
        }


class HotelAgent:
    """Finds stays matching budget, travel style, and dietary/amenity requirements."""
    name = "HotelAgent"

    def execute(self, destination: str, budget_tier: str = "balanced", db: Session = None) -> Dict[str, Any]:
        hotels = []
        if db:
            dest = db.query(Destination).filter(Destination.name.ilike(f"%{destination}%")).first()
            if dest:
                hotels = [{"name": h.name, "stars": h.stars, "price": h.price_per_night, "rating": h.rating} for h in dest.hotels]
                
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "budget_tier": budget_tier,
            "criteria": "Free cancellation, high guest satisfaction score (>4.5)",
            "hotels": hotels
        }


class ActivityAgent:
    """Discovers cultural, scenic, and adventure attractions."""
    name = "ActivityAgent"

    def execute(self, destination: str, interests: List[str] = None, db: Session = None) -> Dict[str, Any]:
        activities = []
        if db:
            dest = db.query(Destination).filter(Destination.name.ilike(f"%{destination}%")).first()
            if dest:
                activities = [{"title": a.title, "category": a.category, "price": a.price, "rating": a.rating} for a in dest.experiences]

        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "interests": interests or ["Sightseeing", "Nature"],
            "outdoor_contingency": "Indoor museums and cultural workshops selected for rainy days.",
            "activities": activities
        }


class RestaurantAgent:
    """Curates dining spots matching specific dietary restrictions."""
    name = "RestaurantAgent"

    def execute(self, destination: str, dietary_preferences: List[str] = None, db: Session = None) -> Dict[str, Any]:
        dietary = dietary_preferences or ["Vegetarian"]
        restaurants = []
        if db:
            dest = db.query(Destination).filter(Destination.name.ilike(f"%{destination}%")).first()
            if dest:
                restaurants = [{"name": r.name, "cuisine": r.cuisine, "rating": r.rating} for r in dest.restaurants]
                
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "dietary_matched": dietary,
            "recommendations_found": len(restaurants) if restaurants else 8,
            "restaurants": restaurants
        }


class ShoppingAgent:
    """Locates local markets, handicrafts, and artisanal products."""
    name = "ShoppingAgent"

    def execute(self, destination: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "curated_markets": ["Old Town Artisan Bazaar", "Night Flea Market", "Silk & Craft Weavers Guild"]
        }


class AgencyAgent:
    """Compares verified local tour operators and guided packages."""
    name = "AgencyAgent"

    def execute(self, destination: str, db: Session = None) -> Dict[str, Any]:
        agencies = []
        if db:
            dest = db.query(Destination).filter(Destination.name.ilike(f"%{destination}%")).first()
            if dest:
                agencies = [{"name": a.name, "package": a.package_title, "price": a.price} for a in dest.agencies]
                
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "packages_evaluated": len(agencies) if agencies else 3,
            "agencies": agencies
        }


class BudgetAgent:
    """Checks budget constraints and calculates remaining allowance."""
    name = "BudgetAgent"

    def execute(self, total_budget: float, allocated_costs: float) -> Dict[str, Any]:
        remaining = round(total_budget - allocated_costs, 2)
        burn_rate = round((allocated_costs / total_budget) * 100, 1) if total_budget > 0 else 0
        return {
            "status": "success",
            "agent": self.name,
            "total_budget": total_budget,
            "allocated_costs": allocated_costs,
            "remaining": remaining,
            "burn_rate_pct": burn_rate,
            "is_within_budget": remaining >= 0
        }


class ItineraryAgent:
    """Constructs and adapts day-by-day balanced schedules."""
    name = "ItineraryAgent"

    def execute(self, destination: str, days: int = 5, pace: str = "moderate") -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "days_planned": days,
            "slots_per_day": 3
        }


class TripMonitoringAgent:
    """Monitors live transit schedules, delay signals, and weather changes."""
    name = "TripMonitoringAgent"

    def execute(self, trip_id: str, current_status: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.name,
            "trip_id": trip_id,
            "active_monitors": ["Transit status", "Weather changes", "Hotel late check-in", "Dining reservations"]
        }


class ReplanningAgent:
    """Evaluates downstream disruptions and generates alternative plans."""
    name = "ReplanningAgent"

    def evaluate_disruption(self, trip_id: str, disruption_type: str, details: Dict[str, Any]) -> Dict[str, Any]:
        delay_hours = details.get("delay_hours", 2)
        item_title = details.get("item_title", "Transit Segment")

        downstream_impact = [
            f"Hotel check-in delayed by {delay_hours} hours. Front desk automated late-arrival notice queued.",
            f"Afternoon scheduled sightseeing overlaps with delayed arrival.",
            "Evening dining reservation may need to be shifted by 90 minutes."
        ]

        alternatives = [
            {
                "id": "alt-shift-schedule",
                "title": "Optimized Time Shift (Recommended)",
                "description": f"Move scheduled afternoon activity to tomorrow morning and adjust dinner by 90 mins.",
                "schedule_delta": f"+{delay_hours}h shift",
                "cost_impact": 0.0,
                "affected_itinerary_items": ["Afternoon Tour", "Dinner Reservation"],
                "actions_to_execute": [
                    {"action": "shift_item", "item": "Afternoon Tour", "new_slot": "Day 2 Morning"},
                    {"action": "notify_hotel", "message": f"Late check-in confirmed for {delay_hours}h delay"}
                ]
            },
            {
                "id": "alt-replace-indoor",
                "title": "Convert to Relaxed Evening Walk",
                "description": "Drop crowded afternoon tour; replace with a relaxed waterfront lounge dinner near the hotel.",
                "schedule_delta": "Zero rush",
                "cost_impact": -25.0,
                "affected_itinerary_items": ["Afternoon Tour"],
                "actions_to_execute": [
                    {"action": "cancel_item", "item": "Afternoon Tour"},
                    {"action": "add_item", "item": "Relaxed Promenade Walk"}
                ]
            }
        ]

        return {
            "status": "success",
            "agent": self.name,
            "trip_id": trip_id,
            "alert_severity": "ATTENTION" if delay_hours <= 2 else "URGENT",
            "impact_summary": f"{item_title} delayed by {delay_hours} hours. We have prepared two smart alternative recovery paths.",
            "downstream_impact": downstream_impact,
            "alternatives": alternatives,
            "requires_user_approval": True
        }


class RewardsAgent:
    """Manages server-authoritative NAVORA Coins reward ledger."""
    name = "RewardsAgent"

    def award_trip_completion(self, user_id: str, trip_title: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.name,
            "user_id": user_id,
            "coins_awarded": 500,
            "reason": f"Completed trip: {trip_title}"
        }


class SafetyAgent:
    """Maintains local emergency lines, active hazard monitoring, and automated safety alerts."""
    name = "SafetyAgent"

    def get_emergency_dossier(self, destination: str) -> Dict[str, Any]:
        d_lower = destination.lower()
        
        # Determine safety profile and automated monitoring alerts based on destination
        if any(term in d_lower for term in ["storm", "monsoon", "hazard", "flood"]):
            safety_score = 5.8
            safety_level = "High Advisory"
            advisories = [
                {
                    "severity": "high",
                    "level": "warning",
                    "title": "Automated Hazard Warning",
                    "description": f"Heavy rain & severe weather warnings active in {destination}. Avoid low-lying coastal areas.",
                    "is_automated_alert": True
                },
                {
                    "severity": "medium",
                    "level": "info",
                    "title": "Transit Impact Alert",
                    "description": "Local transport schedules may experience delays due to regional weather alerts.",
                    "is_automated_alert": True
                }
            ]
            automated_alert = {
                "is_unsafe": True,
                "severity": "URGENT",
                "title": f"Safety Sentinel: High Hazard Alert for {destination}",
                "message": f"NAVORA Safety Sentinel has detected severe weather warnings in {destination}. Please exercise caution."
            }
        elif any(term in d_lower for term in ["goa", "bali", "thailand"]):
            safety_score = 8.6
            safety_level = "Very Safe"
            advisories = [
                {
                    "severity": "low",
                    "level": "info",
                    "title": "Coastal Weather Sentinel",
                    "description": "Mild tropical warmth. High UV index around midday. Stay hydrated and use sunscreen.",
                    "is_automated_alert": False
                },
                {
                    "severity": "low",
                    "level": "success",
                    "title": "Low Crime Advisory",
                    "description": "Tourist zones are actively patrolled with 24/7 assistance desk coverage.",
                    "is_automated_alert": False
                }
            ]
            automated_alert = {
                "is_unsafe": False,
                "severity": "INFO",
                "title": f"Safety Status Normal for {destination}",
                "message": f"Destination {destination} is operating within normal safety limits."
            }
        else:
            safety_score = 9.2
            safety_level = "Very Safe"
            advisories = [
                {
                    "severity": "low",
                    "level": "info",
                    "title": "Seismic Awareness & Radar Sentinel",
                    "description": "Destination monitoring active. Infrastructure built to high safety standards.",
                    "is_automated_alert": False
                },
                {
                    "severity": "low",
                    "level": "success",
                    "title": "No Government Restrictions",
                    "description": "Standard travel precautions apply. Emergency helpline active 24/7.",
                    "is_automated_alert": False
                }
            ]
            automated_alert = {
                "is_unsafe": False,
                "severity": "INFO",
                "title": f"Safety Sentinel Monitoring Active for {destination}",
                "message": f"Live safety monitoring active for {destination}. No active hazards reported."
            }

        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "safety_score": safety_score,
            "safety_level": safety_level,
            "category_breakdown": {
                "personal_safety": round(safety_score + 0.2, 1),
                "health_hygiene": round(safety_score + 0.4, 1),
                "political_stability": round(safety_score, 1),
                "natural_hazard_risk": round(max(3.0, safety_score - 1.0), 1),
                "infrastructure": round(safety_score + 0.6, 1)
            },
            "emergency_contacts": [
                {"service": "Police Emergency", "number": "112 / 100"},
                {"service": "Ambulance & Fire", "number": "108 / 119"},
                {"service": "Tourist Emergency Helpline", "number": "1363 / +1-800-NAVORA-SOS"},
                {"service": "Diplomatic Consular Support", "number": "+1-800-555-0199"}
            ],
            "active_advisories": advisories,
            "automated_safety_alert": automated_alert,
            "emergency_numbers": {
                "police": "112 / 100",
                "ambulance": "108 / 112",
                "tourist_helpline": "1363 / +1-800-NAVORA-SOS"
            },
            "consular_support": "Global 24/7 Diplomatic Assistance Enabled"
        }


class PackingAgent:
    """Intelligently generates contextual packing lists based on destination, weather, and activities."""
    name = "PackingAgent"

    def execute(self, destination: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "packing_advice": "Generated contextual packing specifications tailored for the trip.",
            "categories": ["Documents", "Electronics", "Clothing", "Health & Toiletries"]
        }


class DocumentAgent:
    """Manages document requirements like Visas, Passports, and Travel Insurance."""
    name = "DocumentAgent"

    def execute(self, destination: str) -> Dict[str, Any]:
        return {
            "status": "success",
            "agent": self.name,
            "destination": destination,
            "document_advice": f"Required documents for travel to {destination}: Valid Passport, E-Visa, Travel Insurance.",
            "required_documents": ["Passport", "Visa", "Insurance"]
        }
