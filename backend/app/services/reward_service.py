import uuid
from typing import Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.reward import CoinWallet, CoinTransaction
from app.models.community import Notification
from app.schemas.reward import CoinWalletOut, CoinTransactionOut, RedeemCoinsRequest, RedeemCoinsResponse


class RewardService:
    def get_user_wallet(self, db: Session, user_id: str) -> CoinWalletOut:
        wallet = db.query(CoinWallet).filter(CoinWallet.user_id == user_id).first()
        if not wallet:
            wallet = CoinWallet(user_id=user_id, balance=100, total_earned=100, total_redeemed=0)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)

        recent_txns = [CoinTransactionOut.from_orm(t) for t in wallet.transactions[:10]]
        credit_usd = round(wallet.balance * wallet.credit_exchange_rate, 2)

        return CoinWalletOut(
            id=wallet.id,
            user_id=wallet.user_id,
            balance=wallet.balance,
            total_earned=wallet.total_earned,
            total_redeemed=wallet.total_redeemed,
            credit_exchange_rate=wallet.credit_exchange_rate,
            travel_credit_usd=credit_usd,
            recent_transactions=recent_txns
        )

    def award_coins(
        self,
        db: Session,
        user_id: str,
        amount: int,
        reason: str,
        entity_type: str = "general",
        entity_id: str = None
    ) -> CoinTransaction:
        wallet = db.query(CoinWallet).filter(CoinWallet.user_id == user_id).first()
        if not wallet:
            wallet = CoinWallet(user_id=user_id, balance=0, total_earned=0)
            db.add(wallet)
            db.flush()

        wallet.balance += amount
        wallet.total_earned += amount

        txn = CoinTransaction(
            wallet_id=wallet.id,
            transaction_type="EARNED",
            amount=amount,
            balance_after=wallet.balance,
            reason=reason,
            reference_entity_type=entity_type,
            reference_entity_id=entity_id
        )
        db.add(txn)

        notif = Notification(
            user_id=user_id,
            type="coin",
            severity="INFO",
            title="NAVORA Coins Credited!",
            message=f"+{amount} NAVORA Coins credited to your wallet for: {reason}.",
            action_url="/coins"
        )
        db.add(notif)
        db.commit()
        return txn

    def redeem_coins(self, db: Session, user_id: str, req: RedeemCoinsRequest) -> RedeemCoinsResponse:
        wallet = db.query(CoinWallet).filter(CoinWallet.user_id == user_id).first()
        if not wallet or wallet.balance < req.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient NAVORA Coins. Current balance: {wallet.balance if wallet else 0}"
            )

        if req.amount <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Redemption amount must be positive.")

        wallet.balance -= req.amount
        wallet.total_redeemed += req.amount
        voucher_code = f"NAV-CREDIT-{uuid.uuid4().hex[:6].upper()}"
        credit_val = round(req.amount * wallet.credit_exchange_rate, 2)

        txn = CoinTransaction(
            wallet_id=wallet.id,
            transaction_type="REDEEMED",
            amount=req.amount,
            balance_after=wallet.balance,
            reason=f"Redeemed for ${credit_val} travel discount ({voucher_code})",
            reference_entity_type="voucher",
            reference_entity_id=voucher_code
        )
        db.add(txn)
        db.commit()

        return RedeemCoinsResponse(
            success=True,
            coins_deducted=req.amount,
            remaining_balance=wallet.balance,
            discount_credit_value=credit_val,
            voucher_code=voucher_code,
            message=f"Successfully redeemed {req.amount} Coins for ${credit_val} Travel Credit Voucher!"
        )


reward_service = RewardService()
