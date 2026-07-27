"""
main.py
-------
The front door of the backend.

FastAPI reads this file, creates the app object, and attaches routes.
When you run:
  uvicorn app.main:app --reload

You're saying:
  "Start the web server using the `app` object inside app/main.py"
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, cards

# Create database tables if they don't exist yet.
# (Later we may switch to Alembic migrations — a more professional approach.)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CreditPilot API",
    description="Backend for the Credit Score Optimization Assistant",
    version="0.1.0",
)

# CORS = Cross-Origin Resource Sharing
# Browsers block websites from calling APIs on other addresses unless we allow it.
# When we build the React frontend (localhost:5173), it will call this API (localhost:8000).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plug in our route groups
app.include_router(auth.router)
app.include_router(cards.router)


@app.get("/health")
def health_check() -> dict[str, str]:
    """
    A tiny endpoint to prove the server is alive.
    Like knocking on a door and hearing "I'm home!"
    """
    return {"status": "ok", "app": "CreditPilot"}
