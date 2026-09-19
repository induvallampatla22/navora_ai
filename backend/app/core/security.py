import secrets
import string
from datetime import datetime, timedelta
from typing import Optional, List, Tuple
import bcrypt
import jwt
import pyotp
from app.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def generate_otp_code() -> str:
    # 6-digit cryptographic random numeric code
    return "".join(secrets.choice(string.digits) for _ in range(6))


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def get_totp_uri(secret: str, user_identifier: str) -> str:
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=user_identifier, issuer_name="NAVORA Travel")


def verify_totp_code(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    # Validates current and adjacent 30-sec windows
    return totp.verify(code, valid_window=1)


def generate_recovery_codes(count: int = 10) -> List[Tuple[str, str]]:
    """
    Generates backup alphanumeric recovery codes.
    Returns list of (plain_code, hashed_code).
    """
    codes = []
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(count):
        raw_code = "-".join(
            "".join(secrets.choice(alphabet) for _ in range(4)) for _ in range(3)
        )  # Format: XXXX-XXXX-XXXX
        code_hash = get_password_hash(raw_code)
        codes.append((raw_code, code_hash))
    return codes
