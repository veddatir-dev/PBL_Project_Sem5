# Build Progress

Tracker for wiring the v0 frontend to the new backend (PRD: Adaptive Learning & Simulation System). **Status: complete — all flows verified end-to-end.** UI fully redesigned (dark computational design system) — see "UI redesign" below.

## Legend
- [x] done · [~] in progress · [ ] pending

## Backend (`/backend`)

| Item | Status | Notes |
|---|---|---|
| Express app, helmet, CORS, JSON body limit, global rate limit | [x] | `src/server.js`; dev CORS allows any localhost port |
| Mongo (Mongoose) + Redis (ioredis) connections | [x] | `src/config/db.js`; Redis caches syllabus (1h), rate-limits code runs |
| JWT auth middleware + RBAC (student/faculty) | [x] | `src/middleware/auth.js`; 401/403 verified via curl |
| Zod input validation | [x] | `src/middleware/validate.js`; 400 with details verified |
| Centralized error handling + asyncHandler | [x] | `src/middleware/error.js` |
| Models: User, Syllabus, Question, Problem, Progress | [x] | `src/models/*`; Progress carries answers, attempts, submissions, sims |
| `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | [x] | bcryptjs hashing, JWT 7d, login by email **or** roll no. |
| `GET /syllabus`, `GET /topics/:id` | [x] | Redis-cached, enriched with per-user progress |
| `GET /simulations/:algorithmId`, `POST /simulations/:id/complete` | [x] | precomputed steps: bfs, dfs, prim, kruskal, bst, astar |
| `GET /quiz/:topicId/next`, `POST /quiz/answer`, `POST /quiz/:topicId/finish` | [x] | grasp = f(correctness, difficulty weight, time) via EMA; difficulty adapts; weak-concept flags |
| `GET /problems/:topicId`, `POST /code/run` | [x] | Judge0 langs C/C++/Java/Python; 12s timeout; 12 runs/min/user (Redis); 503 + clear message if env missing |
| `GET /progress/me` | [x] | mastery %, subject bars, grasp trend, recent activity, continue-topic |
| `GET /faculty/class-overview` (faculty only) | [x] | per-topic averages, completion rates, weak topics, student table |
| Seed script `npm run seed` | [x] | 3 subjects / 13 topics, 100+ questions, 5 problems with hidden tests, 15 students + 1 faculty with progress |

## Frontend integration

| Item | Status | Notes |
|---|---|---|
| `lib/api.ts` real fetch client (mock-data.ts deleted) | [x] | `NEXT_PUBLIC_API_URL`, JWT bearer on every call |
| 401 → clear session + redirect `/login`; 403 → toast | [x] | centralized in `request()` |
| Login/Register wired, role-based redirect | [x] | verified in browser for both roles |
| Route guards from backend role | [x] | unauthenticated → /login; student on /faculty → toast + bounce |
| Syllabus navigator (live topics + mastery + filters) | [x] | verified in browser |
| Visualizer: API steps, play/pause/step/reset, speed, complete | [x] | POST complete → 200 verified |
| Quiz: adaptive next/answer/finish, timer, grasp meter, results | [x] | adaptation (easy→medium) verified in browser |
| Code workspace: problem, starter code, autosave, Run | [x] | Judge0 fallback message verified; per-test output tabs |
| Student dashboard from `/progress/me` | [x] | verified in browser |
| Faculty overview from `/faculty/class-overview` | [x] | verified in browser |

## Infra & docs

| Item | Status |
|---|---|
| `docker-compose.yml` (Mongo 7 + Redis 7) | [x] — used for the live verification run |
| Root `dev` script (frontend + backend together) | [x] |
| `.env.example` (root + backend) | [x] |
| README setup guide | [x] |
| TypeScript check + production build | [x] — both clean |
| End-to-end browser smoke test | [x] — all flows above |

## UI redesign (v2 — computational learning laboratory)

Full redesign of every screen to the dark-first "signal line" design language (graphite surfaces, teal execution / blue analytical / amber achievement signals, Space Grotesk + Inter + JetBrains Mono). Verified in-browser for both roles; production build clean.

| Item | Status | Notes |
|---|---|---|
| Design tokens + primitives (`globals.css`, `components/ui-kit.tsx`) | [x] | panels, signal lines, micro-grid, meters, node topology, stage strip, loaders |
| 3D hero + simulation canvases (`components/signal-hero.tsx`, `lib/graph-spec.ts`) | [x] | R3F graph with playback states, 2D SVG fallback, WebGL error boundary |
| Bespoke visualizations (`components/viz.tsx`) | [x] | Mastery Map, intelligence curve, node chain, execution markers, class heatmap, concept graph, cursor-reactive login network |
| Nav rail around the four verbs (UNDERSTAND / TEST / IMPLEMENT / TRACK) | [x] | expands on hover, animated active signal bar |
| Landing (3D hero + loop + algorithm index), Login (reactive network) | [x] | public routes; authed users bounce to their workspace |
| Dashboard: Mastery Map, resume protocol, grasp curve, signal log | [x] | continue-topic falls back to first incomplete stage |
| Syllabus navigator + topic detail (ghost model header, 3-stage pipeline) | [x] | stage strips per topic, segmented filters |
| Visualizer: 3D model, step ruler, rate control, state/pseudocode panel, presentation mode | [x] | `?present=1` or toggle; used by faculty "PROJECT" shortcuts |
| Adaptive quiz: probes, live grasp, verdicts, results with weak concepts + recommendation | [x] | difficulty adaptation verified (easy → medium) |
| Code workspace: Monaco (custom theme), 4 languages, execution pipeline, progressive test reveal | [x] | Judge0 unconfigured → clean error state (set `JUDGE0_URL` to enable runs) |
| Faculty: tick dial / topology metrics, Class Learning Map heatmap, ConceptGraph, registry filter | [x] | weak topics = API bottom-3, amber-coded |
| Backend fix: `GET /api/topics/:id` was double-prefixed (`/topics/topics/:id`) | [x] | route corrected in `backend/src/modules/syllabus/syllabus.routes.js` |

## Still needs your configuration
- **Judge0**: set `JUDGE0_URL` + `JUDGE0_API_KEY` in `backend/.env` (e.g. RapidAPI Judge0 CE). Until then, Run returns a clear 503 message — everything else works.
- `JWT_SECRET` should be changed before any real deployment.
- `CLIENT_ORIGIN` should list your deployed frontend origin(s) for production CORS.
