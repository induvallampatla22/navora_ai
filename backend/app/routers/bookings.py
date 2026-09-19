import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.commerce import Booking
from app.models.trip import Trip
from app.models.reward import CoinWallet, CoinTransaction
from app.models.community import Notification
from app.schemas.commerce import BookingCreate, BookingOut

router = APIRouter(prefix="/api/bookings", tags=["Bookings Center"])


@router.post("", response_model=BookingOut)
def create_booking(
    req: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Resolve or auto-create trip if trip_id is missing or doesn't exist
    trip = None
    if req.trip_id:
        trip = db.query(Trip).filter(Trip.id == req.trip_id).first()

    if not trip:
        # Fallback to user's most recent trip
        trip = db.query(Trip).filter(Trip.creator_id == current_user.id).order_by(Trip.created_at.desc()).first()

    if not trip:
        # Auto-provision a default reservation container trip
        now = datetime.datetime.utcnow()
        dest_name = req.details.get("destination") or "Worldwide Journey"
        trip = Trip(
            creator_id=current_user.id,
            title="Personal Travel Reservations",
            primary_destination=dest_name,
            destinations=[dest_name],
            start_date=req.start_time or now,
            end_date=req.end_time or (now + datetime.timedelta(days=7)),
            status="Planning",
            currency=req.currency or "USD"
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)

    # Check for duplicate active booking
    if req.start_time:
        duplicate = db.query(Booking).filter(
            Booking.user_id == current_user.id,
            Booking.booking_type == req.booking_type,
            Booking.title == req.title,
            Booking.start_time == req.start_time,
            Booking.status != "Cancelled"
        ).first()
        if duplicate:
            return BookingOut.from_orm(duplicate)

    booking = Booking(
        trip_id=trip.id,
        user_id=current_user.id,
        booking_type=req.booking_type.lower(),
        title=req.title,
        provider_name=req.provider_name,
        total_amount=req.total_amount,
        currency=req.currency or "USD",
        start_time=req.start_time,
        end_time=req.end_time,
        details=req.details or {},
        status="Confirmed",  # Confirmed in Sandbox / Demo Mode
        is_demo_data=True
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Trigger user notification
    try:
        notif = Notification(
            user_id=current_user.id,
            trip_id=trip.id,
            title=f"Booking Confirmed: {booking.title}",
            message=f"Reservation {booking.reference_code} via {booking.provider_name} has been confirmed. Total: {booking.currency} {booking.total_amount:,.2f}",
            severity="INFO",
            notification_type="booking"
        )
        db.add(notif)
    except Exception:
        pass

    # Award NAVORA Coins for eligible booking
    try:
        wallet = db.query(CoinWallet).filter(CoinWallet.user_id == current_user.id).first()
        if wallet:
            coin_reward = 100
            wallet.balance += coin_reward
            wallet.lifetime_earned += coin_reward
            tx = CoinTransaction(
                wallet_id=wallet.id,
                amount=coin_reward,
                transaction_type="earned",
                reason=f"Eligible booking reservation: {booking.reference_code}"
            )
            db.add(tx)
    except Exception:
        pass

    db.commit()
    db.refresh(booking)
    return BookingOut.from_orm(booking)


@router.get("", response_model=List[BookingOut])
def list_bookings(
    trip_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Booking).filter(Booking.user_id == current_user.id)
    if trip_id:
        query = query.filter(Booking.trip_id == trip_id)
    bookings = query.order_by(Booking.created_at.desc()).all()
    return [BookingOut.from_orm(b) for b in bookings]


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")
    return BookingOut.from_orm(booking)


@router.api_route("/{booking_id}/cancel", methods=["POST", "PATCH"])
def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found.")

    booking.status = "Cancelled"

    # Add cancellation alert
    try:
        notif = Notification(
            user_id=current_user.id,
            trip_id=booking.trip_id,
            title=f"Reservation Cancelled: {booking.title}",
            message=f"Booking {booking.reference_code} was cancelled. Refund/credit applied per policy.",
            severity="ATTENTION",
            notification_type="booking_cancelled"
        )
        db.add(notif)
    except Exception:
        pass

    db.commit()
    return {
        "status": "success",
        "message": "Booking cancelled successfully.",
        "booking_id": booking.id,
        "booking_status": "Cancelled"
    }
