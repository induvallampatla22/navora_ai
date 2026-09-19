from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=128)
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)


class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email or phone number")
    password: str
    two_factor_code: Optional[str] = None
    recovery_code: Optional[str] = None


class SendOTPRequest(BaseModel):
    identifier: str
    purpose: str = "registration"


class VerifyOTPRequest(BaseModel):
    identifier: str
    code: str
    purpose: str = "registration"


class ResetPasswordRequest(BaseModel):
    identifier: str
    code: str
    new_password: str = Field(..., min_length=8)



class Setup2FAResponse(BaseModel):
    secret: str
    qr_code_uri: str
    recovery_codes: List[str]
    message: str


class Verify2FARequest(BaseModel):
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"
    requires_2fa: bool = False
    temp_token: Optional[str] = None


class ProfileOut(BaseModel):
    avatar_url: Optional[str] = None
    home_city: Optional[str] = None
    home_country: Optional[str] = None
    preferred_currency: str = "USD"
    preferred_language: str = "en"
    bio: Optional[str] = None
    travel_styles: List[str] = []
    dietary_preferences: List[str] = []
    interests: List[str] = []
    accessibility_needs: List[str] = []

    class Config:
        from_attributes = True


class ProfileUpdate(BaseModel):
    avatar_url: Optional[str] = None
    home_city: Optional[str] = None
    home_country: Optional[str] = None
    preferred_currency: Optional[str] = None
    preferred_language: Optional[str] = None
    bio: Optional[str] = None
    travel_styles: Optional[List[str]] = None
    dietary_preferences: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    accessibility_needs: Optional[List[str]] = None


class UserOut(BaseModel):
    id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_2fa_enabled: bool
    created_at: datetime
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True


TokenResponse.update_forward_refs()
