from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.services.replanning_service import replanning_service
from app.schemas.ai import AIReplanningRequest, AIReplanningProposal, ReplanningApprovalRequest

router = APIRouter(prefix="/api/replanning", tags=["AI Replanning Engine"])


@router.post("/trigger", response_model=AIReplanningProposal)
def trigger_replanning(
    req: AIReplanningRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Signature NAVORA Feature: Analyzes downstream disruption impacts (e.g. flight delayed by 3 hours),
    evaluates hotel check-in, city tours, and dinner reservations, and prepares concrete alternatives.
    """
    return replanning_service.trigger_disruption_analysis(
        db=db,
        trip_id=req.trip_id,
        disruption_type=req.disruption_type,
        details=req.disruption_details
    )


@router.post("/approve")
def approve_replanning_proposal(
    req: ReplanningApprovalRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enforces user approval workflow before applying consequential changes to active itineraries.
    """
    return replanning_service.process_approval(
        db=db,
        user_id=current_user.id,
        req=req
    )
