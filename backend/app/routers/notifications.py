from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.community import Notification

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


class NotificationOut(BaseModel):
    id: str
    type: str
    severity: str  # INFO, ATTENTION, URGENT
    title: str
    message: str
    action_url: Optional[str] = None
    is_read: bool
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[NotificationOut])
def list_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

    # Seed sample notifications if empty
    if not notifs:
        samples = [
            ("coin", "INFO", "Welcome Bonus Awarded", "+100 NAVORA Coins credited to your wallet for onboarding.", "/dashboard/coins"),
            ("weather", "ATTENTION", "Coastal Rain Alert in Goa", "Moderate showers forecasted for tomorrow afternoon. Indoor gallery alternatives ready.", "/dashboard/monitor"),
            ("booking", "INFO", "Flight & Hotel Reserved", "Your Tokyo journey confirmations are stored in your Document Vault.", "/dashboard/bookings"),
        ]
        for tp, sev, tit, msg, act in samples:
            n = Notification(
                user_id=current_user.id,
                type=tp,
                severity=sev,
                title=tit,
                message=msg,
                action_url=act,
                is_read=False
            )
            db.add(n)
        db.commit()
        notifs = db.query(Notification).filter(Notification.user_id == current_user.id).all()

    return [
        NotificationOut(
            id=n.id,
            type=n.type,
            severity=n.severity,
            title=n.title,
            message=n.message,
            action_url=n.action_url,
            is_read=n.is_read,
            created_at=n.created_at.isoformat() if n.created_at else None
        )
        for n in notifs
    ]


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    return {"status": "success", "id": notif.id, "is_read": True}


@router.post("/read-all")
def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read."}
