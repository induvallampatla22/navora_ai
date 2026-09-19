from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_optional_current_user
from app.models.auth import User
from app.models.trip import Trip, Itinerary
from app.agents.orchestrator import orchestrator
from app.schemas.ai import AIChatRequest, AIChatResponse

router = APIRouter(prefix="/api/ai", tags=["AI Orchestrator & Multilingual Assistant"])


@router.post("/chat", response_model=AIChatResponse)
def chat_with_assistant(
    req: AIChatRequest,
    current_user: User = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Multilingual AI Assistant supporting English, Telugu, Hindi, Tamil, Kannada, and Malayalam.
    Coordinates specialized agents and executes actual tools for dining, delays, weather, and safety.
    """
    trip_ctx = {
        "user_name": current_user.full_name if current_user else "Explorer",
        "primary_destination": req.current_destination or "Goa",
        "trip_id": req.trip_id
    }

    if req.trip_id:
        trip = db.query(Trip).filter(Trip.id == req.trip_id).first()
        if trip:
            trip_ctx["primary_destination"] = trip.primary_destination
            trip_ctx["budget"] = trip.total_budget
            itinerary = db.query(Itinerary).filter(Itinerary.trip_id == trip.id, Itinerary.is_active == True).first()
            if itinerary:
                trip_ctx["active_items_count"] = len(itinerary.items)

    result = orchestrator.process_multilingual_chat(
        query=req.query,
        db=db,
        language=req.language,
        trip_context=trip_ctx
    )

    return AIChatResponse(**result)
