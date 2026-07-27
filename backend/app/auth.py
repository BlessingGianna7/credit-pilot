"""
auth.py
-------
Handles passwords and login tokens (JWT).

Terms:
- Hashing = scrambling a password so we store "x8f2..." not "mypassword123"
- JWT (JSON Web Token) = a temporary digital wristband that proves "you logged in"
- Bearer token = "here's my wristband, let me into the VIP area"
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import User

# bcrypt = industry-standard password hasher
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# This tells FastAPI: "tokens come from the /auth/login form"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    """Turn a plain password into a safe hash for storage."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a typed password matches the stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    """Create a signed JWT that expires after a while."""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency used by protected routes.

    Flow:
    1. Client sends Authorization: Bearer <token>
    2. We decode the token
    3. We load that user from the database
    4. If anything fails → 401 Unauthorized
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError as exc:
        raise credentials_exception from exc

    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception
    return user
