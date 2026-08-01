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
| **React Router** | Changes pages based on the URL |
| **Recharts** | Charts for utilization |

## Folder map

```
frontend/src/
├── api/              ← talks to FastAPI (fetch wrappers)
├── auth/             ← login state (JWT token)
├── components/       ← reusable UI (nav layout, bars, badges)
├── hooks/            ← reusable data logic (load cards + metrics)
├── lib/              ← tiny helpers (money formatting)
├── pages/            ← full screens
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── UtilizationPage.tsx
│   ├── SimulatorPage.tsx
│   ├── TipsPage.tsx
│   ├── AddCardPage.tsx
│   └── CardDetailPage.tsx
├── types.ts          ← shared TypeScript shapes
├── App.tsx           ← route map
├── main.tsx          ← app entry point
└── index.css         ← global styles + Tailwind
```

## Screens

| URL | What it does |
|-----|----------------|
| `/login`, `/register` | Auth |
| `/` | Dashboard overview |
| `/utilization` | Tracker + chart |
| `/simulator` | “What if I pay $X?” |
| `/tips` | Rule-based coach tips |
| `/cards/new` | Add a card |
| `/cards/:id` | Edit / delete a card |

## Run it

**Terminal 1 — backend:**

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
