import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.config import settings
from app.providers.base import BaseEmailProvider

logger = logging.getLogger("navora.providers.email")


class SMTPEmailProvider(BaseEmailProvider):
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.sender = settings.EMAIL_FROM or "noreply@navora.ai"
        self.is_active = bool(self.host and self.username and self.password and not settings.DEMO_MODE)
        if self.is_active:
            logger.info(f"Email Provider initialized with SMTP host {self.host}:{self.port}")
        else:
            logger.info("Email Provider running in DEMO / SANDBOX mode.")

    def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        if self.is_active:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = self.sender
                msg["To"] = to_email

                part1 = MIMEText(body, "plain")
                msg.attach(part1)

                if html_body:
                    part2 = MIMEText(html_body, "html")
                    msg.attach(part2)

                with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                    server.starttls()
                    server.login(self.username, self.password)
                    server.sendmail(self.sender, [to_email], msg.as_string())

                logger.info(f"[LIVE EMAIL] Successfully sent email to {to_email} with subject '{subject}'")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP: {e}. Falling back to sandbox.")

        # DEMO / SANDBOX FALLBACK
        logger.info(f"[SANDBOX DEMO EMAIL] To: {to_email} | Subject: {subject} | Body Preview: {body[:80]}...")
        return True

    def send_otp_email(self, to_email: str, otp_code: str, purpose: str = "verification") -> bool:
        subject = f"NAVORA — Your {purpose.capitalize()} Code: {otp_code}"
        body = (
            f"Greetings from NAVORA,\n\n"
            f"Your verification code is: {otp_code}\n\n"
            f"This code will expire in {settings.OTP_EXPIRE_MINUTES} minutes. "
            f"If you did not request this, please disregard this message.\n\n"
            f"NAVORA AI Travel Operating Platform\n"
            f"More Than Travel."
        )
        return self.send_email(to_email=to_email, subject=subject, body=body)

    def send_booking_confirmation(self, to_email: str, booking_title: str, total_amount: float, currency: str) -> bool:
        subject = f"NAVORA Booking Confirmed: {booking_title}"
        body = (
            f"Congratulations!\n\n"
            f"Your booking for '{booking_title}' is confirmed.\n"
            f"Total Amount: {currency} {total_amount:.2f}\n\n"
            f"You can view your booking voucher and travel details directly inside your NAVORA Trip Monitor.\n\n"
            f"Safe travels,\n"
            f"NAVORA Concierge"
        )
        return self.send_email(to_email=to_email, subject=subject, body=body)


email_provider = SMTPEmailProvider()
