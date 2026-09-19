from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user, get_optional_current_user
from app.models.auth import User
from app.models.catalog import Destination, SavedPlace
from app.schemas.catalog import DestinationSummary, DestinationDetail, SavedPlaceCreate, SavedPlaceOut

router = APIRouter(prefix="/api/destinations", tags=["Destinations"])


@router.get("", response_model=List[DestinationSummary])
def list_destinations(
    category: Optional[str] = Query(None, description="Category filter (e.g. Beaches, Luxury, Mountains, India, International)"),
    search: Optional[str] = Query(None, description="Search keyword in name, country, or description"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Destination)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Destination.name.ilike(search_pattern)) |
            (Destination.country.ilike(search_pattern)) |
            (Destination.editorial_description.ilike(search_pattern))
        )

    destinations = query.offset(offset).limit(limit).all()

    # Category filter in Python if JSON array
    if category and category.lower() != "all":
        cat_lower = category.lower().strip()
        if cat_lower == "india":
            destinations = [d for d in destinations if (d.country or "").lower() == "india"]
        elif cat_lower == "international":
            destinations = [d for d in destinations if (d.country or "").lower() != "india"]
        else:
            destinations = [
                d for d in destinations
                if any(cat_lower in str(c).lower() for c in (d.categories or []))
                or cat_lower in (d.region or "").lower()
                or cat_lower in (d.editorial_description or "").lower()
            ]

    return [DestinationSummary.from_orm(d) for d in destinations]



@router.get("/{slug_or_id}", response_model=DestinationDetail)
def get_destination_details(slug_or_id: str, db: Session = Depends(get_db)):
    dest = db.query(Destination).filter(
        (Destination.id == slug_or_id) | (Destination.slug == slug_or_id)
    ).first()

    if not dest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found.")

    return DestinationDetail.from_orm(dest)


@router.post("/saved-places", response_model=SavedPlaceOut)
def save_place(
    req: SavedPlaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    place = SavedPlace(
        user_id=current_user.id,
        destination_name=req.destination_name,
        place_name=req.place_name,
        category=req.category,
        notes=req.notes,
        address=req.address,
        latitude=req.latitude,
        longitude=req.longitude
    )
    db.add(place)
    db.commit()
    db.refresh(place)
    return SavedPlaceOut.from_orm(place)


@router.get("/saved-places/list", response_model=List[SavedPlaceOut])
def get_user_saved_places(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    places = db.query(SavedPlace).filter(SavedPlace.user_id == current_user.id).all()
    return [SavedPlaceOut.from_orm(p) for p in places]
