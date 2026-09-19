from collections import defaultdict
from typing import List, Dict, Any, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.commerce import Expense, ExpenseSplit
from app.models.trip import Trip, TripMember
from app.models.auth import User
from app.schemas.commerce import ExpenseCreate, SettlementTransfer


class ExpenseService:
    def add_expense(self, db: Session, user_id: str, req: ExpenseCreate) -> Expense:
        trip = db.query(Trip).filter(Trip.id == req.trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found.")

        expense = Expense(
            trip_id=req.trip_id,
            paid_by_id=user_id,
            title=req.title,
            category=req.category,
            amount=req.amount,
            currency=req.currency,
            split_method=req.split_method,
            receipt_url=req.receipt_url,
            notes=req.notes
        )
        db.add(expense)
        db.flush()

        # Handle split calculation
        members = db.query(TripMember).filter(TripMember.trip_id == req.trip_id).all()
        member_ids = [m.user_id for m in members] or [user_id]

        if req.split_method == "equal":
            share = round(req.amount / len(member_ids), 2)
            remainder = round(req.amount - (share * len(member_ids)), 2)

            for idx, m_id in enumerate(member_ids):
                # Apply any rounding penny to first user
                individual_share = share + (remainder if idx == 0 else 0.0)
                split = ExpenseSplit(
                    expense_id=expense.id,
                    user_id=m_id,
                    share_amount=individual_share,
                    percentage=round(100.0 / len(member_ids), 2),
                    is_settled=(m_id == user_id)
                )
                db.add(split)

        elif req.splits:
            for s in req.splits:
                split = ExpenseSplit(
                    expense_id=expense.id,
                    user_id=s.user_id,
                    share_amount=s.share_amount,
                    percentage=s.percentage,
                    is_settled=(s.user_id == user_id)
                )
                db.add(split)

        db.commit()
        db.refresh(expense)
        return expense

    def calculate_smart_settlements(self, db: Session, trip_id: str) -> List[SettlementTransfer]:
        """
        Smart Settlement Algorithm: Minimizes total transfers using net balance matching.
        Calculates net balance = (Total Paid by User) - (Total User's Share of All Expenses).
        Then matches the largest debtor with the largest creditor iteratively.
        """
        expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()
        net_balances: Dict[str, float] = defaultdict(float)

        for exp in expenses:
            # Payer gets positive balance credit
            net_balances[exp.paid_by_id] += float(exp.amount)
            # Debtors subtract their split share
            for sp in exp.splits:
                net_balances[sp.user_id] -= float(sp.share_amount)

        # Separate into debtors (<0) and creditors (>0)
        debtors: List[List[Any]] = []  # [[user_id, abs_amount]]
        creditors: List[List[Any]] = []  # [[user_id, amount]]

        for uid, bal in net_balances.items():
            rounded_bal = round(bal, 2)
            if rounded_bal < -0.01:
                debtors.append([uid, abs(rounded_bal)])
            elif rounded_bal > 0.01:
                creditors.append([uid, rounded_bal])

        # Greedily match maximum debtor with maximum creditor to minimize transactions
        settlement_transfers: List[SettlementTransfer] = []

        # Fetch names for clarity
        users_map = {u.id: u.full_name for u in db.query(User).filter(User.id.in_(list(net_balances.keys()))).all()}

        while debtors and creditors:
            debtors.sort(key=lambda x: x[1], reverse=True)
            creditors.sort(key=lambda x: x[1], reverse=True)

            debtor = debtors[0]
            creditor = creditors[0]

            transfer_amount = min(debtor[1], creditor[1])
            if transfer_amount > 0.01:
                settlement_transfers.append(SettlementTransfer(
                    from_user_id=debtor[0],
                    from_user_name=users_map.get(debtor[0], "Traveler"),
                    to_user_id=creditor[0],
                    to_user_name=users_map.get(creditor[0], "Traveler"),
                    amount=round(transfer_amount, 2),
                    currency="USD"
                ))

            debtor[1] -= transfer_amount
            creditor[1] -= transfer_amount

            if debtor[1] <= 0.01:
                debtors.pop(0)
            if creditor[1] <= 0.01:
                creditors.pop(0)

        return settlement_transfers


expense_service = ExpenseService()
