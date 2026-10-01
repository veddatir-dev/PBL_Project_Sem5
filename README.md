# AlgoLearn — Adaptive Learning & Simulation System

Full-stack app for SY/TY Computer Engineering students: **Understand** (algorithm visualizer), **Test** (adaptive quiz with grasping power), **Implement** (multi-language code workspace judged via Judge0), plus student dashboards and faculty class analytics.

- **Frontend:** Next.js (App Router) + React + Tailwind (root folder)
- **Backend:** Node.js + Express + MongoDB (Mongoose) + Redis (ioredis) in [`backend/`](backend)
- **Code execution:** Judge0 API (C, C++, Java, Python)

## Quick start

### 0. Prerequisites
- Node.js ≥ 20
- Docker (for MongoDB + Redis), or local installs of both

### 1. Install dependencies
```bash
npm install            # frontend (root)
cd backend && npm install && cd ..
```

### 2. Environment setup
```bash
cp .env.example .env                # frontend: NEXT_PUBLIC_API_URL
cp backend/.env.example backend/.env
```
Backend `.env` values:

| Var | Purpose |
|---|---|
| `PORT` | Backend port (default 4000) |
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection (sessions/tokens, syllabus cache, code-run rate limits) |
| `JWT_SECRET` | JWT signing secret — **change in production** |
| `JWT_EXPIRES_IN` | Token lifetime (default 7d) |
| `JUDGE0_URL` | Judge0 base URL, e.g. `https://judge0-ce.p.rapidapi.com` |
| `JUDGE0_API_KEY` | Judge0 API key (RapidAPI key) |
| `CLIENT_ORIGIN` | Comma-separated allowed origins for CORS |

### 3. Start MongoDB + Redis
```bash
docker compose up -d       # mongo:7 on :27017, redis:7 on :6379
```
(No Docker? Run local `mongod` and `redis-server` on the default ports instead.)

### 4. Seed the database
```bash
npm run seed
```
Loads: SY/TY syllabus (Data Structures, AI, Computer Graphics — 13 topics), 100+ questions per difficulty mix across all topics, 5 coding problems with hidden test cases, 15 students with progress and 1 faculty account.

### 5. Run backend + frontend together
```bash
npm run dev
```
- Frontend: http://localhost:3000 (or the port Next prints if 3000 is busy)
- Backend API: http://localhost:4000/api
- If Next binds a non-3000 port, dev CORS already allows any localhost origin; set `CLIENT_ORIGIN` for production deployments.

### Demo accounts
| Role | Login | Password |
|---|---|---|
| Student | `aarav@college.edu` (or any seeded student email / roll no. `CE01`…`CE15`) | `password123` |
| Faculty | `faculty@college.edu` | `password123` |

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Frontend + backend together (concurrently) |
| `npm run dev:frontend` / `npm run dev:backend` | Individually |
| `npm run seed` | Reset + seed MongoDB |
| `npm run build` / `npm start` | Production frontend |
| `cd backend && npm start` | Production backend |

## API overview
All routes are JWT-protected (`Authorization: Bearer <token>`) except `/auth/*` and `/health`.

| Method & path | Access | Description |
|---|---|---|
| `POST /api/auth/register` | public | Register (student/faculty), returns JWT |
| `POST /api/auth/login` | public | Login by email or roll no. |
| `GET /api/auth/me` | any | Current user profile |
| `GET /api/syllabus` | any | Syllabus tree enriched with per-user progress (Redis-cached) |
| `GET /api/topics/:id` | any | Single topic |
| `GET /api/simulations/:algorithmId` | any | Precomputed animation steps (bfs, dfs, prim, kruskal, bst, astar) |
| `POST /api/simulations/:algorithmId/complete` | any | Mark simulation complete |
| `GET /api/quiz/:topicId/next?difficulty=` | any | Next adaptive question (answer key stripped) |
| `POST /api/quiz/answer` | any | Submit answer → grasp update, next difficulty, weak-concept data |
| `POST /api/quiz/:topicId/finish` | any | Session results: score, grasp, weak concepts, recommendation |
| `GET /api/problems/:topicId` | any | Coding problems for a topic (no hidden tests) |
| `POST /api/code/run` | any | Run code via Judge0 against hidden tests (rate-limited) |
| `GET /api/progress/me` | any | Mastery %, subject bars, trends, activity |
| `GET /api/faculty/class-overview` | **faculty** | Class averages, weak topics, student table |

RBAC is enforced server-side: students receive **403** on faculty endpoints and vice versa.

## Judge0 setup
1. Get a key from [RapidAPI Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce) (or self-host: `docker compose` variants in the Judge0 repo).
2. Put the values in `backend/.env`:
   ```
   JUDGE0_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_API_KEY=your-rapidapi-key
   ```
3. Without these, `POST /code/run` returns a clear **503** explaining what to configure. Runs have a 12s per-submission timeout and a per-user Redis rate limit (12 runs/minute).

## Project layout
```
├── app/                  # Next.js app router (single-page client-routed UI)
├── components/           # toast host
├── lib/api.ts            # typed API client (JWT, 401/403 handling)
├── backend/
│   └── src/
│       ├── config/       # mongo + redis connections
│       ├── middleware/   # auth (JWT+RBAC), validation (zod), errors
│       ├── models/       # User, Syllabus, Question, Problem, Progress
│       ├── modules/      # auth, syllabus, simulation, assessment, code, progress, analytics
│       │   └── <mod>/{routes,controller,service}.js
│       └── scripts/      # seed.js + seed-data.js
├── docker-compose.yml    # MongoDB + Redis
└── PROGRESS.md           # build tracker
```
