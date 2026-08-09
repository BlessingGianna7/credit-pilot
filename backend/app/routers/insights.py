"""
Insights routes: recommendations + in-app reminders.

GET /insights/recommendations
GET /insights/reminders
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import CreditCard, User
from app.schemas import InsightOut, InsightsResponse
from app.services.recommendations import build_recommendations, build_reminders

router = APIRouter(prefix="/insights", tags=["insights"])


def _user_cards(db: Session, user: User) -> list[CreditCard]:
    return (
        db.query(CreditCard)
        .filter(CreditCard.user_id == user.id)
        .order_by(CreditCard.id.asc())
        .all()
    )


def _to_schema(items) -> InsightsResponse:
    return InsightsResponse(
        items=[
            InsightOut(
                kind=i.kind,
                code=i.code,
                severity=i.severity,
                title=i.title,
                message=i.message,
                card_id=i.card_id,
                card_name=i.card_name,
                days_until_statement=i.days_until_statement,
                days_until_due=i.days_until_due,
                amount_to_pay=i.amount_to_pay,
                action_path=i.action_path,
            )
            for i in items
        ]
    )


@router.get("/recommendations", response_model=InsightsResponse)
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InsightsResponse:
    """Rule-based coach tips derived from the user's cards."""
    return _to_schema(build_recommendations(_user_cards(db, current_user)))


@router.get("/reminders", response_model=InsightsResponse)
def get_reminders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> InsightsResponse:
    """In-app reminders for upcoming statement/due dates and paydowns."""
    return _to_schema(build_reminders(_user_cards(db, current_user)))
