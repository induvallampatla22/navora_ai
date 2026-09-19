import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "NAVORA"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = True

    # Database: Supports SQLite or PostgreSQL
    DATABASE_URL: str = "sqlite:///./navora.db"

    # Security
    JWT_SECRET_KEY: str = "navora-super-secure-jwt-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    OTP_EXPIRE_MINUTES: int = 10
    OTP_COOLDOWN_SECONDS: int = 60
    MAX_OTP_ATTEMPTS: int = 5

    # Providers
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    OPENWEATHER_API_KEY: Optional[str] = None
    TRAVEL_API_KEY: Optional[str] = None
    TRAVEL_API_SECRET: Optional[str] = None

    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: str = "noreply@navora.ai"

    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None

    FRONTEND_URL: str = "http://localhost:3000"

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [
            self.FRONTEND_URL,
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
        ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_gemini_active(self) -> bool:
        return bool(self.GEMINI_API_KEY and not self.DEMO_MODE)

    @property
    def is_weather_active(self) -> bool:
        return bool(self.OPENWEATHER_API_KEY and not self.DEMO_MODE)

    @property
    def is_razorpay_active(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID and self.RAZORPAY_KEY_SECRET and not self.DEMO_MODE)

    @property
    def is_twilio_active(self) -> bool:
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN and not self.DEMO_MODE)


settings = Settings()
