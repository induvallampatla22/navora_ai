from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AIChatRequest(BaseModel):
    query: str = Field(..., min_length=1)
    language: str = Field(default="en", description="en, te, hi, ta, kn, ml")
    trip_id: Optional[str] = None
    current_destination: Optional[str] = None
    user_location: Optional[Dict[str, float]] = None


class ToolCallRecord(BaseModel):
    agent: str
    tool: str
    input: Dict[str, Any]
    output: Dict[str, Any]


class AIChatResponse(BaseModel):
    response: str
    language: str
    detected_intent: str
    agents_involved: List[str]
    tool_calls: List[ToolCallRecord]
    structured_data: Optional[Dict[str, Any]] = None
    suggested_quick_actions: List[str] = []


class AIReplanningRequest(BaseModel):
    trip_id: str
    disruption_type: str = Field(..., description="delay, cancellation, weather, hotel_issue, budget_change")
    disruption_details: Dict[str, Any]  # e.g., {"delay_hours": 3, "item_title": "Flight 102"}


class ReplanningAlternative(BaseModel):
    id: str
    title: str
    description: str
    schedule_delta: str
    cost_impact: float
    affected_itinerary_items: List[str]
    actions_to_execute: List[Dict[str, Any]]


class AIReplanningProposal(BaseModel):
    proposal_id: str
    trip_id: str
    alert_severity: str
    impact_summary: str
    affected_items: List[str]
    alternatives: List[ReplanningAlternative]
    recommended_alternative_id: str
    requires_user_approval: bool = True


class ReplanningApprovalRequest(BaseModel):
    proposal_id: str
    trip_id: str
    selected_alternative_id: str
    approved: bool
