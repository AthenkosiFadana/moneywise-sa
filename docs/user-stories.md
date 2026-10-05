# User stories and MVP scope

## User stories

### Dashboard

- As a **first-time earner**, I want to enter my income and monthly expenses so that
  I can see what is left after the month.
- As a **user**, I want a plain-language verdict on my cash flow so that I know
  whether I am spending less than I earn.
- As a **user**, I want to see my spending broken down by category so that I can
  spot where the money goes.

### Budget planner

- As a **user**, I want to create spending categories with a monthly limit so that
  I plan before I spend.
- As a **user**, I want the app to warn me when a category is exceeded
  ("Entertainment budget exceeded by R50") so that I can correct course early.
- As a **user**, I want to record what I spent per category so that the plan and
  reality stay comparable.

### Money Confidence Score

- As a **user**, I want a 0–100 score of my financial habits so that I can track
  progress without being judged on how much I earn.
- As a **user**, I want five sub-scores (budgeting, saving, debt, emergency fund,
  knowledge) so that I know exactly what to work on.
- As a **user**, I want the strongest area and next opportunity named for me so
  that I know my next action.

### Learning hub

- As a **beginner**, I want short lessons on budgeting, banking, credit, saving,
  investing, scams and loans so that I can learn in minutes, not hours.
- As a **user**, I want a knowledge check with explanations so that I can test
  myself and improve my knowledge pillar.

### Calculators

- As a **saver**, I want to know how many months a goal will take so that a goal
  becomes a plan.
- As a **user**, I want an emergency-fund target based on my essentials so that I
  know what "enough" means.
- As a **debtor**, I want to see the time and total interest of an instalment plan
  so that I compare the real cost, not the monthly sticker price.
- As a **user**, I want a 50/30/20 split of my income so that I have a simple
  starting structure.

### Savings goals

- As a **user**, I want to create goals with a target, current amount and monthly
  contribution so that I can watch progress.
- As a **user**, I want to add money to a goal so that the progress reflects
  reality.

### Assistant

- As a **user**, I want to ask "can I afford a R1,500 phone contract?" and receive
  an educational breakdown of the ratios involved so that I can decide with numbers.
- As a **user**, I want the assistant to stay educational rather than directive so
  that I keep ownership of the decision.

### Challenges and badges

- As a **user**, I want short challenges (7-day no-spend, R100 saving, subscription
  audit) so that learning turns into practice.
- As a **user**, I want badges for real achievements so that progress feels
  rewarding.

---

## MVP definition (Phase 1–3)

**In scope**

- Mobile-first React app with bottom navigation
- Landing page, dashboard, budget, goals, insights, learn, calculators, profile,
  assistant
- Local persistence (localStorage) so the app works without a login
- Money Confidence Score engine in JavaScript
- Rule-based assistant engine in JavaScript
- Flask REST API mirroring calculations, confidence and assistant logic
- SQLite storage for the API, swap-ready for Firebase

**Explicitly out of scope for the MVP**

- Authentication and multi-user accounts (Phase 6)
- Push notifications and streak reminders (Phase 6)
- Charts library and PDF reports (Phase 6)
- Live LLM integration for the assistant (Phase 6)
- Payments, premium tier and B2B portal (post-MVP)

**Acceptance criteria for the MVP**

1. `npm run build` succeeds and `npm run lint` reports no errors.
2. `pytest` in `backend/` passes.
3. Entering income R8,000 and the six example expenses produces total expenses
   R6,500 and remaining R1,500.
4. Budget with Entertainment R400/R450 raises "Entertainment budget exceeded by R50".
5. Savings goal R10,000 with R2,000 saved and R800/month reports 10 months.
6. Emergency fund of R5,000 essentials at 3 months reports R15,000.
7. The confidence score returns five pillars, each 0–100 and an overall 0–100.
8. The assistant answers the affordability example with income, commitments and
   "left to budget" metrics.
