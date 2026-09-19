from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.trip import Trip, TripMember
from app.schemas.trip import TripMemberOut

router = APIRouter(prefix="/api/groups", tags=["Group Trips & Collaboration"])


@router.get("/{trip_id}/members", response_model=List[TripMemberOut])
def get_trip_members(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    members = db.query(TripMember).filter(TripMember.trip_id == trip_id).all()
    return [TripMemberOut.from_orm(m) for m in members]


@router.post("/{trip_id}/invite")
def generate_invite_link(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    invite_url = f"/trips/join?code={trip.invite_code}"
    return {
        "invite_code": trip.invite_code,
        "invite_url": invite_url,
        "message": "Share this link with friends and family to coordinate group budgets and preferences."
    }


@router.post("/join")
def join_trip_by_code(
    code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.invite_code == code.strip().upper()).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code.")

    existing = db.query(TripMember).filter(TripMember.trip_id == trip.id, TripMember.user_id == current_user.id).first()
    if existing:
        return {"status": "already_member", "trip_id": trip.id, "title": trip.title}

    member = TripMember(
        trip_id=trip.id,
        user_id=current_user.id,
        role="member",
        status="accepted"
    )
    db.add(member)
    db.commit()
    return {"status": "success", "trip_id": trip.id, "title": trip.title}


@router.post("/{trip_id}/location-consent")
def toggle_location_sharing(
    trip_id: str,
    consent: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    member = db.query(TripMember).filter(TripMember.trip_id == trip_id, TripMember.user_id == current_user.id).first()
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not a member of this trip.")

    member.location_sharing_consent = consent
    db.commit()
    return {
        "status": "success",
        "location_sharing_enabled": consent,
        "message": "Location sharing requires explicit consent and is only visible to confirmed trip members."
    }
