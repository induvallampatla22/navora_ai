from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.compare_service import compare_service
from app.schemas.compare import CompareMatrixOut

router = APIRouter(prefix="/api/compare", tags=["Central Compare All"])


@router.get("", response_model=CompareMatrixOut)
def get_comparison_matrix(
    destination: str = Query(..., description="Target destination (e.g. Goa, Kashmir, Tokyo, Paris)"),
    tab: str = Query("All", description="Active tab: All, Transport, Stays, Activities, Restaurants, Agencies"),
    origin: str = Query("New York, USA", description="Starting departure point"),
    exclude_flights: bool = Query(False, description="Exclude flights if requested by user ('I don't want flights')"),
    db: Session = Depends(get_db)
):
    excluded = ["Flight"] if exclude_flights else []
    return compare_service.get_comparison_matrix(
        db=db,
        destination_name=destination,
        category_tab=tab,
        origin=origin,
        excluded_modes=excluded
    )
