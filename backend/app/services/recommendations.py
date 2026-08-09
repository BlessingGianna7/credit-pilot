"""
recommendations.py
------------------
Rule engine for CreditPilot.

These rules are deliberate and explainable — later an AI coach can
*explain* them, but should not invent new financial advice.
"""

from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Iterable, List, Literal, Optional

from app.models import CreditCard
from app.services.utilization import analyze_card, amount_to_reach_target

Severity = Literal["high", "medium", "low", "info"]


@dataclass
class Insight:
    kind: str  # "recommendation" | "reminder"
    code: str
    severity: Severity
    title: str
    message: str
    card_id: Optional[int] = None
    card_name: Optional[str] = None
    days_until_statement: Optional[int] = None
    days_until_due: Optional[int] = None
    amount_to_pay: Optional[Decimal] = None
    action_path: Optional[str] = None


def days_until_day_of_month(target_day: int, today: Optional[date] = None) -> int:
    """
    How many days until the next occurrence of a day-of-month (1–31)?

    Example: today = Aug 9, statement_day = 25 → 16 days.
    If that day already passed this month, use next month.
    """
    today = today or date.today()
    year, month = today.year, today.month

    def make_date(y: int, m: int, d: int) -> date:
        last = calendar.monthrange(y, m)[1]
        return date(y, m, min(d, last))

    candidate = make_date(year, month, target_day)
    if candidate < today:
        if month == 12:
            year, month = year + 1, 1
        else:
            month += 1
        candidate = make_date(year, month, target_day)

    return (candidate - today).days


def build_recommendations(
    cards: Iterable[CreditCard],
    today: Optional[date] = None,
) -> List[Insight]:
    today = today or date.today()
    cards = list(cards)
    insights: List[Insight] = []

    if not cards:
        insights.append(
            Insight(
                kind="recommendation",
                code="add_first_card",
                severity="info",
                title="Add your first card",
                message=(
                    "CreditPilot needs a balance and limit to calculate utilization "
                    "and payment timing tips."
                ),
                action_path="/cards/new",
            )
        )
        return insights

    for card in cards:
        util, util_pct, status, paydown = analyze_card(card.balance, card.credit_limit)
        days_to_statement = days_until_day_of_month(card.statement_day, today)
        days_to_due = days_until_day_of_month(card.due_day, today)

        if util >= 0.30:
            insights.append(
                Insight(
                    kind="recommendation",
                    code="high_utilization",
                    severity="high",
                    title=f"{card.card_name}: utilization is high ({util_pct:.1f}%)",
                    message=(
                        f"Balances above ~30% of your limit are often viewed less favorably. "
                        f"Consider paying ${paydown} before statement day {card.statement_day} "
                        f"to get under 10%."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=paydown,
                    action_path=f"/simulator?cardId={card.id}",
                )
            )
        elif util >= 0.10:
            insights.append(
                Insight(
                    kind="recommendation",
                    code="optimize_utilization",
                    severity="medium",
                    title=f"{card.card_name}: good, but not optimized yet",
                    message=(
                        f"You're under 30%, which is a solid range. Paying ${paydown} before "
                        f"statement day {card.statement_day} could push you under the common "
                        f"10% target."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=paydown,
                    action_path=f"/simulator?cardId={card.id}",
                )
            )
        else:
            insights.append(
                Insight(
                    kind="recommendation",
                    code="excellent_utilization",
                    severity="low",
                    title=f"{card.card_name}: excellent utilization",
                    message=(
                        "You're already under 10%. Keep reporting low balances and avoid "
                        "closing your oldest account if you can — age of credit still matters."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=Decimal("0.00"),
                    action_path=f"/cards/{card.id}",
                )
            )

        # Timing tip when statement is soon and they still need a paydown
        if paydown > 0 and days_to_statement <= 7:
            insights.append(
                Insight(
                    kind="recommendation",
                    code="statement_soon_paydown",
                    severity="high" if util >= 0.30 else "medium",
                    title=f"{card.card_name}: statement closes in {days_to_statement} day(s)",
                    message=(
                        f"The balance near your statement date is often what gets reported. "
                        f"Pay ${paydown} in the next {days_to_statement} day(s) to aim for "
                        f"under 10% utilization (status is currently {status})."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=paydown,
                    action_path="/reminders",
                )
            )

    insights.append(
        Insight(
            kind="recommendation",
            code="statement_vs_due",
            severity="info",
            title="Statement date vs due date",
            message=(
                "The balance on your statement date is often what gets reported. "
                "Paying before the statement closes can lower reported utilization — "
                "even if the due date is weeks later."
            ),
            action_path="/reminders",
        )
    )
    insights.append(
        Insight(
            kind="recommendation",
            code="educational_disclaimer",
            severity="info",
            title="These tips are educational",
            message=(
                "CreditPilot uses simple utilization rules. It does not pull official "
                "FICO/Vantage scores and is not personalized credit advice from a bureau."
            ),
        )
    )

    severity_rank = {"high": 0, "medium": 1, "low": 2, "info": 3}
    insights.sort(key=lambda i: severity_rank[i.severity])
    return insights


def build_reminders(
    cards: Iterable[CreditCard],
    today: Optional[date] = None,
    statement_window_days: int = 14,
) -> List[Insight]:
    """
    In-app payment reminders focused on upcoming statement/due dates.
    """
    today = today or date.today()
    reminders: List[Insight] = []

    for card in list(cards):
        paydown = amount_to_reach_target(card.balance, card.credit_limit, target=0.10)
        days_to_statement = days_until_day_of_month(card.statement_day, today)
        days_to_due = days_until_day_of_month(card.due_day, today)
        _, util_pct, status, _ = analyze_card(card.balance, card.credit_limit)

        if paydown > 0 and days_to_statement <= statement_window_days:
            severity: Severity
            if days_to_statement <= 3 or util_pct >= 50:
                severity = "high"
            elif days_to_statement <= 7 or util_pct >= 30:
                severity = "medium"
            else:
                severity = "low"

            day_word = "day" if days_to_statement == 1 else "days"
            reminders.append(
                Insight(
                    kind="reminder",
                    code="pay_before_statement",
                    severity=severity,
                    title=f"{card.card_name}: statement in {days_to_statement} {day_word}",
                    message=(
                        f"Pay ${paydown} before statement day {card.statement_day} "
                        f"to keep utilization under 10% (currently {util_pct:.1f}%, {status}). "
                        f"Payment due day is {card.due_day} "
                        f"({days_to_due} day(s) away)."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=paydown,
                    action_path=f"/simulator?cardId={card.id}",
                )
            )
        elif paydown == 0 and days_to_statement <= statement_window_days:
            reminders.append(
                Insight(
                    kind="reminder",
                    code="statement_ok",
                    severity="low",
                    title=f"{card.card_name}: statement soon — you're on track",
                    message=(
                        f"Statement day {card.statement_day} is in {days_to_statement} day(s). "
                        f"Utilization is already under 10% ({util_pct:.1f}%). Nice work."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=Decimal("0.00"),
                    action_path=f"/cards/{card.id}",
                )
            )

        # Separate due-date nudge if due is sooner than statement and balance remains
        if card.balance > 0 and days_to_due <= 7 and days_to_due < days_to_statement:
            reminders.append(
                Insight(
                    kind="reminder",
                    code="payment_due_soon",
                    severity="medium",
                    title=f"{card.card_name}: payment due in {days_to_due} day(s)",
                    message=(
                        f"Due day {card.due_day} is coming up. Paying at least the statement "
                        f"balance on time protects payment history — the biggest credit factor."
                    ),
                    card_id=card.id,
                    card_name=card.card_name,
                    days_until_statement=days_to_statement,
                    days_until_due=days_to_due,
                    amount_to_pay=card.balance,
                    action_path=f"/cards/{card.id}",
                )
            )

    if not reminders:
        reminders.append(
            Insight(
                kind="reminder",
                code="no_urgent_reminders",
                severity="info",
                title="No urgent reminders right now",
                message=(
                    "No statement or due dates need action inside the next two weeks, "
                    "or you have no cards yet. Check Tips for longer-term recommendations."
                ),
                action_path="/tips",
            )
        )

    severity_rank = {"high": 0, "medium": 1, "low": 2, "info": 3}
    reminders.sort(
        key=lambda i: (
            severity_rank[i.severity],
            i.days_until_statement if i.days_until_statement is not None else 999,
        )
    )
    return reminders
