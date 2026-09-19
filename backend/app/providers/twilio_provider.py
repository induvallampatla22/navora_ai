import logging
from app.config import settings
from app.providers.base import BaseSMSProvider

logger = logging.getLogger("navora.providers.sms")


class TwilioSMSProvider(BaseSMSProvider):
    def __init__(self):
        self.account_sid = settings.TWILIO_ACCOUNT_SID
        self.auth_token = settings.TWILIO_AUTH_TOKEN
        self.from_number = settings.TWILIO_PHONE_NUMBER
        self.is_active = bool(self.account_sid and self.auth_token and self.from_number and not settings.DEMO_MODE)
        self.client = None

        if self.is_active:
            try:
                from twilio.rest import Client
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("Twilio SMS Client initialized in LIVE mode.")
            except Exception as e:
                logger.warning(f"Failed to initialize Twilio client: {e}. Falling back to console OTP.")
                self.is_active = False

    def send_otp(self, to_number: str, otp_code: str) -> bool:
        message_body = f"Your NAVORA Travel verification code is {otp_code}. Valid for 10 minutes. Do not share."

        if self.is_active and self.client:
            try:
                msg = self.client.messages.create(
                    body=message_body,
                    from_=self.from_number,
                    to=to_number
                )
                logger.info(f"Sent live SMS OTP to {to_number}, SID: {msg.sid}")
                return True
            except Exception as e:
                logger.error(f"Twilio SMS delivery failed: {e}. Falling back to console log.")

        # Local development / Demo safe logging
        print(f"\n=======================================================")
        print(f" [NAVORA DEV SMS/EMAIL OTP DISPATCH] ")
        print(f" Target: {to_number}")
        print(f" Verification Code: {otp_code}")
        print(f" Status: DEMO/CONSOLE DISPATCHED (Valid for 10 min)")
        print(f"=======================================================\n")
        logger.info(f"[DEMO MODE] Generated OTP {otp_code} for {to_number}")
        return True


twilio_provider = TwilioSMSProvider()
