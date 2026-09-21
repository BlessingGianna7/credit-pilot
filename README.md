# CreditPilot

Full-stack credit optimization app that helps users track credit card utilization, simulate paydowns, and get rule-based recommendations around statement timing.

Built to make credit mechanics clearer — utilization, statement dates, and payment timing — the way I wish someone had explained them as a student.

## Features

- JWT auth (signup / login)
- Credit card dashboard (balance, limit, utilization, status)
- Utilization tracker with charts
- Payment simulator (“what if I pay $X?”)
- Rule-based coach tips + in-app statement/due reminders

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | FastAPI, SQLAlchemy, JWT |
| Database | SQLite (local) · PostgreSQL via Docker (optional) |

## Quick start

**Backend**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # if you don't already have .env
uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs

**Frontend** (second terminal)

```bash
cd frontend
npm install
npm run dev
```

App: http://127.0.0.1:5173

## Project structure

```
backend/app/     FastAPI API, auth, cards, recommendations
frontend/src/    React UI (dashboard, utilization, simulator, tips, reminders)
docs/            Learning notes
```

## Note

CreditPilot is educational. It does not pull official FICO/Vantage scores and is not financial advice.
