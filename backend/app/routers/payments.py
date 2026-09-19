from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.commerce import Payment, Booking
from app.schemas.commerce import PaymentCreateOrder, PaymentOrderResponse, PaymentVerifyRequest, PaymentOut
from app.providers.razorpay_provider import razorpay_provider

router = APIRouter(prefix="/api/payments", tags=["Payments Center"])


@router.post("/create-order", response_model=PaymentOrderResponse)
def create_payment_order(
    req: PaymentCreateOrder,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Resolve trip_id
    trip_id = req.trip_id
    if not trip_id and req.booking_id:
        b = db.query(Booking).filter(Booking.id == req.booking_id).first()
        if b:
            trip_id = b.trip_id

    if not trip_id:
        from app.models.trip import Trip
        t = db.query(Trip).filter(Trip.creator_id == current_user.id).order_by(Trip.created_at.desc()).first()
        trip_id = t.id if t else "default-trip"

    receipt_id = req.receipt or f"rcpt_{trip_id[:8]}"
    order_data = razorpay_provider.create_order(
        amount=req.amount,
        currency=req.currency,
        receipt=receipt_id,
        notes={"user_id": current_user.id, "trip_id": trip_id}
    )

    # Record pending payment
    payment = Payment(
        booking_id=req.booking_id,
        trip_id=trip_id,
        user_id=current_user.id,
        provider=order_data["provider"],
        order_id=order_data["order_id"],
        amount=req.amount,
        currency=req.currency,
        status="created",
        receipt=receipt_id
    )
    db.add(payment)
    db.commit()

    return PaymentOrderResponse(**order_data)


@router.post("/verify", response_model=PaymentOut)
def verify_payment_signature(
    req: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(Payment.order_id == req.order_id).first()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment order not found.")

    is_valid = razorpay_provider.verify_payment(req.order_id, req.payment_id, req.signature)
    if not is_valid:
        payment.status = "failed"
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment signature verification failed.")

    payment.payment_id = req.payment_id
    payment.signature = req.signature
    payment.status = "captured"
    payment.server_verified = True

    # If linked to a booking, mark booking confirmed
    if payment.booking_id:
        booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
        if booking:
            booking.status = "Confirmed"

    db.commit()
    db.refresh(payment)
    return PaymentOut.from_orm(payment)


@router.get("/{payment_id}/status", response_model=PaymentOut)
def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        (Payment.id == payment_id) | (Payment.payment_id == payment_id) | (Payment.order_id == payment_id)
    ).first()

    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    return PaymentOut.from_orm(payment)


@router.get("/status", response_model=PaymentOut)
def get_payment_status_query(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        (Payment.id == payment_id) | (Payment.payment_id == payment_id) | (Payment.order_id == payment_id)
    ).first()

    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    return PaymentOut.from_orm(payment)


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    is_valid = razorpay_provider.verify_webhook_signature(body, signature)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature.")

    try:
        payload = await request.json()
        event = payload.get("event")
        payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")

        if order_id:
            payment = db.query(Payment).filter(Payment.order_id == order_id).first()
            if payment:
                if event == "payment.captured":
                    payment.status = "captured"
                    payment.server_verified = True
                    if payment.booking_id:
                        booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
                        if booking:
                            booking.status = "Confirmed"
                elif event == "payment.failed":
                    payment.status = "failed"
                db.commit()
    except Exception:
        pass

    return {"status": "success", "message": "Webhook processed"}


@router.post("/refund")
def refund_payment(
    payment_id: str,
    amount: Optional[float] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        (Payment.id == payment_id) | (Payment.payment_id == payment_id) | (Payment.order_id == payment_id)
    ).first()

    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found.")

    result = razorpay_provider.process_refund(payment.payment_id or payment.id, amount)
    payment.status = "refunded"
    db.commit()
    return result

