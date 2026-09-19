from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.services.trip_service import trip_service
from app.schemas.trip import AIPlanABCResponse, ItineraryOut

router = APIRouter(prefix="/api/planning", tags=["Trip Planning"])


@router.post("/{trip_id}/generate-plans", response_model=AIPlanABCResponse)
def generate_ai_plans(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return trip_service.generate_ai_plans(db, trip_id)


@router.post("/{trip_id}/select-plan", response_model=ItineraryOut)
def select_and_activate_plan(
    trip_id: str,
    plan_tier: str,  # "Plan A", "Plan B", "Plan C"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return trip_service.select_and_build_itinerary(db, trip_id, plan_tier)
