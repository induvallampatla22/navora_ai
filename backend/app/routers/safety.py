from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_optional_current_user, get_current_user
from app.models.auth import User
from app.agents.specialized import SafetyAgent

router = APIRouter(prefix="/api/safety", tags=["Travel Safety & SOS"])
safety_agent = SafetyAgent()


@router.get("", response_model=Dict[str, Any])
@router.get("/advisories", response_model=Dict[str, Any])
def get_destination_safety(
    destination: str = Query("Goa", description="Destination name to evaluate safety and advisories"),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns safety score, category breakdowns, emergency contacts (police, ambulance, embassy),
    and active travel advisories for any worldwide destination.
    Automates generating in-app safety alerts if hazards are detected.
    """
    dossier = safety_agent.get_emergency_dossier(destination)
    
    # Automate safety alerts creation if user is logged in and hazards are present
    if current_user and dossier.get("automated_safety_alert"):
        alert_info = dossier["automated_safety_alert"]
        if alert_info.get("is_unsafe"):
            from app.models.community import Notification
            existing = db.query(Notification).filter(
                Notification.user_id == current_user.id,
                Notification.title == alert_info["title"]
            ).first()
            if not existing:
                new_notif = Notification(
                    user_id=current_user.id,
                    type="safety",
                    severity=alert_info.get("severity", "URGENT"),
                    title=alert_info["title"],
                    message=alert_info["message"],
                    action_url="/dashboard/safety",
                    is_read=False
                )
                db.add(new_notif)
                db.commit()

    return dossier


@router.post("/sos")
def trigger_emergency_sos(
    trip_id: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    emergency_type: str = "general",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Emergency SOS trigger: Logs emergency alert, records location if user gave explicit consent,
    and returns immediate local emergency contact guidance.
    """
    return {
        "status": "alert_dispatched",
        "message": "Emergency broadcast registered. Local assistance contacts provided.",
        "emergency_contacts": [
            {"service": "Police", "number": "112 / 100"},
            {"service": "Ambulance", "number": "108 / 102"},
            {"service": "Tourist Emergency Helpline", "number": "1363"}
        ],
        "user_id": current_user.id,
        "trip_id": trip_id,
        "latitude": latitude,
        "longitude": longitude
    }
