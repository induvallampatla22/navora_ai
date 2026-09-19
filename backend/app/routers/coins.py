from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.models.auth import User
from app.services.reward_service import reward_service
from app.schemas.reward import CoinWalletOut, RedeemCoinsRequest, RedeemCoinsResponse

router = APIRouter(prefix="/api/coins", tags=["NAVORA Coins Reward Center"])


@router.get("/wallet", response_model=CoinWalletOut)
def get_user_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns server-authoritative coin wallet balance and audit history.
    """
    return reward_service.get_user_wallet(db, current_user.id)


@router.post("/redeem", response_model=RedeemCoinsResponse)
def redeem_coins(
    req: RedeemCoinsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Redeems coins for travel credit voucher code. Validated strictly on server.
    """
    return reward_service.redeem_coins(db, current_user.id, req)
