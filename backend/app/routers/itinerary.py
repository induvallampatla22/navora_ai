from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.trip import Itinerary, ItineraryItem
from app.schemas.trip import ItineraryItemOut

router = APIRouter(prefix="/api/itinerary", tags=["Itinerary Management"])


@router.post("/{itinerary_id}/items", response_model=ItineraryItemOut)
def add_itinerary_item(
    itinerary_id: str,
    title: str,
    location_name: str,
    day_number: int,
    time_slot: str = "Morning",
    cost: float = 0.0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Itinerary not found.")

    max_order = db.query(ItineraryItem).filter(ItineraryItem.itinerary_id == itinerary_id).count()

    item = ItineraryItem(
        itinerary_id=itinerary.id,
        day_number=day_number,
        time_slot=time_slot,
        item_type="activity",
        title=title,
        location_name=location_name,
        cost=cost,
        order_index=max_order + 1
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return ItineraryItemOut.from_orm(item)


@router.patch("/items/{item_id}/status")
def update_item_status(
    item_id: str,
    new_status: str,  # Scheduled, Completed, Delayed, Cancelled
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    item.status = new_status
    db.commit()
    return {"status": "success", "item_id": item.id, "new_status": new_status}


@router.delete("/items/{item_id}")
def delete_itinerary_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(ItineraryItem).filter(ItineraryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Itinerary item removed."}
