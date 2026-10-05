# Architecture

```
                        MONEYWISE SA
                             |
                             v
                   +-------------------+
                   |  React frontend   |   Vite + Tailwind CSS (mobile-first)
                   |  pages/components |
                   +---------+---------+
                             |
              +--------------+---------------+
              |                              |
              v                              v
     localStorage store              REST API client
     (offline-first engine)          services/api.js
              |                              |
              |                              |  when reachable
              |                              v
              |                    +--------------------+
              |                    |  Flask REST API    |  /api/*
              |                    +---------+----------+
              |                              |
              |                    +---------+----------+
              |                    |                    |
              |                    v                    v
              |             SQLite storage       Calculation services
              |            (swap for Firebase)   (cashflow, calculators,
              |                                   confidence, assistant)
              |
              v
     Pure JavaScript modules shared by every page
     utils/calculations.js · utils/confidence.js · utils/assistant.js
```

## Principles

### 1. Offline-first, API-enhanced

The browser holds the source of truth for the session. Every number a page shows is
computed locally by pure JavaScript modules, so the app works with no network and no
login. When the Flask API is reachable, the client:

- reports its status in the top bar (`Live` / `Local`)
- posts state changes for persistence
- routes assistant and confidence requests through the API

`services/api.js` wraps every call in a `callWithFallback(path, payload, localFn)`
helper, so a dropped connection degrades to local logic instead of an error screen.

### 2. One algorithm, two implementations

Calculations, the confidence engine and the assistant rules exist in both JavaScript
and Python. The Python side is covered by `backend/tests`, the JavaScript side by
lint/build verification and shared acceptance examples in `docs/user-stories.md`.
The acceptance examples (R8,000 → R1,500, 10-month goal, R15,000 emergency fund) are
asserted in `backend/tests/test_calculations.py`.

### 3. Pure functions for money logic

All money maths lives outside React components:

| Module | Responsibility |
| --- | --- |
| `utils/money.js` | formatting, parsing, date helpers |
| `utils/calculations.js` | cash flow, budgets, savings, emergency fund, debt, affordability |
| `utils/confidence.js` | five-pillar Money Confidence Score |
| `utils/assistant.js` | intent matching and educational replies |
| `store/AppContext.jsx` | state, actions, localStorage persistence |
| `services/api.js` | REST client with local fallback |

That separation keeps the UI declarative and makes the logic testable.

## Frontend structure

```
frontend/src/
├── components/
│   ├── AppShell.jsx      navigation shell, top bar, toast, assistant FAB
│   └── ui.jsx            Card, StatCard, ProgressBar, Modal, Badge, Alert…
├── data/
│   ├── defaults.js       sample profile, SA income sources and categories
│   ├── learning.js       7 lessons + 6-question knowledge check
│   ├── challenges.js     challenges and badges
│   └── nav.js            navigation items
├── pages/                Landing, Dashboard, Budget, Goals, Insights,
│                         Learn, LearnArticle, Calculators, Assistant, Profile
├── services/api.js       REST client
├── store/                AppContext (provider), context, useApp hook
└── utils/                money, calculations, confidence, assistant
```

## Backend structure

```
backend/
├── app/
│   ├── __init__.py       create_app() factory, CORS, error handlers
│   ├── config.py         environment-driven configuration
│   ├── store.py          SQLite repository (the Firebase swap seam)
│   ├── routes/           health, state, budget, calculators, insights,
│   │                     assistant, learning
│   └── services/         calculations.py, confidence.py, assistant.py
├── tests/                26 pytest cases across services and API
├── run.py                dev server on :5000
└── pytest.ini
```

## Data model (MVP)

A single document-style record keeps Phase 5 simple; it maps directly onto
Firestore collections when authentication lands.

```jsonc
{
  "profile":   { "name": "Thando", "income": 8000, "source": "Salary" },
  "expenses":  [ { "id": "…", "label": "Rent", "category": "Housing", "amount": 2500 } ],
  "budget":    [ { "id": "…", "name": "Housing", "icon": "🏠", "budget": 2500, "spent": 2300 } ],
  "goals":     [ { "id": "…", "name": "Car", "target": 60000, "saved": 18500, "monthly": 2000 } ],
  "debts":     [ { "id": "…", "balance": 10000, "payment": 1000, "rate": 15 } ],
  "learning":  { "completed": ["budgeting-101"], "total": 7, "quizBest": 83 },
  "challenges":{ "active": [], "completed": [], "streak": 3 },
  "assistant": [ { "id": "…", "role": "user", "text": "…" } ]
}
```

## Money Confidence Score

| Pillar | Weight | Inputs |
| --- | --- | --- |
| Budgeting | 25% | income recorded, expenses logged, categories tracked, categories within budget, surplus and savings rate |
| Saving | 25% | savings rate vs 10%/20% guides, goals with contributions, average goal progress |
| Debt management | 20% | debt-to-income vs the 15% guide, declared debts, cash-flow sign (neutral 55 when no debt is recorded) |
| Emergency fund | 15% | progress on the emergency goal, months of cover, active contribution |
| Financial knowledge | 15% | lessons completed (60%) + knowledge-check score (40%) |

Overall = Σ(pillar × weight), rounded. Levels: Starter (<40), Building (40–59),
Confident (60–79), MoneyWise (80+).

The score is presented as an **educational indicator**. It is never compared to a
credit score and never implies worth.

## Security notes

- No secrets in the repository; configuration comes from environment variables.
- SQLite file and `.env` files are git-ignored.
- CORS is configurable via `CORS_ORIGINS` (default `*` for local development —
  tighten before deployment).
- The assistant never asks for credentials and repeats a one-time-pin warning.
- Authentication is deliberately deferred to Phase 6; until then, data is
  device-local or stored under a single demo record.

## Deployment plan

| Piece | Target | Notes |
| --- | --- | --- |
| Frontend | Vercel | static build from `frontend/`, SPA rewrites to `index.html` |
| API | Render (or Railway) | `python run.py` replaced by a gunicorn/uvicorn start command |
| Database | Firebase Firestore (Phase 5) | `app/store.py` is the only file that changes |
| Repo | GitHub | trunk-based, one commit per feature |
