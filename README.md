# CreditPilot

A personal finance app that helps you understand credit cards, track **utilization**, and get recommendations to improve your credit profile.

> Built because learning credit as a student is confusing — utilization, statement dates, and payment timing all matter, and most people are never taught how they connect.

---

## Big-picture vocabulary (read this first)

| Term | Plain English |
|------|----------------|
| **Frontend** | The website you see and click (we'll build with React later) |
| **Backend** | The brain/API that does math, auth, and talks to the database |
| **API** | A menu of URLs the frontend can call (like `/cards`) |
| **Database** | Where we store users and cards permanently |
| **SQLite** | A beginner-friendly database stored as one file on your computer |
| **PostgreSQL** | A popular production database (we'll use later with Docker) |
| **Docker** | Runs software (like Postgres) in a tidy "shipping container" |
| **Endpoint** | One specific URL + action, e.g. `POST /auth/register` |
| **CRUD** | Create, Read, Update, Delete — the 4 basic data operations |
| **JWT** | A temporary login "wristband" proving who you are |
| **Utilization** | `balance ÷ credit_limit` (e.g. $120 / $500 = 24%) |

### How the pieces talk

```
You (browser) → Frontend (later) → Backend API (FastAPI) → Database (Postgres)
```

Right now we only built the **backend + database**. That's Week 1.

---

## Project folders

```
P1/
├── backend/          ← Python API (FastAPI)
│   ├── app/          ← application code
│   ├── .env          ← local settings (not for GitHub secrets in real deploys)
│   └── requirements.txt
├── frontend/         ← React app (Week 2 — empty for now)
├── docs/             ← notes
└── docker-compose.yml ← starts Postgres with one command
```

---

## Week 1 setup (run the backend)

We start with **SQLite** (a database in one file) so you can learn without Docker.
Postgres remains the long-term plan once Docker Desktop is running.

### 1) Activate the Python virtual environment

A **virtual environment** is a private Python bubble for this project, so packages don't clash with other projects.

```bash
cd backend
source .venv/bin/activate
```

Your terminal prompt usually changes to show `(.venv)`.

### 2) Install packages

```bash
pip install -r requirements.txt
```

### 3) Start the API server

```bash
uvicorn app.main:app --reload
```

- `uvicorn` = the web server program
- `app.main:app` = "use the `app` object in `app/main.py`"
- `--reload` = auto-restart when you edit code (great for learning)

The first run creates `backend/creditpilot.db` automatically.

Open the interactive docs:

- Swagger UI: http://127.0.0.1:8000/docs
- Health check: http://127.0.0.1:8000/health

---

## Try the happy path in `/docs`

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` (use email as "username")
3. Click **Authorize** and paste the `access_token`
4. **Create a card**: `POST /cards` with:

```json
{
  "card_name": "Chase Freedom Rise",
  "credit_limit": 500,
  "balance": 120,
  "statement_day": 25,
  "due_day": 22
}
```

5. **Metrics**: `GET /cards/{id}/metrics`  
   You should see ~24% utilization and status **Good**.

---

## What each important file does

| File | Job |
|------|-----|
| `app/main.py` | Front door of the API |
| `app/config.py` | Reads settings from `.env` |
| `app/database.py` | Connects to Postgres |
| `app/models.py` | Database tables as Python classes |
| `app/schemas.py` | JSON shapes for requests/responses |
| `app/auth.py` | Passwords + JWT tokens |
| `app/routers/auth.py` | Register/login endpoints |
| `app/routers/cards.py` | Credit card CRUD + metrics |
| `app/services/utilization.py` | The credit math |

---

## Next (Week 2)

Build the React dashboard so you can see cards in a real UI instead of only `/docs`.
