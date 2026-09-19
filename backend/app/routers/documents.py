from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.models.intelligence import Document

router = APIRouter(prefix="/api/documents", tags=["Document Vault"])


class DocumentCreate(BaseModel):
    title: str
    doc_type: str = "ticket"  # ticket, voucher, id, insurance, receipt
    file_path: str = "/vault/sample.pdf"
    trip_id: Optional[str] = None
    booking_id: Optional[str] = None
    file_size_kb: int = 150


class DocumentOut(BaseModel):
    id: str
    title: str
    doc_type: str
    file_path: str
    file_size_kb: int
    is_encrypted: bool
    trip_id: Optional[str] = None
    booking_id: Optional[str] = None

    class Config:
        from_attributes = True


@router.get("", response_model=List[DocumentOut])
def list_documents(
    trip_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Document).filter(Document.user_id == current_user.id)
    if trip_id:
        query = query.filter(Document.trip_id == trip_id)
    docs = query.order_by(Document.created_at.desc()).all()

    # Seed default sample documents if user has none
    if not docs:
        defaults = [
            ("Passport (Encrypted Vault)", "id", "/vault/passport_demo.pdf", 240, True),
            ("Japan Tourist eVisa", "id", "/vault/evisa_tokyo.pdf", 180, True),
            ("World Travel Medical Insurance", "insurance", "/vault/insurance_policy.pdf", 450, True),
            ("Grand Hyatt Tokyo — Booking Voucher", "voucher", "/vault/hotel_voucher_hyatt.pdf", 120, True),
        ]
        for t, dt, fp, sz, enc in defaults:
            d = Document(
                user_id=current_user.id,
                title=t,
                doc_type=dt,
                file_path=fp,
                file_size_kb=sz,
                is_encrypted=enc,
                trip_id=trip_id
            )
            db.add(d)
        db.commit()
        docs = db.query(Document).filter(Document.user_id == current_user.id).all()

    return [DocumentOut.from_orm(d) for d in docs]


@router.post("", response_model=DocumentOut)
def upload_document(
    req: DocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = Document(
        user_id=current_user.id,
        trip_id=req.trip_id,
        booking_id=req.booking_id,
        title=req.title,
        doc_type=req.doc_type,
        file_path=req.file_path,
        file_size_kb=req.file_size_kb,
        is_encrypted=True
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return DocumentOut.from_orm(doc)


@router.delete("/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    db.delete(doc)
    db.commit()
    return {"status": "success", "message": "Document removed from vault."}
