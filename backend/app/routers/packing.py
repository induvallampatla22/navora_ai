from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.trip import Trip
from app.models.intelligence import PackingItem

router = APIRouter(prefix="/api/packing", tags=["Smart Packing"])


class AddPackingItemRequest(BaseModel):
    item_name: str
    category: str = "Clothing"
    is_essential: bool = False
    assigned_to_user_id: Optional[str] = None


class TogglePackingItemRequest(BaseModel):
    item_id: str


@router.get("/{trip_id}")
def get_trip_packing_list(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    items = db.query(PackingItem).filter(PackingItem.trip_id == trip_id).all()

    # Seed default smart packing items if empty
    if not items:
        defaults = [
            ("Light jacket & breathable layers", "Clothing", True),
            ("Comfortable walking shoes", "Clothing", True),
            ("Rain layer / compact umbrella", "Weather Gear", True),
            ("Sunscreen SPF 50 & sunglasses", "Weather Gear", False),
            ("Universal power adapter", "Electronics", True),
            ("Portable power bank (20000mAh)", "Electronics", True),
            ("Prescription medications & mini first aid", "Health & Toiletries", True),
            ("Passports, booking vouchers & insurance", "Documents", True),
        ]
        for name, cat, ess in defaults:
            p = PackingItem(
                trip_id=trip.id,
                item_name=name,
                category=cat,
                is_essential=ess,
                is_packed=False
            )
            db.add(p)
        db.commit()
        items = db.query(PackingItem).filter(PackingItem.trip_id == trip_id).all()

    # Group by category
    cats: Dict[str, List[Dict[str, Any]]] = {}
    for it in items:
        cats.setdefault(it.category, []).append({
            "id": it.id,
            "text": it.item_name,
            "packed": it.is_packed,
            "essential": it.is_essential
        })

    categories_list = [{"name": c, "items": its} for c, its in cats.items()]
    total_count = len(items)
    packed_count = len([i for i in items if i.is_packed])
    progress = round((packed_count / total_count * 100), 1) if total_count > 0 else 0.0

    return {
        "trip_id": trip.id,
        "destination": trip.primary_destination,
        "total_items": total_count,
        "packed_items": packed_count,
        "progress_percentage": progress,
        "categories": categories_list
    }


@router.post("/{trip_id}/add")
def add_packing_item(
    trip_id: str,
    req: AddPackingItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

    item = PackingItem(
        trip_id=trip.id,
        item_name=req.item_name,
        category=req.category,
        is_essential=req.is_essential,
        assigned_to_user_id=req.assigned_to_user_id,
        is_packed=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return {
        "status": "success",
        "item": {
            "id": item.id,
            "text": item.item_name,
            "category": item.category,
            "packed": item.is_packed
        }
    }


@router.post("/{trip_id}/toggle")
def toggle_packing_item(
    trip_id: str,
    req: TogglePackingItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(PackingItem).filter(PackingItem.id == req.item_id, PackingItem.trip_id == trip_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Packing item not found.")

    item.is_packed = not item.is_packed
    db.commit()
    return {"status": "success", "item_id": item.id, "is_packed": item.is_packed}
