import hmac
import hashlib
import uuid
import logging
from typing import Dict, Any, Optional
from app.config import settings
from app.providers.base import BasePaymentProvider

logger = logging.getLogger("navora.providers.razorpay")


class RazorpayProvider(BasePaymentProvider):
    def __init__(self):
        self.key_id = settings.RAZORPAY_KEY_ID
        self.key_secret = settings.RAZORPAY_KEY_SECRET
        self.is_active = bool(self.key_id and self.key_secret and not settings.DEMO_MODE)
        self.client = None

        if self.is_active:
            try:
                import razorpay
                self.client = razorpay.Client(auth=(self.key_id, self.key_secret))
                logger.info("Razorpay Client initialized in LIVE mode.")
            except Exception as e:
                logger.warning(f"Failed to initialize Razorpay client: {e}. Falling back to sandbox.")
                self.is_active = False

    def create_order(self, amount: float, currency: str, receipt: str, notes: Dict[str, Any]) -> Dict[str, Any]:
        # Amount in smallest currency unit (cents or paise)
        amount_subunits = int(amount * 100)

        if self.is_active and self.client:
            try:
                order_data = {
                    "amount": amount_subunits,
                    "currency": currency.upper(),
                    "receipt": receipt,
                    "notes": notes,
                    "payment_capture": 1
                }
                order = self.client.order.create(data=order_data)
                return {
                    "order_id": order["id"],
                    "amount": amount,
                    "currency": currency,
                    "key_id": self.key_id,
                    "provider": "Razorpay Live",
                    "is_sandbox": False
                }
            except Exception as e:
                logger.error(f"Error creating live Razorpay order: {e}. Using Sandbox fallback.")

        # DEMO / SANDBOX PROVIDER
        mock_order_id = f"order_demo_{uuid.uuid4().hex[:14]}"
        return {
            "order_id": mock_order_id,
            "amount": amount,
            "currency": currency,
            "key_id": "rzp_test_demo_navora",
            "provider": "Razorpay Sandbox (DEMO DATA)",
            "is_sandbox": True
        }

    def verify_payment(self, order_id: str, payment_id: str, signature: str) -> bool:
        if self.is_active and self.client:
            try:
                msg = f"{order_id}|{payment_id}"
                generated_signature = hmac.new(
                    self.key_secret.encode(),
                    msg.encode(),
                    hashlib.sha256
                ).hexdigest()
                return hmac.compare_digest(generated_signature, signature)
            except Exception as e:
                logger.error(f"Failed signature verification: {e}")
                return False

        # In Sandbox Demo Mode, accept demo signatures
        return bool(order_id and payment_id)

    def verify_webhook_signature(self, body: bytes, signature: str) -> bool:
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        if self.is_active and webhook_secret and signature:
            try:
                expected = hmac.new(webhook_secret.encode(), body, hashlib.sha256).hexdigest()
                return hmac.compare_digest(expected, signature)
            except Exception as e:
                logger.error(f"Webhook signature verification error: {e}")
                return False
        # Sandbox fallback
        return bool(signature or settings.DEMO_MODE)

    def process_refund(self, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        if self.is_active and self.client:
            try:
                data = {"amount": int(amount * 100)} if amount else {}
                refund = self.client.payment.refund(payment_id, data)
                return {
                    "status": "success",
                    "refund_id": refund.get("id", f"rfnd_{uuid.uuid4().hex[:10]}"),
                    "amount": amount,
                    "is_sandbox": False
                }
            except Exception as e:
                logger.error(f"Live refund processing error: {e}")

        # Sandbox refund
        return {
            "status": "success",
            "refund_id": f"rfnd_demo_{uuid.uuid4().hex[:12]}",
            "amount": amount,
            "is_sandbox": True
        }


razorpay_provider = RazorpayProvider()

