from app.services.confidence import calculate_confidence

SAMPLE_STATE = {
    "profile": {"name": "Thando", "income": 8000, "source": "Salary"},
    "expenses": [
        {"label": "Rent", "category": "Housing", "amount": 2500},
        {"label": "Taxi", "category": "Transport", "amount": 1200},
        {"label": "Groceries", "category": "Food", "amount": 1500},
        {"label": "Data", "category": "Data & airtime", "amount": 400},
        {"label": "Family", "category": "Family support", "amount": 500},
        {"label": "Outings", "category": "Entertainment", "amount": 400},
    ],
    "budget": [
        {"name": "Housing", "icon": "🏠", "budget": 2500, "spent": 2300},
        {"name": "Food", "icon": "🛒", "budget": 1500, "spent": 1200},
        {"name": "Transport", "icon": "🚕", "budget": 1200, "spent": 1100},
        {"name": "Data & airtime", "icon": "📱", "budget": 400, "spent": 380},
        {"name": "Family support", "icon": "👨‍👩‍👧", "budget": 500, "spent": 500},
        {"name": "Entertainment", "icon": "🎉", "budget": 400, "spent": 450},
    ],
    "goals": [
        {"name": "Car", "target": 60000, "saved": 18500, "monthly": 2000},
        {"name": "Emergency fund", "target": 15000, "saved": 4500, "monthly": 600, "emergency": True, "coverMonths": 3},
    ],
    "debts": [],
    "learning": {"completed": ["budgeting-101"], "total": 7, "quizBest": 83},
}


def test_score_is_bounded_and_has_five_pillars():
    result = calculate_confidence(SAMPLE_STATE)

    assert 0 <= result["overall"] <= 100
    assert len(result["pillars"]) == 5
    assert {p["key"] for p in result["pillars"]} == {
        "budgeting",
        "saving",
        "debt",
        "emergency",
        "knowledge",
    }
    assert all(0 <= p["score"] <= 100 for p in result["pillars"])


def test_empty_state_scores_low_but_not_negative():
    result = calculate_confidence({})

    assert result["overall"] >= 0
    assert result["level"]["name"] in {"Starter", "Building"}


def test_summary_names_strongest_and_weakest_areas():
    result = calculate_confidence(SAMPLE_STATE)

    assert result["strongest"]["label"] in {p["label"] for p in result["pillars"]}
    assert result["weakest"]["label"] in {p["label"] for p in result["pillars"]}
    assert "strongest area" in result["summary"]
    assert "next opportunity" in result["summary"]


def test_debt_pillar_is_neutral_when_no_debt_is_recorded():
    result = calculate_confidence(SAMPLE_STATE)
    debt = next(p for p in result["pillars"] if p["key"] == "debt")

    assert debt.get("neutral") is True
    assert debt["score"] == 55
