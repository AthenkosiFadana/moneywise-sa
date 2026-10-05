# Development roadmap

The project is built like a real product: research first, then design, then
code, then hardening, then shipping.

## Phase 1 — Ideation ✅

- Problem statement · `docs/problem-statement.md`
- User personas · `docs/user-personas.md`
- User stories and MVP definition · `docs/user-stories.md`
- Feature set, business model, social impact

## Phase 2 — UX/UI ✅

- Mobile-first layout with a bottom navigation bar (Home, Budget, Goals, Insights,
  Learn, Calculators, Profile) plus an assistant floating action button
- Landing page: problem, features, South African context, impact, call to action
- Design system in `frontend/src/index.css`: brand green + gold palette, cards,
  inputs, buttons, chips
- Components in `frontend/src/components/ui.jsx` reused across every page

## Phase 3 — Frontend ✅

- Vite + React 19 + React Router + Tailwind CSS v4
- Pages: Landing, Dashboard, Budget, Goals, Insights, Learn, LearnArticle,
  Calculators, Assistant, Profile
- State: `AppContext` with localStorage persistence and typed actions
- Logic: `utils/money.js`, `utils/calculations.js`, `utils/confidence.js`,
  `utils/assistant.js`
- Verification: `npm run lint` and `npm run build` pass

## Phase 4 — Backend / API ✅

- Flask application factory with CORS and error handling
- Blueprints: health, state, budget, expenses, calculators, insights, assistant,
  learning
- Python mirrors of the calculation, confidence and assistant engines
- `services/api.js` in the frontend calls the API with automatic local fallback

## Phase 5 — Database ✅ (interim)

- SQLite repository in `app/store.py` behind a small interface
- Document-shaped state ready to map onto Firestore documents
- Swap path documented in `docs/architecture.md`

## Phase 6 — Advanced functionality ⏳

- [ ] Firebase Authentication (create account, login, sessions)
- [ ] Per-user data in Firestore, synced with the offline cache
- [ ] Charts (income vs spending, goal trajectories)
- [ ] Financial insights and monthly reports
- [ ] AI-assistant upgrade (LLM behind the same `/api/assistant/ask` contract)
- [ ] Notifications: budget warnings, goal milestones, streak reminders
- [ ] Financial challenges calendar and community streaks

## Phase 7 — Testing and security ⏳

- [x] Backend test suite (26 cases: services + endpoints)
- [ ] Frontend unit tests for the calculation modules (Vitest)
- [ ] Component tests (React Testing Library)
- [ ] Input validation hardening on every endpoint
- [ ] Tighten CORS, add rate limiting on the assistant endpoint
- [ ] Dependency audit and secrets review before deployment

## Phase 8 — Deployment ⏳

- [ ] Frontend to Vercel (SPA rewrite rule)
- [ ] API to Render with a health check on `/api/health`
- [ ] Environment variables for DB path and CORS origins
- [ ] Production smoke test of the full stack

## Phase 9 — Portfolio and community ⏳

- [ ] Professional README with screenshots, architecture and API docs
- [ ] 60–90 second demo video
- [ ] Push to GitHub with meaningful commit history
- [ ] Add project to CV/portfolio and write a short build thread
- [ ] Collect feedback from 5 real users and iterate

---

## Status summary

| Phase | Status |
| --- | --- |
| 1 Ideation | ✅ Complete |
| 2 UX/UI | ✅ Complete |
| 3 Frontend | ✅ Complete |
| 4 Backend/API | ✅ Complete |
| 5 Database | ✅ Interim (SQLite → Firestore) |
| 6 Advanced | ⏳ Not started |
| 7 Testing/security | 🟡 Backend done, frontend pending |
| 8 Deployment | ⏳ Not started |
| 9 Portfolio | ⏳ Not started |
