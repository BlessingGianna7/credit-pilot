"""
Credit card routes (CRUD).

CRUD = Create, Read, Update, Delete
The four basic things apps do with data.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import CreditCard, User
from app.schemas import (
    CreditCardCreate,
    CreditCardMetrics,
    CreditCardOut,
    CreditCardUpdate,
    SimulatePaymentRequest,
    SimulatePaymentResult,
)
from app.services.utilization import analyze_card, simulate_payment

router = APIRouter(prefix="/cards", tags=["cards"])


def _get_owned_card(db: Session, card_id: int, user: User) -> CreditCard:
    """Fetch a card only if it belongs to the logged-in user."""
    card = (
        db.query(CreditCard)
        .filter(CreditCard.id == card_id, CreditCard.user_id == user.id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.post("", response_model=CreditCardOut, status_code=status.HTTP_201_CREATED)
def create_card(
    card_in: CreditCardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CreditCard:
    """Add a new credit card for the logged-in user."""
    if card_in.balance > card_in.credit_limit:
        raise HTTPException(
            status_code=400,
            detail="Balance cannot be greater than credit limit",
        )

    card = CreditCard(
        user_id=current_user.id,
        card_name=card_in.card_name,
        credit_limit=card_in.credit_limit,
        balance=card_in.balance,
        statement_day=card_in.statement_day,
        due_day=card_in.due_day,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.get("", response_model=list[CreditCardOut])
def list_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CreditCard]:
    """List all cards owned by the logged-in user."""
    return (
        db.query(CreditCard)
        .filter(CreditCard.user_id == current_user.id)
        .order_by(CreditCard.id.asc())
        .all()
    )


@router.get("/{card_id}", response_model=CreditCardOut)
def get_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CreditCard:
    return _get_owned_card(db, card_id, current_user)


@router.patch("/{card_id}", response_model=CreditCardOut)
def update_card(
    card_id: int,
    card_in: CreditCardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CreditCard:
    """Update only the fields the user sent (partial update)."""
    card = _get_owned_card(db, card_id, current_user)
    updates = card_in.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(card, field, value)

    # Re-check money rules after update
    if card.balance > card.credit_limit:
        raise HTTPException(
            status_code=400,
            detail="Balance cannot be greater than credit limit",
        )

    db.commit()
    db.refresh(card)
    return card


@router.delete("/{card_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_card(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    card = _get_owned_card(db, card_id, current_user)
    db.delete(card)
    db.commit()


@router.get("/{card_id}/metrics", response_model=CreditCardMetrics)
def card_metrics(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CreditCardMetrics:
    """
    Calculate utilization + status + how much to pay to get under 10%.

    This is the core "credit coach math" of CreditPilot.
    """
    card = _get_owned_card(db, card_id, current_user)
    util, util_pct, status_label, paydown = analyze_card(card.balance, card.credit_limit)

    return CreditCardMetrics(
        card_id=card.id,
        card_name=card.card_name,
        balance=card.balance,
        credit_limit=card.credit_limit,
        utilization=util,
        utilization_percent=util_pct,
        status=status_label,
        amount_to_pay_for_10_percent=paydown,
    )


@router.post("/{card_id}/simulate", response_model=SimulatePaymentResult)
def simulate_card_payment(
    card_id: int,
    body: SimulatePaymentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SimulatePaymentResult:
    """Estimate utilization before/after a payment (does not change saved balance)."""
    card = _get_owned_card(db, card_id, current_user)

    (
        before_balance,
        _before_util,
        before_pct,
        before_status,
        after_balance,
        _after_util,
        after_pct,
        after_status,
    ) = simulate_payment(card.balance, card.credit_limit, body.payment)

    if after_pct < before_pct:
        explanation = (
            f"Paying ${body.payment} would lower utilization from "
            f"{before_pct:.1f}% to {after_pct:.1f}%. Lower utilization is generally "
            "viewed more favorably on credit profiles."
        )
    elif after_pct == before_pct:
        explanation = (
            "This payment would not change utilization "
            "(payment may be $0 or already at $0 balance)."
        )
    else:
        explanation = "Unexpected result: utilization increased."

    return SimulatePaymentResult(
        card_id=card.id,
        card_name=card.card_name,
        payment=body.payment,
        before_balance=before_balance,
        before_utilization_percent=before_pct,
        before_status=before_status,
        after_balance=after_balance,
        after_utilization_percent=after_pct,
        after_status=after_status,
        explanation=explanation,
    )