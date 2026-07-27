"""
schemas.py
----------
Pydantic schemas = shapes of data going IN and OUT of the API.

Why separate from models?
- models.py = how data is stored in the database
- schemas.py = how data looks in JSON requests/responses

Analogy:
- Model = ingredients in your kitchen
- Schema = the recipe card you show the customer
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------- Auth / Users ----------

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ---------- Credit Cards ----------

class CreditCardCreate(BaseModel):
    card_name: str = Field(min_length=1, max_length=120)
    credit_limit: Decimal = Field(gt=0, decimal_places=2)
    balance: Decimal = Field(ge=0, decimal_places=2)
    statement_day: int = Field(ge=1, le=31)
    due_day: int = Field(ge=1, le=31)


class CreditCardUpdate(BaseModel):
    # Optional means "you can send this field, or skip it"
    card_name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    credit_limit: Optional[Decimal] = Field(default=None, gt=0, decimal_places=2)
    balance: Optional[Decimal] = Field(default=None, ge=0, decimal_places=2)
    statement_day: Optional[int] = Field(default=None, ge=1, le=31)
    due_day: Optional[int] = Field(default=None, ge=1, le=31)


class CreditCardOut(BaseModel):
    id: int
    card_name: str
    credit_limit: Decimal
    balance: Decimal
    statement_day: int
    due_day: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CreditCardMetrics(BaseModel):
    card_id: int
    card_name: str
    balance: Decimal
    credit_limit: Decimal
    utilization: float
    utilization_percent: float
    status: str
    amount_to_pay_for_10_percent: Decimal
