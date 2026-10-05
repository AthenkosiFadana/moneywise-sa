def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.get_json()["status"] == "ok"


def test_state_round_trip(client):
    payload = {
        "state": {
            "profile": {"name": "Lerato", "income": 5000, "source": "Gig work"},
            "goals": [{"name": "Emergency fund", "target": 9000, "saved": 1500, "monthly": 300}],
        }
    }

    saved = client.post("/api/state", json=payload)
    assert saved.status_code == 200
    assert saved.get_json()["ok"] is True

    loaded = client.get("/api/state").get_json()
    assert loaded["profile"]["name"] == "Lerato"
    assert loaded["goals"][0]["target"] == 9000


def test_budget_endpoint_summarises_categories(client):
    client.post("/api/budget", json={"budget": [{"name": "Housing", "budget": 2500, "spent": 2300}]})

    response = client.get("/api/budget")
    data = response.get_json()

    assert response.status_code == 200
    assert data["categories"]["totalBudget"] == 2500
    assert data["categories"]["totalRemaining"] == 200


def test_budget_rejects_non_list_payload(client):
    response = client.post("/api/budget", json={"budget": {"nope": True}})
    assert response.status_code == 400


def test_savings_calculator(client):
    response = client.post(
        "/api/calculators/savings",
        json={"target": 10000, "current": 2000, "monthly": 800},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["months"] == 10


def test_emergency_calculator(client):
    response = client.post("/api/calculators/emergency", json={"essentials": 5000, "months": 3})
    assert response.get_json()["target"] == 15000


def test_debt_calculator(client):
    response = client.post(
        "/api/calculators/debt",
        json={"principal": 10000, "monthly": 1000, "annualRate": 15},
    )
    data = response.get_json()

    assert data["valid"] is True
    assert data["totalInterest"] > 0


def test_confidence_endpoint(client):
    response = client.post(
        "/api/insights/confidence",
        json={"state": {"profile": {"income": 8000}, "expenses": [], "budget": []}},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert 0 <= data["overall"] <= 100
    assert len(data["pillars"]) == 5


def test_assistant_answers_affordability_questions(client):
    response = client.post(
        "/api/assistant/ask",
        json={"question": "I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?"},
    )
    data = response.get_json()

    assert response.status_code == 200
    assert data["intent"] == "afford"
    assert "R4,500" in data["reply"]
    assert any(m["label"] == "Left to budget" for m in data["metrics"])


def test_assistant_requires_a_question(client):
    response = client.post("/api/assistant/ask", json={"question": "   "})
    assert response.status_code == 400


def test_learning_endpoint_lists_lessons(client):
    data = client.get("/api/learning").get_json()
    assert data["count"] == 7
    assert {"slug", "title", "tag"} <= set(data["lessons"][0].keys())


def test_unknown_route_returns_404(client):
    assert client.get("/api/nope").status_code == 404
