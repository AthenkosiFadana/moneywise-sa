# API documentation

Base URL (local): `http://localhost:5000/api`

The Vite dev server proxies `/api` to this server, so browser code can call
`/api/...` directly. All bodies are JSON.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | service health |
| GET | `/api/state` | full demo state |
| POST | `/api/state` | replace/merge demo state |
| GET | `/api/budget` | income + budget summary |
| POST | `/api/budget` | save budget categories |
| GET | `/api/expenses` | expenses + cash-flow analysis |
| POST | `/api/expenses` | save expenses |
| POST | `/api/calculators/savings` | months to a savings goal |
| POST | `/api/calculators/emergency` | emergency fund target |
| POST | `/api/calculators/debt` | debt repayment schedule |
| POST | `/api/calculators/split` | 50/30/20 split |
| POST | `/api/insights/confidence` | Money Confidence Score |
| POST | `/api/assistant/ask` | educational assistant reply |
| GET | `/api/learning` | lesson index |

---

## GET /api/health

```json
{ "status": "ok", "service": "moneywise-sa-api", "version": "1.0.0" }
```

## GET /api/state · POST /api/state

`POST` body: `{ "state": { ... } }` → `{ "ok": true, "updated_at": "ISO-8601" }`

## GET /api/budget

```json
{
  "income": 8000,
  "budget": [ { "id": "cat-1", "name": "Housing", "budget": 2500, "spent": 2300 } ],
  "categories": {
    "rows": [ { "name": "Housing", "remaining": 200, "usedPercent": 92, "overBy": 0, "status": "ok" } ],
    "totalBudget": 6500,
    "totalSpent": 5930,
    "totalRemaining": 570,
    "alerts": [ { "tone": "negative", "text": "Entertainment budget exceeded by R50." } ],
    "spendRate": 91.2,
    "hasData": true
  }
}
```

`POST /api/budget` body: `{ "budget": [ { "name": "Housing", "budget": 2500, "spent": 2300 } ] }`

## GET /api/expenses

```json
{
  "expenses": [ { "label": "Rent", "category": "Housing", "amount": 2500 } ],
  "cashflow": {
    "monthlyIncome": 8000,
    "totalExpenses": 6500,
    "remaining": 1500,
    "savingsRate": 18.75,
    "status": "surplus",
    "tone": "positive",
    "message": "You're currently spending less than you earn."
  }
}
```

## POST /api/calculators/savings

Request:

```json
{ "target": 10000, "current": 2000, "monthly": 800 }
```

Response:

```json
{
  "valid": true,
  "reached": false,
  "goal": 10000,
  "saved": 2000,
  "contribution": 800,
  "shortfall": 8000,
  "progress": 20,
  "months": 10,
  "monthsLabel": "10 months",
  "projectedDate": "Jun 2027",
  "weekly": 184.62,
  "daily": 26.3,
  "message": "At R800 per month you will reach your goal in about 10 months."
}
```

## POST /api/calculators/emergency

Request: `{ "essentials": 5000, "months": 3 }` → Response:
`{ "target": 15000, "monthlyNeeded12": 1250, "weeklyNeeded52": 288.46, "valid": true }`

## POST /api/calculators/debt

Request: `{ "principal": 10000, "monthly": 1000, "annualRate": 15 }`

Response includes `months`, `monthsLabel`, `projectedDate`, `totalPaid`,
`totalInterest`, `overpayment` and a `schedule` array of up to 12 rows:
`{ "month", "opening", "payment", "interest", "principal", "closing" }`.

Invalid inputs return `{ "valid": false, "message": "…" }` — for example a payment
lower than the monthly interest.

## POST /api/calculators/split

Request: `{ "income": 8000 }` → `{ "needs": 4000, "wants": 2400, "savings": 1600 }`

## POST /api/insights/confidence

Request: `{ "state": { "profile": { "income": 8000 }, "expenses": [], "budget": [] } }`

Response:

```json
{
  "overall": 61,
  "level": { "name": "Confident", "tone": "good" },
  "pillars": [
    { "key": "budgeting", "label": "Budgeting", "score": 72, "tone": "good",
      "detail": "…", "tip": "…" }
  ],
  "strongest": { "key": "budgeting", "label": "Budgeting" },
  "weakest": { "key": "knowledge", "label": "Financial knowledge" },
  "summary": "Your strongest area is budgeting. Your next opportunity is financial knowledge — …"
}
```

## POST /api/assistant/ask

Request: `{ "question": "I earn R7,500 and my rent is R3,000. Can I afford a R1,500 phone contract?", "state": {} }`

Response:

```json
{
  "intent": "afford",
  "reply": "Your commitments take up a large share of your income. …",
  "metrics": [
    { "label": "Income", "value": "R7,500" },
    { "label": "Commitments", "value": "R4,500" },
    { "label": "Left to budget", "value": "R3,000" }
  ],
  "suggestions": [ { "label": "Plan a budget", "to": "/app/budget" } ]
}
```

Recognised intents: `afford`, `vanishing`, `emergency`, `difference`, `debt`,
`budget`, `scam`, `south-africa`, `goal`, `save`, `greeting`, `fallback`.

`400 { "error": "question is required" }` when the question is empty.

## GET /api/learning

```json
{ "lessons": [ { "slug": "budgeting-101", "title": "Budgeting basics", "tag": "Budgeting" } ],
  "count": 7, "quizQuestions": 6 }
```

---

## Errors

| Status | Meaning |
| --- | --- |
| 400 | payload failed validation |
| 404 | unknown route |
| 405 | method not allowed |

Errors return `{ "error": "message" }`.

## Running the API

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # macOS/Linux: .venv/bin/pip
python run.py                                    # http://localhost:5000
```
