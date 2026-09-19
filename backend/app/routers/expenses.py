from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.commerce import Expense
from app.services.expense_service import expense_service
from app.schemas.commerce import ExpenseCreate, ExpenseOut, SettlementTransfer

router = APIRouter(prefix="/api/expenses", tags=["Group Expenses"])


@router.get("", response_model=List[ExpenseOut])
def list_all_expenses(
    trip_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta
    from app.models.trip import Trip
    
    query = db.query(Expense)
    if trip_id:
        query = query.filter(Expense.trip_id == trip_id)
    expenses = query.order_by(Expense.expense_date.desc()).all()
    
    # If no expenses exist yet, return sample seed expenses so ledger is active
    if not expenses:
        # Find or create a trip for the user to attach sample expenses
        sample_trip = None
        if trip_id:
            sample_trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not sample_trip:
            sample_trip = db.query(Trip).filter(Trip.creator_id == current_user.id).first()
        if not sample_trip:
            now = datetime.utcnow()
            sample_trip = Trip(
                creator_id=current_user.id,
                title="Grand Voyage to Kyoto",
                primary_destination="Kyoto, Japan",
                destinations=["Kyoto, Japan"],
                start_date=now,
                end_date=now + timedelta(days=7),
                total_budget=5000.0,
                currency="USD",
                status="Active"
            )
            db.add(sample_trip)
            db.commit()
            db.refresh(sample_trip)
        
        sample_data = [
            ("Villa Deposit (Higashiyama)", "Stay", 1200.0, "equal", sample_trip.id),
            ("Private Tea Ceremony & Boat Tour", "Activity", 450.0, "equal", sample_trip.id),
            ("Kaiseki Dinner at Kikunoi", "Dining", 600.0, "equal", sample_trip.id),
            ("Shinkansen Bullet Train Passes", "Transport", 320.0, "equal", sample_trip.id),
        ]
        for title, cat, amt, sm, tid in sample_data:
            e = Expense(
                trip_id=tid,
                paid_by_id=current_user.id,
                title=title,
                category=cat,
                amount=amt,
                currency="USD",
                split_method=sm
            )
            db.add(e)
        db.commit()
        expenses = db.query(Expense).filter(Expense.trip_id == sample_trip.id).all()
        
    return [ExpenseOut.from_orm(e) for e in expenses]


@router.post("", response_model=ExpenseOut)
def record_expense(
    req: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exp = expense_service.add_expense(db, current_user.id, req)
    return ExpenseOut.from_orm(exp)


@router.get("/{trip_id}", response_model=List[ExpenseOut])
def list_trip_expenses(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).order_by(Expense.expense_date.desc()).all()
    return [ExpenseOut.from_orm(e) for e in expenses]


@router.get("/{trip_id}/settlement", response_model=List[SettlementTransfer])
def get_smart_settlements(
    trip_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the mathematically minimal number of peer-to-peer transfers required
    to completely settle all group debts.
    """
    return expense_service.calculate_smart_settlements(db, trip_id)
