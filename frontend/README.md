# Frontend (React)

This is the **website** part of CreditPilot — what you see and click.

The backend (FastAPI) is the kitchen.
This frontend is the dining room.

## What we use

| Tool | Plain English |
|------|----------------|
| **React** | Library for building UI from components |
| **TypeScript** | JavaScript + types (catches mistakes earlier) |
| **Vite** | Fast tool to run/build the React app |
| **Tailwind CSS** | Utility classes for styling (`className="mt-4"`) |
| **React Router** | Changes pages based on the URL (`/login`, `/`) |

## Folder map

```
frontend/src/
├── api/           ← talks to FastAPI (fetch wrappers)
├── auth/          ← login state (JWT token)
├── components/    ← reusable UI pieces
├── pages/         ← full screens (Login, Register, Dashboard)
├── types.ts       ← shared TypeScript shapes
├── App.tsx        ← route map
├── main.tsx       ← app entry point
└── index.css      ← global styles + Tailwind
```

## Run it

**Terminal 1 — backend** (must be running first):

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

Open http://127.0.0.1:5173

## Flow to try

1. Create an account at `/register`
2. Land on the dashboard
3. Add Chase Freedom Rise ($500 limit, $120 balance)
4. See ~24% utilization and the paydown tip
