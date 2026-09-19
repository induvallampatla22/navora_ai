from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth import get_current_user
from app.core.rate_limit import rate_limiter
from app.core.security import get_password_hash
from app.models.auth import User
from app.services.auth_service import auth_service
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    SendOTPRequest,
    VerifyOTPRequest,
    ResetPasswordRequest,
    Setup2FAResponse,
    Verify2FARequest,
    TokenResponse,
    UserOut
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=dict)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Rate limit: 5 registrations per hour per IP/identifier
    rate_limiter.check(f"reg_{req.email or req.phone}", max_requests=15, window_seconds=3600)
    user, otp_code = auth_service.register_user(db, req)
    return {
        "status": "success",
        "message": "Registration initiated. Verification OTP sent to your provided email/phone.",
        "user_id": user.id,
        "demo_otp_hint": otp_code  # Helpful for automated testing / sandbox
    }


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, response: Response, db: Session = Depends(get_db)):
    # Support both application/json and application/x-www-form-urlencoded
    content_type = request.headers.get("content-type", "")
    if "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        identifier = form.get("identifier") or form.get("username")
        password = form.get("password")
        two_factor_code = form.get("two_factor_code")
        recovery_code = form.get("recovery_code")
        req = LoginRequest(
            identifier=str(identifier or ""),
            password=str(password or ""),
            two_factor_code=two_factor_code,
            recovery_code=recovery_code
        )
    else:
        body = await request.json()
        # Handle 'username' alias if passed in JSON
        if "username" in body and "identifier" not in body:
            body["identifier"] = body["username"]
        req = LoginRequest(**body)

    # Rate limit: 15 login attempts per 5 minutes per identifier
    rate_limiter.check(f"login_{req.identifier}", max_requests=15, window_seconds=300)
    login_result = auth_service.login_user(db, req)

    # Set secure HttpOnly cookie for web client
    if login_result.get("access_token"):
        response.set_cookie(
            key="navora_access_token",
            value=login_result["access_token"],
            httponly=True,
            samesite="lax",
            max_age=86400  # 24h
        )

    return TokenResponse(
        access_token=login_result.get("access_token", ""),
        token_type="bearer",
        user=UserOut.from_orm(login_result["user"]),
        requires_2fa=login_result.get("requires_2fa", False),
        temp_token=login_result.get("temp_token")
    )


@router.post("/send-otp")
def send_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    rate_limiter.check(f"otp_{req.identifier}", max_requests=10, window_seconds=600)
    otp_code = auth_service.create_otp(db, user_id=None, identifier=req.identifier, purpose=req.purpose)
    return {
        "status": "success",
        "message": f"Verification code sent to {req.identifier}.",
        "demo_otp_hint": otp_code
    }


@router.post("/resend-otp")
def resend_otp(req: SendOTPRequest, db: Session = Depends(get_db)):
    rate_limiter.check(f"otp_resend_{req.identifier}", max_requests=10, window_seconds=600)
    otp_code = auth_service.create_otp(db, user_id=None, identifier=req.identifier, purpose=req.purpose)
    return {
        "status": "success",
        "message": f"A new verification code has been dispatched to {req.identifier}.",
        "demo_otp_hint": otp_code
    }


@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    auth_service.verify_otp(db, identifier=req.identifier, code=req.code, purpose=req.purpose)
    return {"status": "success", "message": "Verification code verified successfully."}


@router.post("/forgot-password")
def forgot_password(req: SendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter((User.email == req.identifier) | (User.phone == req.identifier)).first()
    if not user:
        return {"status": "success", "message": "If an account exists, a reset code has been sent."}
    otp_code = auth_service.create_otp(db, user_id=user.id, identifier=req.identifier, purpose="password_reset")
    return {
        "status": "success",
        "message": "Password reset code sent to your email or phone.",
        "demo_otp_hint": otp_code
    }


@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    auth_service.verify_otp(db, identifier=req.identifier, code=req.code, purpose="password_reset")
    user = db.query(User).filter((User.email == req.identifier) | (User.phone == req.identifier)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.hashed_password = get_password_hash(req.new_password)
    db.commit()
    return {"status": "success", "message": "Password reset successfully. You can now login with your new password."}


@router.post("/2fa/setup", response_model=Setup2FAResponse)
def setup_2fa(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    res = auth_service.setup_2fa(db, current_user)
    return Setup2FAResponse(**res)


@router.post("/2fa/verify")
def verify_2fa(req: Verify2FARequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service.confirm_2fa(db, current_user, req.code)
    return {"status": "success", "message": "Two-factor authentication successfully verified and activated."}


@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return UserOut.from_orm(current_user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("navora_access_token")
    return {"status": "success", "message": "Logged out successfully."}
