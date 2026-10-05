"""Money Confidence Score engine.

Measures financial habits and knowledge — never wealth. Mirrors
frontend/src/utils/confidence.js.
"""

from .calculations import analyse_cashflow, money, summarise_budget, total_of

PILLARS = {
    "budgeting": {
        "label": "Budgeting",
        "icon": "📊",
        "hint": "How clearly you plan and track your spending.",
        "weight": 0.25,
        "tip": "Give every rand a job before the month starts — housing, transport and food first.",
    },
    "saving": {
        "label": "Saving",
        "icon": "💰",
        "hint": "Whether you keep something back every month.",
        "weight": 0.25,
        "tip": "Automate a small transfer on pay day. Even R100 a month builds the habit.",
    },
    "debt": {
        "label": "Debt management",
        "icon": "💳",
        "hint": "How comfortably you handle what you owe.",
        "weight": 0.20,
        "tip": "Clear the highest interest debt first while paying minimums on the rest.",
    },
    "emergency": {
        "label": "Emergency fund",
        "icon": "🚨",
        "hint": "Your buffer for unexpected expenses.",
        "weight": 0.15,
        "tip": "Aim for three months of essential expenses, starting with a R1,000 mini buffer.",
    },
    "knowledge": {
        "label": "Financial knowledge",
        "icon": "🎓",
        "hint": "What you have learned so far in the Learning Hub.",
        "weight": 0.15,
        "tip": "Complete one lesson and the short knowledge check this week.",
    },
}

DEBT_CATEGORIES = {"debt", "credit", "loans", "repayments", "furniture", "payday loan"}


def clamp(value, low, high):
    return max(low, min(high, value))


def tone_for(score):
    if score >= 75:
        return "good"
    if score >= 50:
        return "watch"
    return "risk"


def pillar(key, score, detail, **extra):
    safe_score = clamp(round(score), 0, 100)
    meta = PILLARS[key]
    return {
        "key": key,
        "label": meta["label"],
        "icon": meta["icon"],
        "hint": meta["hint"],
        "tip": meta["tip"],
        "score": safe_score,
        "tone": tone_for(safe_score),
        "detail": detail,
        **extra,
    }


def score_budgeting(income, expenses, budget):
    score, details = 0.0, []

    if income > 0:
        score += 20
    else:
        details.append("Add your monthly income")

    if len(expenses) >= 3:
        score += 15
    elif expenses:
        score += 7
        details.append("Log more of your regular expenses")
    else:
        details.append("Start tracking your expenses")

    summary = summarise_budget(budget)
    tracked = [row for row in summary["rows"] if row["budget"] > 0 and row["spent"] > 0]

    if len(tracked) >= 4:
        score += 20
    elif tracked:
        score += 10
    else:
        details.append("Set budgets and record what you spent")

    if tracked:
        within = [row for row in tracked if row["status"] != "over"]
        score += 25 * (len(within) / len(tracked))
        if len(within) < len(tracked):
            details.append("Bring overspent categories back on track")

    if income > 0 and expenses:
        cashflow = analyse_cashflow(income, expenses)
        if cashflow["remaining"] > 0:
            score += 12
        if cashflow["savingsRate"] >= 10:
            score += 8
        elif cashflow["remaining"] > 0:
            score += 4
        else:
            details.append("Spend less than you earn this month")

    detail = details[0] if details else "You plan and track your spending consistently."
    return pillar("budgeting", score, detail)


def score_saving(income, expenses, goals):
    score, details = 0.0, []

    if income > 0 and expenses:
        rate = analyse_cashflow(income, expenses)["savingsRate"]
        if rate >= 20:
            score += 50
        elif rate >= 10:
            score += 38
        elif rate >= 5:
            score += 26
        elif rate > 0:
            score += 15
        if rate < 10:
            details.append("Aim to keep at least 10% of your income")
    else:
        score += 10
        details.append("Record income and expenses to measure your savings rate")

    with_contributions = [g for g in goals if money(g.get("monthly")) > 0]
    if len(with_contributions) >= 2:
        score += 25
    elif with_contributions:
        score += 15
    elif goals:
        score += 6
        details.append("Add a monthly contribution to your goals")
    else:
        details.append("Create your first savings goal")

    if goals:
        progresses = [
            clamp(money(g.get("saved")) / max(1, money(g.get("target"))) * 100, 0, 100) for g in goals
        ]
        average = sum(progresses) / len(progresses)
        score += average / 100 * 25
        if average < 25:
            details.append("Keep contributing to reach your first milestone")

    detail = details[0] if details else "You are building savings habits each month."
    return pillar("saving", score, detail)


def score_debt(income, expenses, budget, debts):
    declared = [d for d in (debts or []) if money(d.get("balance")) > 0]

    income_debt = total_of(
        [e for e in (expenses or []) if str(e.get("category", "")).lower() in DEBT_CATEGORIES]
    )
    budget_debt = sum(
        money(row.get("spent"))
        for row in (budget or [])
        if str(row.get("name", "")).lower() in DEBT_CATEGORIES
    )
    monthly_debt = max(income_debt, budget_debt)
    total_debt = sum(money(d.get("balance")) for d in declared)

    if monthly_debt <= 0 and total_debt <= 0:
        return pillar("debt", 55, "No debt recorded — nothing is working against you.", neutral=True)

    score, details = 0.0, []

    if income > 0:
        ratio = monthly_debt / income * 100
        if ratio <= 10:
            score += 45
        elif ratio <= 15:
            score += 35
        elif ratio <= 25:
            score += 20
        else:
            score += 5
        if ratio > 15:
            details.append("Debt repayments should stay under 15% of income")
    else:
        score += 15
        details.append("Add your income to measure your debt load")

    if declared:
        score += 25
        if any(money(d.get("payment")) <= 0 for d in declared):
            details.append("Record a repayment amount for each debt")
    else:
        score += 10
        details.append("Add your debts for a fuller picture")

    if analyse_cashflow(income, expenses)["remaining"] > 0:
        score += 20
    elif income > 0:
        details.append("You are spending more than you earn")

    if total_debt > 0:
        score += 10

    detail = details[0] if details else "Your debt repayments look manageable."
    return pillar("debt", score, detail)


def score_emergency(income, goals, savings_rate):
    emergency_goal = next(
        (
            g
            for g in goals
            if g.get("emergency") or "emergency" in str(g.get("name", "")).lower()
        ),
        None,
    )

    if not emergency_goal:
        partial = 35 if income > 0 and savings_rate > 0 else 20
        return pillar(
            "emergency", partial, "You do not have an emergency fund goal yet.", missing=True
        )

    target = max(1, money(emergency_goal.get("target")))
    progress = clamp(money(emergency_goal.get("saved")) / target * 100, 0, 100)
    funded_months = money(emergency_goal.get("coverMonths"))

    score = progress * 0.8
    if funded_months >= 3:
        score += 20
    elif funded_months > 0:
        score += funded_months * 5
    elif money(emergency_goal.get("monthly")) > 0:
        score += 10

    if progress >= 100:
        detail = "Your emergency fund target is fully funded."
    elif progress > 0:
        detail = f"Your emergency fund is {round(progress)}% funded."
    else:
        detail = "Your emergency fund goal exists but has no savings yet."

    return pillar("emergency", score, detail)


def score_knowledge(completed, total, quiz_best):
    score, details = 0.0, []
    total = total or 1

    score += clamp(len(completed or []) / total, 0, 1) * 60
    if not completed:
        details.append("Complete your first lesson in the Learning Hub")

    if quiz_best is None:
        details.append("Take the money knowledge check to unlock this score")
    else:
        score += clamp(money(quiz_best), 0, 100) / 100 * 40
        if money(quiz_best) < 70:
            details.append("Review the lessons behind the questions you missed")

    detail = details[0] if details else "You are building real financial knowledge."
    return pillar("knowledge", score, detail)


def level_for(overall):
    if overall >= 80:
        return {"name": "MoneyWise", "tone": "excellent"}
    if overall >= 60:
        return {"name": "Confident", "tone": "good"}
    if overall >= 40:
        return {"name": "Building", "tone": "watch"}
    return {"name": "Starter", "tone": "risk"}


def calculate_confidence(state):
    state = state or {}
    profile = state.get("profile") or {}
    income = money(profile.get("income"))
    expenses = state.get("expenses") or []
    budget = state.get("budget") or []
    goals = state.get("goals") or []
    debts = state.get("debts") or []
    learning = state.get("learning") or {}
    cashflow = analyse_cashflow(income, expenses)

    pillars = [
        score_budgeting(income, expenses, budget),
        score_saving(income, expenses, goals),
        score_debt(income, expenses, budget, debts),
        score_emergency(income, goals, cashflow["savingsRate"]),
        score_knowledge(
            learning.get("completed") or [],
            learning.get("total") or 7,
            learning.get("quizBest"),
        ),
    ]

    overall = round(sum(p["score"] * PILLARS[p["key"]]["weight"] for p in pillars))
    ranked = sorted(pillars, key=lambda p: p["score"], reverse=True)
    strongest, weakest = ranked[0], ranked[-1]

    return {
        "overall": overall,
        "level": level_for(overall),
        "pillars": pillars,
        "strongest": strongest,
        "weakest": weakest,
        "summary": (
            f"Your strongest area is {strongest['label'].lower()}. "
            f"Your next opportunity is {weakest['label'].lower()} — {weakest['tip']}"
        ),
    }
