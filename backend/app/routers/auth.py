"""
Auth routes: signup + login.

API = Application Programming Interface
In plain English: a menu of URLs your app can call.

Examples:
  POST /auth/register  → create an account
  POST /auth/login     → get a token (wristband)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth import create_access_token, get_user_by_email, hash_password, verify_password
from app.database import get_db
from app.models import User
from app.schemas import Token, UserCreate, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    """Create a new user account."""
    existing = get_user_by_email(db, user_in.email)
    if existing:
        # 400 = "you sent something invalid / not allowed"
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
    )
    db.add(user)       # stage the new row
    db.commit()        # save it for real
    db.refresh(user)   # reload fields like id / created_at from DB
    return user


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> Token:
    """
    Log in and receive a JWT access token.

    Note: OAuth2PasswordRequestForm expects form fields named:
      username  (we treat this as email)
      password
    """
    user = get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=user.email)
    return Token(access_token=token)
