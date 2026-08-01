"""
utilization.py
--------------
Pure math for credit utilization.

Utilization = how much of your credit limit you're using.
Example: $120 balance / $500 limit = 0.24 = 24%

Why it matters (simplified):
- Under ~10% is often considered excellent for scoring
- Under ~30% is commonly treated as "okay / good"
- Higher utilization can hurt your score
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import Tuple


def calc_utilization(balance: Decimal, credit_limit: Decimal) -> float:
    """Return utilization as a fraction, e.g. 0.24 for 24%."""
    if credit_limit <= 0:
        raise ValueError("credit_limit must be greater than 0")
    return float(balance / credit_limit)


def utilization_status(utilization: float) -> str:
    """Translate a number into a human-friendly status label."""
    if utilization < 0.10:
        return "Excellent"
    if utilization < 0.30:
        return "Good"
    if utilization < 0.50:
        return "Fair"
    return "High risk"


def amount_to_reach_target(
    balance: Decimal,
    credit_limit: Decimal,
    target: float = 0.10,
) -> Decimal:
    """
    How much should the user pay to get utilization down to `target`?

    Example:
      balance=120, limit=500, target=10%
      target_balance = 500 * 0.10 = 50
      pay = 120 - 50 = 70
    """
    target_balance = (credit_limit * Decimal(str(target))).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    needed = balance - target_balance
    if needed < 0:
        return Decimal("0.00")
    return needed.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def analyze_card(
    balance: Decimal,
    credit_limit: Decimal,
) -> Tuple[float, float, str, Decimal]:
    """Convenience helper used by the API."""
    util = calc_utilization(balance, credit_limit)
    status = utilization_status(util)
    paydown = amount_to_reach_target(balance, credit_limit, target=0.10)
    return util, util * 100, status, paydown


def simulate_payment(
    balance: Decimal,
    credit_limit: Decimal,
    payment: Decimal,
) -> Tuple[Decimal, float, float, str, Decimal, float, float, str]:
    """
    What happens if the user pays `payment`?

    Returns before/after balances, utilization, and status.
    Payment cannot exceed current balance (no negative balance in MVP).
    """
    if payment < 0:
        raise ValueError("payment cannot be negative")

    applied = min(payment, balance)
    after_balance = (balance - applied).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    before_util, before_pct, before_status, _ = analyze_card(balance, credit_limit)
    after_util, after_pct, after_status, _ = analyze_card(after_balance, credit_limit)

    return (
        balance,
        before_util,
        before_pct,
        before_status,
        after_balance,
        after_util,
        after_pct,
        after_status,
    )