"""
models.py
---------
Database TABLES described as Python classes.

Each class = one table.
Each attribute = one column.

Users can own many credit cards (one-to-many relationship).
"""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    # We NEVER store plain passwords — only a scrambled "hash"
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    # user.cards will give you all cards belonging to this user
    cards: Mapped[list["CreditCard"]] = relationship("CreditCard", back_populates="owner")


class CreditCard(Base):
    __tablename__ = "credit_cards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)

    card_name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Numeric is better than float for money (float can be imprecise: 0.1 + 0.2 != 0.3)
    credit_limit: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    # Day of month (1-31). Recurring dates are easier this way than a one-time calendar date.
    statement_day: Mapped[int] = mapped_column(Integer, nullable=False)
    due_day: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    owner: Mapped["User"] = relationship("User", back_populates="cards")
