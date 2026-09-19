from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.trip import Trip, Itinerary, ItineraryItem
from app.models.intelligence import TripAlert
from app.models.commerce import Booking, Expense
from app.providers.weather_provider import weather_provider

router = APIRouter(prefix="/api/monitor", tags=["Trip Monitor"])


@router.get("/{trip_id}")
def get_trip_monitor_telemetry(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    # Active itinerary
    itinerary = db.query(Itinerary).filter(Itinerary.trip_id == trip.id, Itinerary.is_active == True).first()
    items = itinerary.items if itinerary else []

    # Current weather
    weather = weather_provider.get_weather(trip.primary_destination)

    # Alerts
    alerts = db.query(TripAlert).filter(TripAlert.trip_id == trip.id, TripAlert.is_resolved == False).all()

    # Budget burn calculation
    total_expenses = sum(float(e.amount) for e in trip.expenses)
    remaining_budget = max(0.0, trip.total_budget - total_expenses)

    # Next upcoming activity
    scheduled_items = [i for i in items if i.status == "Scheduled"]
    next_activity = scheduled_items[0] if scheduled_items else (items[0] if items else None)

    # Confirmed bookings count
    confirmed_bookings = db.query(Booking).filter(Booking.trip_id == trip.id, Booking.status == "Confirmed").all()

    return {
        "trip_id": trip.id,
        "title": trip.title,
        "status": trip.status,
        "destination": trip.primary_destination,
        "weather": weather,
        "today_itinerary": [
            {
                "id": it.id,
                "slot": it.time_slot,
                "title": it.title,
                "location": it.location_name,
                "time": it.start_time,
                "status": it.status,
                "transport": it.transport_mode
            }
            for it in items[:3]
        ],
        "next_event": {
            "title": next_activity.title if next_activity else "No upcoming events",
            "time": next_activity.start_time if next_activity else "N/A",
            "location": next_activity.location_name if next_activity else "N/A",
            "status": next_activity.status if next_activity else "Completed"
        },
        "financial_summary": {
            "total_budget": trip.total_budget,
            "total_spent": total_expenses,
            "remaining_budget": remaining_budget,
            "burn_rate_pct": round((total_expenses / trip.total_budget) * 100, 1) if trip.total_budget > 0 else 0
        },
        "bookings_summary": {
            "confirmed_count": len(confirmed_bookings),
            "recent": [b.title for b in confirmed_bookings[:2]]
        },
        "alerts": [
            {
                "id": a.id,
                "severity": a.severity,
                "title": a.title,
                "message": a.message,
                "impact": a.downstream_impact
            }
            for a in alerts
        ]
    }
