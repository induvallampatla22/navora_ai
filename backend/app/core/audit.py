import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.auth import AuditLog

logger = logging.getLogger("navora.audit")


def log_audit_event(
    db: Session,
    action: str,
    user_id: Optional[str] = None,
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    status: str = "success"
) -> AuditLog:
    try:
        # Sanitize sensitive fields from details
        safe_details = {}
        if details:
            for k, v in details.items():
                if any(secret_term in k.lower() for secret_term in ["password", "otp", "token", "secret", "cvv", "card"]):
                    safe_details[k] = "[REDACTED]"
                else:
                    safe_details[k] = v

        entry = AuditLog(
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            details=safe_details,
            ip_address=ip_address,
            status=status
        )
        db.add(entry)
        db.commit()
        return entry
    except Exception as e:
        logger.error(f"Failed to record audit log: {e}")
        db.rollback()
