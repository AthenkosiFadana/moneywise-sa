from app.services.calculations import (
    affordability_check,
    analyse_cashflow,
    debt_repayment,
    emergency_fund_target,
    fifty_thirty_twenty,
    summarise_budget,
    savings_projection,
)

SAMPLE_EXPENSES = [
    {"label": "Rent", "category": "Housing", "amount": 2500},
    {"label": "Taxi", "category": "Transport", "amount": 1200},
    {"label": "Groceries", "category": "Food", "amount": 1500},
    {"label": "Data", "category": "Data & airtime", "amount": 400},
    {"label": "Family", "category": "Family support", "amount": 500},
    {"label": "Outings", "category": "Entertainment", "amount": 400},
]


def test_cashflow_matches_the_documented_example():
    cashflow = analyse_cashflow(8000, SAMPLE_EXPENSES)

    assert cashflow["totalExpenses"] == 6500
    assert cashflow["remaining"] == 1500
    assert cashflow["status"] == "surplus"
    assert "spending less than you earn" in cashflow["message"]


def test_cashflow_detects_a_deficit():
    cashflow = analyse_cashflow(3000, SAMPLE_EXPENSES)
    assert cashflow["status"] == "deficit"
    assert cashflow["remaining"] == -3500


def test_budget_summary_flags_the_overspent_category():
    categories = [
        {"name": "Housing", "budget": 2500, "spent": 2300},
        {"name": "Entertainment", "budget": 400, "spent": 450},
    ]
    summary = summarise_budget(categories)

    assert summary["totalBudget"] == 2900
    assert summary["totalSpent"] == 2750
    assert summary["overBudget"][0]["name"] == "Entertainment"
    assert summary["overBudget"][0]["overBy"] == 50
    assert any("Entertainment budget exceeded by R50" in alert["text"] for alert in summary["alerts"])


def test_savings_projection_reaches_the_goal_in_ten_months():
    result = savings_projection(target=10000, current=2000, monthly=800)

    assert result["valid"] is True
    assert result["months"] == 10
    assert result["shortfall"] == 8000


def test_savings_projection_requires_a_contribution():
    result = savings_projection(target=10000, current=2000, monthly=0)
    assert result["valid"] is False


def test_emergency_fund_target_is_three_months_of_essentials():
    result = emergency_fund_target(essentials=5000, months=3)

    assert result["target"] == 15000
    assert result["monthlyNeeded12"] == 1250


def test_debt_is_cleared_with_interest():
    result = debt_repayment(principal=10000, monthly=1000, annual_rate=15)

    assert result["valid"] is True
    assert result["months"] > 10
    assert result["totalInterest"] > 0
    assert result["totalPaid"] > 10000
    assert len(result["schedule"]) == min(12, result["months"])


def test_debt_payment_must_beat_monthly_interest():
    result = debt_repayment(principal=10000, monthly=100, annual_rate=15)
    assert result["valid"] is False
    assert "higher than the interest" in result["message"]


def test_affordability_uses_the_example_from_the_brief():
    result = affordability_check(
        income=7500,
        commitments=[{"label": "Rent", "amount": 3000}],
        new_commitment=1500,
    )

    assert result["total"] == 4500
    assert result["afterCommitments"] == 3000
    assert result["ratio"] == 60
    assert result["verdict"] == "caution"
    assert result["bands"]["needs"] == 3750


def test_fifty_thirty_twenty_split():
    split = fifty_thirty_twenty(8000)
    assert split["needs"] == 4000
    assert split["wants"] == 2400
    assert split["savings"] == 1600
