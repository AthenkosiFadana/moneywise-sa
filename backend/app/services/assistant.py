"""Rule-based MoneyWise assistant.

Provides financial education responses (never personalised financial advice)
and mirrors the intent rules in frontend/src/utils/assistant.js.
"""

import re

from .calculations import affordability_check, analyse_cashflow, fifty_thirty_twenty

DISCLAIMER = (
    "This is general financial education, not personalised financial advice. "
    "Check the fine print and speak to a qualified adviser before making big money decisions."
)

SUGGESTIONS = {
    "afford": [
        {"label": "Plan a budget", "to": "/app/budget"},
        {"label": "Check affordability", "to": "/app/calculators"},
    ],
    "save": [
        {"label": "Set a savings goal", "to": "/app/goals"},
        {"label": "Savings calculator", "to": "/app/calculators"},
    ],
    "debt": [{"label": "Debt calculator", "to": "/app/calculators"}],
    "learn": [{"label": "Open the Learning Hub", "to": "/app/learn"}],
}


def r(value):
    return f"R{value:,.0f}"


def percent(value, decimals=0):
    return f"{float(value):.{decimals}f}%"


def extract_amounts(text):
    found = re.findall(r"r\s?(\d[\d\s,]*(?:\.\d+)?)", text, flags=re.I)
    values = []
    for item in found:
        try:
            value = float(item.replace(",", "").replace(" ", ""))
        except ValueError:
            continue
        if value > 0:
            values.append(value)
    return sorted(values, reverse=True)


def extract_pair(text, keyword):
    match = re.search(rf"(?:{keyword})[^\d]{{0,30}}?r?\s?(\d[\d\s,]*)", text, flags=re.I)
    if not match:
        return None
    try:
        return float(match.group(1).replace(",", "").replace(" ", ""))
    except ValueError:
        return None


def has_any(text, words):
    return any(word in text for word in words)


def _reply(text, metrics=None, suggestions=None, intent="fallback"):
    return {
        "reply": text,
        "metrics": metrics or [],
        "suggestions": suggestions or [],
        "intent": intent,
    }


def answer_afford(text, state):
    amounts = extract_amounts(text)
    income = None
    if re.search(r"i earn|my salary|my income", text):
        income = extract_pair(text, r"i earn|my salary|my income") or (amounts[0] if amounts else None)
    elif re.search(r"salary|income|earn", text) and amounts:
        income = amounts[0]

    income = income or float((state.get("profile") or {}).get("income") or 0)
    rent = extract_pair(text, r"rent|accommodation")

    commitment = None
    for value in amounts:
        if value not in (income, rent):
            commitment = value
            break
    commitment = commitment or extract_pair(text, r"contract|repayment|phone|car|loan") or 0

    if not income:
        return _reply(
            "I need your monthly income to work this out.\n\n"
            'Try: "I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?"\n\n'
            + DISCLAIMER,
            suggestions=SUGGESTIONS["afford"],
            intent="afford",
        )

    commitments = [{"label": "Rent", "amount": rent}] if rent else []
    result = affordability_check(income, commitments, commitment)
    bands = result["bands"]

    metrics = [
        {"label": "Income", "value": r(income)},
        {"label": "Commitments", "value": r(result["total"])},
        {"label": "Left to budget", "value": r(result["afterCommitments"])},
    ]

    parts = [result["headline"], ""]
    if rent:
        share = rent / income * 100
        guide = "within that guide" if share <= 30 else "above that guide"
        parts.append(f"Your rent of {r(rent)} already uses {percent(share)} of your income. "
                     f"The rough guide for housing costs is under 30%, so you are {guide}.")
    elif result["existing"] > 0:
        parts.append(
            f"Your existing commitments use {percent(result['existingRatio'])} of your income "
            f"({r(result['existing'])})."
        )

    if commitment:
        parts.append(
            f"Adding {r(commitment)} would take your commitments to {r(result['total'])} — "
            f"{percent(result['ratio'])} of your income — and leave "
            f"{r(result['afterCommitments'])} for everything else."
        )
        parts.append("")
        parts.append(
            f"As a guide, a month at {r(income)} splits roughly into needs {r(bands['needs'])}, "
            f"wants {r(bands['wants'])} and savings {r(bands['savings'])}."
        )

    parts.append("")
    if result["verdict"] == "comfortable":
        parts.append("It looks workable, but check your full budget first so the small costs do not surprise you.")
    elif result["verdict"] == "caution":
        parts.append(
            "Compare cheaper options, and ask whether you can delay the commitment for a month "
            "while you rebuild your buffer."
        )
    else:
        parts.append(
            "At this level the commitment would squeeze your essentials. Consider a cheaper option first."
        )
    parts += ["", DISCLAIMER]

    return _reply("\n".join(parts), metrics, SUGGESTIONS["afford"], "afford")


def answer_saving(text, state):
    income = float((state.get("profile") or {}).get("income") or 0) or (
        extract_amounts(text)[0] if extract_amounts(text) else 0
    )

    if not income:
        return _reply(
            "A good starting rule is to save first, spend what is left.\n\n"
            "• Beginners: at least R100 a month, on pay day.\n"
            "• Steady earners: aim for 10% of income.\n"
            "• Comfortable earners: try 50/30/20 — 50% needs, 30% wants, 20% savings.\n\n"
            "Tell me your monthly income and I will split it for you.\n\n" + DISCLAIMER,
            suggestions=SUGGESTIONS["save"],
            intent="save",
        )

    split = fifty_thirty_twenty(income)
    cashflow = analyse_cashflow(income, state.get("expenses") or [])

    parts = [
        f"Here is a 50/30/20 split for {r(income)} a month:",
        "",
        f"• Needs (rent, food, transport, data): {r(split['needs'])}",
        f"• Wants (airtime extras, outings, subscriptions): {r(split['wants'])}",
        f"• Savings and investing: {r(split['savings'])}",
        "",
    ]

    if state.get("expenses"):
        parts += [
            f"Right now your recorded spending is {r(cashflow['totalExpenses'])}, "
            f"which leaves {r(cashflow['remaining'])} — a savings rate of "
            f"{percent(cashflow['savingsRate'])}.",
            "",
            (
                "That is a solid habit. Consider moving your surplus to a goal automatically on pay day."
                if cashflow["savingsRate"] >= 10
                else "To reach 20%, look at your three biggest expense lines first — that is where the wins are."
            ),
            "",
        ]

    parts += [
        "A practical order: 1) a R1,000 mini buffer, 2) three months of essential expenses, "
        "3) then longer-term investing.",
        "",
        DISCLAIMER,
    ]
    return _reply("\n".join(parts), suggestions=SUGGESTIONS["save"], intent="save")


def answer_emergency(text, state):
    essentials = extract_amounts(text)[0] if extract_amounts(text) else 0
    if not essentials:
        essentials = sum(
            float(e.get("amount") or 0)
            for e in (state.get("expenses") or [])
            if str(e.get("category", "")).lower() in {"housing", "food", "transport", "utilities", "family"}
        )

    parts = [
        "An emergency fund is money you only touch when something unexpected happens — "
        "a medical bill, a phone repair, losing work for two weeks.",
        "",
        "The standard target is three to six months of essential expenses. In practice, start smaller:",
        "",
        "1. First R1,000 as a mini buffer so a small surprise does not become debt.",
        "2. Then build to one month of essentials.",
        "3. Then work towards three months.",
    ]

    if essentials:
        target = essentials * 3
        parts += [
            "",
            f"At {r(essentials)} of essential expenses, a three-month fund is {r(target)}.",
            f"That is about {r(target / 12)} a month over a year, or {r(target / 52)} a week.",
        ]

    parts += [
        "",
        "Keep it in a separate account you cannot tap easily — a separate savings account or fixed deposit.",
        "",
        DISCLAIMER,
    ]
    return _reply("\n".join(parts), suggestions=SUGGESTIONS["save"], intent="emergency")


def answer_difference(text):
    if has_any(text, ["invest", "shares", "etf", "stock", "unit trust", "crypto"]):
        body = (
            "Saving vs investing, simply:\n\n"
            "Saving keeps money safe and accessible — a savings account or fixed deposit. "
            "Low risk, low return, good for money you need soon.\n\n"
            "Investing buys assets that can grow over time — shares, exchange traded funds, bonds, property. "
            "Higher potential return, but the value can fall in the short term, so it suits money you will "
            "not need for five years or more.\n\n"
            "A common order in South Africa: emergency fund first, then long-term investing through a "
            "tax-free savings account (up to R36,000 a year and R500,000 in your lifetime) or a retirement annuity.\n\n"
            "Do not invest money you may need next month.\n\n"
        )
    else:
        body = (
            "Saving means setting money aside for a specific goal or an emergency, usually in a low-risk "
            "account where the balance stays steady.\n\n"
            "Investing means putting money to work in assets that can grow in value over time, accepting "
            "that the value can also fall in the short term.\n\n"
            "Simple rule: money you need in the next year → save it. Money you will not touch for five or "
            "more years → consider investing it.\n\n"
        )
    return _reply(body + DISCLAIMER, suggestions=SUGGESTIONS["learn"], intent="difference")


def answer_vanishing(state):
    income = float((state.get("profile") or {}).get("income") or 0)
    expenses = state.get("expenses") or []

    if not expenses:
        return _reply(
            "Money rarely disappears in one big purchase — it leaks through lots of small ones.\n\n"
            "The fastest fix is to write down every expense for seven days, then group them: housing, "
            "transport, food, data, family, fun. Almost everyone finds two or three surprise lines.\n\n"
            "Log a week of spending in the Budget tab and I will show you where your money is actually going.\n\n"
            + DISCLAIMER,
            suggestions=[{"label": "Log my spending", "to": "/app/budget"}],
            intent="vanishing",
        )

    cashflow = analyse_cashflow(income, expenses)
    grouped = {}
    for expense in expenses:
        key = expense.get("category") or "Other"
        grouped[key] = grouped.get(key, 0) + float(expense.get("amount") or 0)

    total = cashflow["totalExpenses"] or 1
    top = sorted(grouped.items(), key=lambda item: item[1], reverse=True)[:3]

    parts = [
        f"Based on your entries, you earn {r(cashflow['monthlyIncome'])} and spend "
        f"{r(cashflow['totalExpenses'])}, leaving {r(cashflow['remaining'])}.",
        "",
        "Your three biggest lines are:",
    ]
    for index, (category, amount) in enumerate(top, start=1):
        parts.append(f"{index}. {category}: {r(amount)} ({percent(amount / total * 100)} of your spending)")
    parts += [
        "",
        (
            "You are spending more than you earn — pick the biggest non-essential line and cut it by 20% this month."
            if cashflow["remaining"] < 0
            else "You are spending less than you earn. The next step is to move the leftover to a goal before the month ends."
        ),
        "",
        DISCLAIMER,
    ]
    return _reply("\n".join(parts), suggestions=[{"label": "Open my budget", "to": "/app/budget"}], intent="vanishing")


def answer_debt(text):
    if has_any(text, ["credit score", "credit record"]):
        body = (
            "A credit score is a number (typically 300 to 850 in South Africa) that summarises how you "
            "have handled credit.\n\n"
            "What moves it up: paying on time, keeping balances low, a healthy mix of credit, and not "
            "applying for lots of credit at once.\n\n"
            "What moves it down: late or missed payments, judgments, defaults, and using more than about "
            "30% of your credit limits.\n\n"
            "Check your score for free through the major bureaux at least once a year for errors and fraud.\n\n"
        )
    elif has_any(text, ["interest", "apr", "rate"]):
        body = (
            "Interest is the price you pay for borrowing money, shown as a percentage per year.\n\n"
            "Example: R10,000 at 15% a year costs about R1,250 in interest in the first year if you make no "
            "repayments. Interest compounds — you pay interest on interest — so expensive debt grows fast.\n\n"
            "Two useful moves: pay more than the minimum on the debt with the highest rate, and always compare "
            "the total cost, not just the monthly instalment.\n\n"
        )
    else:
        body = (
            "A workable debt method, in order:\n\n"
            "1. List every debt: balance, interest rate and minimum payment.\n"
            "2. Pay the minimums on all of them.\n"
            "3. Throw every extra rand at the highest interest rate first — that saves the most money.\n"
            "4. Stop new debt while you repay, and avoid rolling balances into new credit.\n\n"
            "Use the debt repayment calculator to see how fast a given monthly payment clears a balance.\n\n"
        )
    return _reply(body + DISCLAIMER, suggestions=SUGGESTIONS["debt"], intent="debt")


def answer_budget():
    body = (
        "A budget is simply a plan for your money before the month starts.\n\n"
        "The 50/30/20 version is a good starting point:\n"
        "• 50% needs — rent, transport, food, data, electricity, school fees\n"
        "• 30% wants — takeaways, airtime extras, streaming, outings\n"
        "• 20% savings, extra debt repayments and goals\n\n"
        "Steps: 1) write your income, 2) list fixed costs first, 3) set a limit for each category, "
        "4) track spending weekly, 5) adjust at month end.\n\n"
        "In South Africa also remember the costs that catch people out: municipal accounts, funeral "
        "contributions, stokvel contributions and family support.\n\n"
    )
    return _reply(body + DISCLAIMER, suggestions=[{"label": "Build my budget", "to": "/app/budget"}], intent="budget")


def answer_scam():
    body = (
        "Common financial scams in South Africa to watch for:\n\n"
        '• "SARS refund" or "prize" messages with a link — official bodies never ask for passwords or '
        "one-time pins by SMS.\n"
        '• Advance-fee loans that demand an "activation" or "insurance" payment first.\n'
        '• Someone offering to buy items from your card or to "share" an account with you.\n'
        '• Investment schemes promising fixed high returns with no risk — the classic warning sign.\n'
        "• Romance or social media contacts who quickly move the conversation to money or crypto.\n\n"
        "Golden rules: never share your one-time pin or password, verify requests on an official number, "
        "and if the return sounds too good to be true, walk away.\n\n"
        "Report fraud to your bank immediately and log a case with the SAPS.\n\n"
    )
    return _reply(body + DISCLAIMER, suggestions=SUGGESTIONS["learn"], intent="scam")


def answer_south_africa(text):
    if "stokvel" in text:
        body = (
            "A stokvel is a savings or investment club where members contribute fixed amounts regularly "
            "and take turns receiving the payout, or save together for a goal.\n\n"
            "Good stokvels: clear written rules, named office bearers, a bank account in the club name, "
            "and transparent records.\n\n"
            "Warning signs: cash only, no receipts, pressure to recruit new members, guaranteed returns, "
            "or payments that only work if you bring in others.\n\n"
        )
    elif "nsfas" in text:
        body = (
            "If your money comes from NSFAS or a student allowance, budget it over the whole period it must "
            "last — not the week it arrives.\n\n"
            "Split it the same way as a salary: accommodation and food first, then transport and study "
            "materials, then a small buffer for emergencies.\n\n"
        )
    elif "grant" in text or "sassa" in text:
        body = (
            "When a grant is your household income, prioritise food, electricity, transport and school costs "
            "before anything discretionary.\n\n"
            "Keep grant money separate from other money in the house if you can — separate accounts make it "
            "far easier to see what is left.\n\n"
            "SASSA will never ask you to pay money to receive a grant, and will never ask for your PIN.\n\n"
        )
    else:
        body = (
            "In South Africa, employees are taxed through PAYE deducted by the employer, and you can check "
            "your income tax on the SARS eFiling or MobiApp.\n\n"
            "If you freelance or do gig work you may need to register as a taxpayer, and to charge VAT once "
            "you pass the R1 million threshold in a 12-month period. Keep every invoice from day one.\n\n"
        )
    return _reply(body + DISCLAIMER, suggestions=SUGGESTIONS["learn"], intent="south-africa")


def answer_goal(state):
    goals = state.get("goals") or []
    if not goals:
        return _reply(
            "A savings goal needs four things: a target amount, a date, the amount you have today, and a "
            "monthly contribution.\n\n"
            "Start with something reachable in three to six months — a phone, a course, or your first "
            "R1,000 emergency buffer. Small wins build the habit.\n\n"
            "I can calculate how many months a goal will take in the Savings calculator.\n\n" + DISCLAIMER,
            suggestions=SUGGESTIONS["save"],
            intent="goal",
        )

    nearest = sorted(goals, key=lambda g: float(g.get("target", 0)) - float(g.get("saved", 0)))[0]
    percent_done = round(float(nearest.get("saved", 0)) / max(1, float(nearest.get("target", 0))) * 100)
    monthly = float(nearest.get("monthly") or 0)

    body = (
        f"Your goal \"{nearest.get('name')}\" is {r(float(nearest.get('saved', 0)))} of "
        f"{r(float(nearest.get('target', 0)))} ({percent_done}%).\n\n"
        + (
            f"At {r(monthly)} a month you are on track — keep the contribution automatic so it happens "
            "before you can spend it."
            if monthly > 0
            else "Set a monthly contribution so the goal has a real date attached."
        )
        + "\n\n"
        + DISCLAIMER
    )
    return _reply(body, suggestions=SUGGESTIONS["save"], intent="goal")


def answer_greeting():
    body = (
        "Hi — I am the MoneyWise assistant. I explain money concepts and help you think through a decision "
        "using your own numbers.\n\n"
        "Try one of these:\n"
        '• "I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?"\n'
        '• "How much should I save?"\n'
        '• "How do I start an emergency fund?"\n'
        '• "What is the difference between saving and investing?"\n'
        '• "Why does my money disappear so quickly?"\n\n'
        + DISCLAIMER
    )
    return _reply(body, suggestions=SUGGESTIONS["learn"], intent="greeting")


def answer_fallback():
    body = (
        "I am not sure I have a clear answer for that one yet.\n\n"
        "I can help with budgeting, saving, emergency funds, debt and interest, credit scores, affordability "
        'checks, saving vs investing, scams, and South African money topics like stokvels, grants and NSFAS.\n\n'
        'Try: "Can I afford a R1,500 phone contract on R7,500?"\n\n'
        + DISCLAIMER
    )
    return _reply(
        body,
        suggestions=[
            {"label": "Can I afford something?", "to": "/app/calculators"},
            {"label": "How much should I save?", "to": "/app/goals"},
            {"label": "Understanding debt", "to": "/app/learn"},
            {"label": "Avoiding scams", "to": "/app/learn"},
        ],
        intent="fallback",
    )


INTENTS = [
    ("afford", ["afford", "can i buy", "can i get", "can i take", "phone contract", "should i buy"], "afford"),
    ("vanishing", ["disappear", "where does my money", "money go", "overspend"], "vanishing"),
    ("emergency", ["emergency fund", "emergency money", "rainy day", "buffer"], "emergency"),
    ("difference", ["difference between", "saving vs", "vs investing", "invest vs"], "difference"),
    ("invest", ["invest", "shares", "etf", "unit trust"], "difference"),
    ("debt", ["debt", "interest", "credit", "loan", "repayment", "instalment"], "debt"),
    ("scam", ["scam", "fraud", "phishing", "one-time pin", "otp", "suspicious message"], "scam"),
    ("south-africa", ["stokvel", "nsfas", "grant", "sassa", "sars", "tax", "funeral", "taxi"], "south-africa"),
    ("goal", ["goal", "save for", "target", "car fund", "deposit"], "goal"),
    ("save", ["how much should i save", "how much to save", "start saving", "50/30/20"], "save"),
    ("budget", ["budget", "how do i budget", "plan my money", "50 30 20"], "budget"),
    ("greeting", ["hi", "hello", "hey", "good day", "help"], "greeting"),
]


def ask(question, state=None):
    text = str(question or "").lower().strip()
    state = state or {}

    if not text:
        return answer_greeting()

    for name, words, handler in INTENTS:
        if not has_any(text, words):
            continue
        if handler == "afford":
            return answer_afford(text, state)
        if handler == "vanishing":
            return answer_vanishing(state)
        if handler == "emergency":
            return answer_emergency(text, state)
        if handler == "difference":
            return answer_difference(text)
        if handler == "debt":
            return answer_debt(text)
        if handler == "budget":
            return answer_budget()
        if handler == "scam":
            return answer_scam()
        if handler == "south-africa":
            return answer_south_africa(text)
        if handler == "goal":
            return answer_goal(state)
        if handler == "save":
            return answer_saving(text, state)
        if handler == "greeting":
            return answer_greeting()

    if re.search(r"r\s?\d|earn|salary|income", text):
        return answer_afford(text, state)

    return answer_fallback()
