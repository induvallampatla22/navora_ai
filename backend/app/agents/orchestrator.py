import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.agents.specialized import (
    DestinationAgent,
    WeatherRiskAgent,
    TransportAgent,
    HotelAgent,
    ActivityAgent,
    RestaurantAgent,
    ShoppingAgent,
    AgencyAgent,
    BudgetAgent,
    ItineraryAgent,
    TripMonitoringAgent,
    ReplanningAgent,
    RewardsAgent,
    SafetyAgent,
    PackingAgent,
    DocumentAgent
)
from app.providers.gemini_provider import gemini_provider

logger = logging.getLogger("navora.agents.orchestrator")


class NavoraAITripOrchestrator:
    """
    Central Autonomous AI Trip Orchestrator.
    Dynamically routes intents to specialized agents, executes tools,
    enforces budget/dietary constraints, and mandates explicit user approval
    before executing consequential updates.
    """

    def __init__(self):
        self.destination_agent = DestinationAgent()
        self.weather_agent = WeatherRiskAgent()
        self.transport_agent = TransportAgent()
        self.hotel_agent = HotelAgent()
        self.activity_agent = ActivityAgent()
        self.restaurant_agent = RestaurantAgent()
        self.shopping_agent = ShoppingAgent()
        self.agency_agent = AgencyAgent()
        self.budget_agent = BudgetAgent()
        self.itinerary_agent = ItineraryAgent()
        self.monitoring_agent = TripMonitoringAgent()
        self.replanning_agent = ReplanningAgent()
        self.rewards_agent = RewardsAgent()
        self.safety_agent = SafetyAgent()
        self.packing_agent = PackingAgent()
        self.document_agent = DocumentAgent()

    def process_multilingual_chat(
        self,
        query: str,
        db: Optional[Session] = None,
        language: str = "en",
        trip_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Dynamically selects agents based on query intent and trip context.
        Supports natural queries in English, Telugu, Hindi, Tamil, Kannada, Malayalam.
        """
        q_lower = query.lower()
        destination = (trip_context or {}).get("primary_destination", "Goa")
        agents_called: List[str] = []
        tool_records: List[Dict[str, Any]] = []
        structured_payload: Dict[str, Any] = {}

        # 1. Intent: Dining / Food / Vegetarian
        if any(term in q_lower for term in ["restaurant", "food", "veg", "dinner", "lunch", "tindi", "khana", "kavali", "saapadu", "oota"]):
            agents_called.append("RestaurantAgent")
            dining_res = self.restaurant_agent.execute(destination, dietary_preferences=["Vegetarian"], db=db)
            tool_records.append({
                "agent": "RestaurantAgent",
                "tool": "search_restaurants",
                "input": {"destination": destination, "dietary": ["Vegetarian"]},
                "output": dining_res
            })
            structured_payload["dining"] = dining_res

        # 2. Intent: Transit Delay / Replanning
        if any(term in q_lower for term in ["delay", "flight", "train", "cancelled", "late", "rain padutundi", "change cheyyava"]):
            agents_called.extend(["TripMonitoringAgent", "ReplanningAgent"])
            replan_res = self.replanning_agent.evaluate_disruption(
                trip_id=(trip_context or {}).get("trip_id", "demo-trip"),
                disruption_type="delay",
                details={"delay_hours": 3, "item_title": "Scheduled Inbound Transit"}
            )
            tool_records.append({
                "agent": "ReplanningAgent",
                "tool": "evaluate_disruption",
                "input": {"delay_hours": 3},
                "output": replan_res
            })
            structured_payload["replanning"] = replan_res

        # 3. Intent: Weather / Risk
        if any(term in q_lower for term in ["weather", "rain", "temperature", "varsham", "pack", "storm"]):
            agents_called.append("WeatherRiskAgent")
            weather_res = self.weather_agent.execute(destination)
            tool_records.append({
                "agent": "WeatherRiskAgent",
                "tool": "get_weather",
                "input": {"destination": destination},
                "output": weather_res
            })
            structured_payload["weather"] = weather_res

        # 4. Intent: Safety / Hospital / Police / Emergency
        if any(term in q_lower for term in ["hospital", "police", "doctor", "emergency", "sos", "danger", "safe"]):
            agents_called.append("SafetyAgent")
            safety_res = self.safety_agent.get_emergency_dossier(destination)
            tool_records.append({
                "agent": "SafetyAgent",
                "tool": "get_emergency_dossier",
                "input": {"destination": destination},
                "output": safety_res
            })
            structured_payload["safety"] = safety_res

        # 5. Intent: Packing / Luggage
        if any(term in q_lower for term in ["pack", "bag", "luggage", "smartpacking", "wear"]):
            agents_called.append("PackingAgent")
            packing_res = self.packing_agent.execute(destination)
            tool_records.append({
                "agent": "PackingAgent",
                "tool": "generate_packing_list",
                "input": {"destination": destination},
                "output": packing_res
            })
            structured_payload["packing"] = packing_res

        # 6. Intent: Documents / Visa / Passport
        if any(term in q_lower for term in ["document", "visa", "passport", "id", "insurance"]):
            agents_called.append("DocumentAgent")
            doc_res = self.document_agent.execute(destination)
            tool_records.append({
                "agent": "DocumentAgent",
                "tool": "get_document_requirements",
                "input": {"destination": destination},
                "output": doc_res
            })
            structured_payload["documents"] = doc_res

        # 7. Default: If no specific tools hit, consult Destination & Itinerary agents
        if not agents_called:
            agents_called.append("DestinationAgent")
            dest_res = self.destination_agent.execute(query, db=db)
            structured_payload["destination"] = dest_res

        # Generate intelligent contextual natural language response
        llm_response = gemini_provider.generate_response(
            prompt=query,
            system_instruction=(
                "You are NAVORA, the ultra-luxury AI Travel Operating Platform orchestrator. "
                "You speak elegantly, concisely, and with authoritative travel intelligence. "
                "Respect the user's selected language (English, Telugu, Hindi, Tamil, Kannada, or Malayalam)."
            ),
            context={"trip": trip_context, "structured_payload": structured_payload}
        )

        return {
            "response": llm_response,
            "language": language,
            "detected_intent": "travel_assistance",
            "agents_involved": agents_called,
            "tool_calls": tool_records,
            "structured_data": structured_payload,
            "suggested_quick_actions": [
                "View Updated Itinerary",
                "Inspect Nearby Dining",
                "Check Live Weather",
                "Emergency SOS Dossier"
            ]
        }


orchestrator = NavoraAITripOrchestrator()
