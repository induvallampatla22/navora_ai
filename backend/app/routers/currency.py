from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User, Profile
from app.providers.exchange_rate_provider import exchange_rate_provider, CURRENCY_SYMBOLS

router = APIRouter(prefix="/api/currency", tags=["Currency & Exchange Rates"])


class CurrencyPreferenceRequest(BaseModel):
    currency: str


@router.get("/rates")
def get_exchange_rates(base: str = "USD"):
    """Fetch live / benchmark exchange rates relative to the requested base currency."""
    return exchange_rate_provider.get_rates(base_currency=base)


@router.get("/convert")
def convert_currency(
    amount: float = Query(..., gt=0),
    from_currency: str = Query("USD"),
    to_currency: str = Query("INR"),
):
    """Performs decimal-precise currency conversion."""
    return exchange_rate_provider.convert(amount, from_currency, to_currency)


@router.get("/supported")
def get_supported_currencies():
    """Returns the list of supported ISO 4217 currencies and their symbols."""
    currencies_meta = [
        {"code": "INR", "symbol": "₹", "name": "Indian Rupee", "country": "India", "flag": "🇮🇳"},
        {"code": "USD", "symbol": "$", "name": "US Dollar", "country": "United States", "flag": "🇺🇸"},
        {"code": "EUR", "symbol": "€", "name": "Euro", "country": "European Union", "flag": "🇪🇺"},
        {"code": "GBP", "symbol": "£", "name": "British Pound", "country": "United Kingdom", "flag": "🇬🇧"},
        {"code": "JPY", "symbol": "¥", "name": "Japanese Yen", "country": "Japan", "flag": "🇯🇵"},
        {"code": "AUD", "symbol": "A$", "name": "Australian Dollar", "country": "Australia", "flag": "🇦🇺"},
        {"code": "CAD", "symbol": "C$", "name": "Canadian Dollar", "country": "Canada", "flag": "🇨🇦"},
        {"code": "AED", "symbol": "د.إ", "name": "UAE Dirham", "country": "United Arab Emirates", "flag": "🇦🇪"},
        {"code": "SGD", "symbol": "S$", "name": "Singapore Dollar", "country": "Singapore", "flag": "🇸🇬"},
        {"code": "CHF", "symbol": "CHF", "name": "Swiss Franc", "country": "Switzerland", "flag": "🇨🇭"},
        {"code": "THB", "symbol": "฿", "name": "Thai Baht", "country": "Thailand", "flag": "🇹🇭"},
        {"code": "IDR", "symbol": "Rp", "name": "Indonesian Rupiah", "country": "Indonesia", "flag": "🇮🇩"},
        {"code": "ZAR", "symbol": "R", "name": "South African Rand", "country": "South Africa", "flag": "🇿🇦"},
        {"code": "PEN", "symbol": "S/.", "name": "Peruvian Sol", "country": "Peru", "flag": "🇵🇪"},
        {"code": "MVR", "symbol": "Rf", "name": "Maldivian Rufiyaa", "country": "Maldives", "flag": "🇲🇻"},
    ]
    return {
        "currencies": currencies_meta,
        "symbols": CURRENCY_SYMBOLS
    }


@router.post("/preference")
def update_currency_preference(
    req: CurrencyPreferenceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the user's preferred settlement currency in profile."""
    curr = req.currency.upper().strip()
    if curr not in CURRENCY_SYMBOLS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Currency '{curr}' is not supported. Supported: {', '.join(CURRENCY_SYMBOLS.keys())}"
        )

    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id, preferred_currency=curr)
        db.add(profile)
    else:
        profile.preferred_currency = curr

    db.commit()
    return {
        "status": "success",
        "preferred_currency": curr,
        "symbol": CURRENCY_SYMBOLS.get(curr, "$")
    }
