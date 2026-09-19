from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.trip import Trip, TripMember, Itinerary
from app.services.trip_service import trip_service
from app.schemas.trip import TripCreate, TripOut, ItineraryOut

router = APIRouter(prefix="/api/trips", tags=["Trips"])


@router.post("", response_model=TripOut)
def create_trip(
    req: TripCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = trip_service.create_trip(db, current_user.id, req)
    return TripOut.from_orm(trip)


@router.get("", response_model=List[TripOut])
def list_user_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve trips where user is creator or member
    user_memberships = db.query(TripMember).filter(TripMember.user_id == current_user.id).all()
    trip_ids = [m.trip_id for m in user_memberships]
    trips = db.query(Trip).filter(Trip.id.in_(trip_ids)).order_by(Trip.created_at.desc()).all()
    return [TripOut.from_orm(t) for t in trips]


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")
    return TripOut.from_orm(trip)


@router.get("/{trip_id}/itinerary", response_model=ItineraryOut)
def get_trip_itinerary(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.trip_id == trip_id, Itinerary.is_active == True).first()
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active itinerary found for this trip. Please generate an AI plan first.")
    return ItineraryOut.from_orm(itinerary)


@router.post("/{trip_id}/complete")
def complete_trip(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return trip_service.complete_trip(db, trip_id, current_user.id)
