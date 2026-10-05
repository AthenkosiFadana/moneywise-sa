"""Pure financial calculations shared by the MoneyWise SA API.

These mirror frontend/src/utils/calculations.js so the same numbers are
produced whether the browser is online (REST API) or offline (local engine).
"""

from calendar import monthrange
from datetime import date

MONTHS_PER_YEAR = 12
WEEKS_PER_YEAR = 52
DAYS_PER_YEAR = 365

NEEDS_RATIO = 0.50
WANTS_RATIO = 0.30
SAVINGS_RATIO = 0.20

DEBT_CATEGORIES = {"debt", "credit", "loans", "repayments", "furniture", "payday loan"}


def money(value):
    try:
        return round(float(value or 0), 2)
    except (TypeError, ValueError):
        return 0.0


def add_months(base: date, months: int) -> date:
    month_index = base.month - 1 + int(months)
    year = base.year + month_index // 12
    month = month_index % 12 + 1
    day = min(base.day, monthrange(year, month)[1])
    return date(year, month, day)


def months_label(months: float) -> str:
    rounded = int(months) + (1 if months > int(months) else 0)
    if rounded <= 0:
        return "0 months"
    if rounded == 1:
        return "1 month"
    if rounded < 12:
        return f"{rounded} months"
    years, rest = divmod(rounded, 12)
    year_text = "1 year" if years == 1 else f"{years} years"
    return f"{year_text} and {rest} months" if rest else year_text


def total_of(items, key="amount"):
    return money(sum((item.get(key) or 0) for item in items or []))


def analyse_cashflow(income, expenses):
    monthly_income = money(income)
    total_expenses = total_of(expenses)
    remaining = money(monthly_income - total_expenses)

    savings_rate = (remaining / monthly_income * 100) if monthly_income else 0.0
    expense_ratio = (total_expenses / monthly_income * 100) if monthly_income else 0.0

    status, tone, message = "break-even", "neutral", "Your income and spending are exactly balanced."
    if remaining > 0:
        status, tone = "surplus", "positive"
        message = "You're currently spending less than you earn."
    elif remaining < 0:
        status, tone = "deficit", "negative"
        message = "You're spending more than you earn this month."

    return {
        "monthlyIncome": monthly_income,
        "totalExpenses": total_expenses,
        "remaining": remaining,
        "savingsRate": money(savings_rate),
        "expenseRatio": money(expense_ratio),
        "status": status,
        "tone": tone,
        "message": message,
        "isEmpty": monthly_income == 0 and total_expenses == 0,
    }


def summarise_budget(categories):
    rows = []
    for category in categories or []:
        budget = money(category.get("budget"))
        spent = money(category.get("spent"))
        remaining = money(budget - spent)
        used_percent = money(spent / budget * 100) if budget > 0 else 0.0
        over_by = money(abs(remaining)) if remaining < 0 else 0.0

        if budget <= 0:
            status = "unbudgeted"
        elif over_by > 0:
            status = "over"
        elif used_percent >= 90:
            status = "warning"
        else:
            status = "ok"

        rows.append(
            {
                **category,
                "budget": budget,
                "spent": spent,
                "remaining": remaining,
                "usedPercent": used_percent,
                "overBy": over_by,
                "status": status,
            }
        )

    total_budget = money(sum(row["budget"] for row in rows))
    total_spent = money(sum(row["spent"] for row in rows))

    alerts = [
        {"tone": "negative", "text": f"{row['name']} budget exceeded by R{row['overBy']:,.0f}."}
        for row in rows
        if row["status"] == "over"
    ]
    alerts += [
        {"tone": "warning", "text": f"{row['name']} is at {row['usedPercent']:.0f}% of its budget."}
        for row in rows
        if row["status"] == "warning"
    ]

    return {
        "rows": rows,
        "totalBudget": total_budget,
        "totalSpent": total_spent,
        "totalRemaining": money(total_budget - total_spent),
        "overBudget": [row for row in rows if row["status"] == "over"],
        "warnings": [row for row in rows if row["status"] == "warning"],
        "alerts": alerts,
        "spendRate": money(total_spent / total_budget * 100) if total_budget > 0 else 0.0,
        "hasData": bool(rows),
    }


def savings_projection(target, current, monthly):
    goal = money(target)
    saved = money(current)
    contribution = money(monthly)
    shortfall = money(max(0, goal - saved))
    progress = money(min(100, saved / goal * 100)) if goal > 0 else 0.0

    if goal <= 0:
        return {"valid": False, "message": "Enter a savings goal greater than R0."}

    if saved >= goal:
        return {
            "valid": True,
            "reached": True,
            "goal": goal,
            "saved": saved,
            "contribution": contribution,
            "shortfall": 0.0,
            "progress": 100.0,
            "months": 0,
            "monthsLabel": "Goal reached",
            "projectedDate": "Done",
            "weekly": 0.0,
            "daily": 0.0,
            "message": "Congratulations — you have already reached this goal!",
        }

    if contribution <= 0:
        return {
            "valid": False,
            "goal": goal,
            "saved": saved,
            "shortfall": shortfall,
            "progress": progress,
            "message": "Add a monthly contribution to see how long your goal will take.",
        }

    months = int(shortfall // contribution) + (1 if shortfall % contribution else 0)
    finish = add_months(date.today(), months)

    return {
        "valid": True,
        "reached": False,
        "goal": goal,
        "saved": saved,
        "contribution": contribution,
        "shortfall": shortfall,
        "progress": progress,
        "months": months,
        "monthsLabel": months_label(months),
        "projectedDate": finish.strftime("%b %Y"),
        "weekly": money(contribution * MONTHS_PER_YEAR / WEEKS_PER_YEAR),
        "daily": money(contribution * MONTHS_PER_YEAR / DAYS_PER_YEAR),
        "message": (
            f"At R{contribution:,.0f} per month you will reach your goal in about {months_label(months)}."
        ),
    }


def emergency_fund_target(essentials, months=3):
    monthly_essentials = money(essentials)
    cover = int(months or 3)
    target = money(monthly_essentials * cover)
    return {
        "monthlyEssentials": monthly_essentials,
        "months": cover,
        "target": target,
        "monthlyNeeded12": money(target / 12) if target else 0.0,
        "weeklyNeeded52": money(target / WEEKS_PER_YEAR) if target else 0.0,
        "valid": monthly_essentials > 0,
    }


def debt_repayment(principal, monthly, annual_rate=0):
    balance = money(principal)
    payment = money(monthly)
    rate = money(annual_rate) / 100 / MONTHS_PER_YEAR

    if balance <= 0:
        return {"valid": False, "message": "Enter the amount you owe."}
    if payment <= 0:
        return {"valid": False, "message": "Enter your monthly repayment."}

    min_interest = balance * rate
    if rate > 0 and payment <= min_interest:
        return {
            "valid": False,
            "message": (
                "Your payment must be higher than the interest charged each month "
                f"(R{min_interest:,.0f})."
            ),
        }

    remaining = balance
    months = 0
    total_paid = 0.0
    total_interest = 0.0
    schedule = []

    while remaining > 0.005 and months < 1200:
        interest = remaining * rate
        principal_paid = payment - interest

        if principal_paid > remaining:
            principal_paid = remaining
            total_paid += principal_paid + interest
            total_interest += interest
            remaining = 0.0
        else:
            remaining -= principal_paid
            total_paid += payment
            total_interest += interest

        months += 1
        if len(schedule) < 12:
            schedule.append(
                {
                    "month": months,
                    "opening": money(remaining + principal_paid),
                    "payment": money(min(payment, principal_paid + interest)),
                    "interest": money(interest),
                    "principal": money(principal_paid),
                    "closing": money(max(0, remaining)),
                }
            )

    finish = add_months(date.today(), months)
    label = months_label(months)

    return {
        "valid": True,
        "balance": balance,
        "payment": payment,
        "annualRate": money(annual_rate),
        "months": months,
        "monthsLabel": label,
        "projectedDate": finish.strftime("%b %Y"),
        "totalPaid": money(total_paid),
        "totalInterest": money(total_interest),
        "overpayment": money(total_paid - balance),
        "schedule": schedule,
        "message": (
            f"You will clear this debt in about {label}, paying R{money(total_interest):,.0f} in interest."
        ),
    }


def affordability_check(income, commitments=None, new_commitment=0):
    monthly_income = money(income)
    commitments = commitments or []
    existing = money(sum(money(item.get("amount")) for item in commitments))
    extra = money(new_commitment)
    total = money(existing + extra)
    after = money(monthly_income - total)

    ratio = money(total / monthly_income * 100) if monthly_income else 0.0
    extra_ratio = money(extra / monthly_income * 100) if monthly_income else 0.0
    existing_ratio = money(existing / monthly_income * 100) if monthly_income else 0.0

    if monthly_income <= 0:
        verdict = "unknown"
        headline = "Enter your monthly income to see an affordability breakdown."
    elif after < 0:
        verdict, headline = "tight", "These commitments cost more than you earn each month."
    elif ratio <= 50:
        verdict, headline = "comfortable", "Your commitments stay within a healthy share of your income."
    elif ratio <= 70:
        verdict, headline = "caution", "Your commitments take up a large share of your income."
    else:
        verdict = "tight"
        headline = "Your commitments use most of your income, leaving little room to save."

    return {
        "monthlyIncome": monthly_income,
        "existing": existing,
        "extra": extra,
        "total": total,
        "afterCommitments": after,
        "ratio": ratio,
        "extraRatio": extra_ratio,
        "existingRatio": existing_ratio,
        "bands": fifty_thirty_twenty(monthly_income),
        "verdict": verdict,
        "headline": headline,
        "valid": monthly_income > 0,
    }


def fifty_thirty_twenty(income):
    monthly = money(income)
    return {
        "income": monthly,
        "needs": money(monthly * NEEDS_RATIO),
        "wants": money(monthly * WANTS_RATIO),
        "savings": money(monthly * SAVINGS_RATIO),
        "valid": monthly > 0,
    }
