# CLAUDE.md

Guidance for Claude Code when working in this repository.

> **Standing instruction:** update the [Session Log](#session-log) at the bottom of this file on **every** response in a working session.

---

## Project

**Event Buddy / "Event Lounge"** — an event management and ticket-booking system. Final-year (8th semester) university project.

Two independent apps in one repo, each with its own `package.json`, `node_modules`, and lockfile. There is **no** root workspace/monorepo tooling — always `cd` into `backend/` or `frontend/` before running npm.

| | Stack |
|---|---|
| `backend/` | NestJS 11, TypeORM 0.3, PostgreSQL, Passport-JWT, Swagger, Nodemailer + Handlebars, Stripe, Multer |
| `frontend/` | Next.js 16 (App Router, `src/`), React 19, TypeScript, Tailwind 3 + daisyUI, Axios, react-hook-form + Zod, Stripe.js, Recharts |

## Commands

```bash
cd backend && npm run start:dev     # Nest watch mode, http://localhost:5007 (Swagger at /api)
```

```bash
cd frontend && npm run dev          # Next dev server
```

Other: `npm run build`, `npm run lint` (both apps); `npm test` / `npm run test:e2e` / `npm run test:cov` (backend only — Jest, `*.spec.ts` under `src/`).

## Architecture

### Backend (`backend/src/`)

Feature modules registered in `app.module.ts`: `auth`, `events`, `bookings`, `payments`, `mail`, `seed`.

- **`main.ts`** wires everything global: `AccessTokenGuard` as a **global guard** (so every route is protected by default), `ValidationPipe` (`transform`, `whitelist`, `forbidNonWhitelisted`), `ClassSerializerInterceptor`, static serving of `uploads/` at `/uploads/`, CORS against `FRONTEND_URL`, and Swagger at `/api`. App is created with `rawBody: true` for the Stripe webhook.
- **Auth model:** JWT bearer tokens. Opt out of auth per-route with `@Public()`; restrict by role with `@Roles(UserRole.ADMIN | UserRole.USER)` + `RolesGuard`. Read the caller with `@GetCurrentUser()`. Decorators/guards/enums live in `src/common/`.
- **Entities** (TypeORM, uuid PKs, `synchronize: true` — schema auto-syncs, no migrations):
  - `User` — `fullName`, `email` (unique), `password` (`select: false`), `role`, `resetCode`/`resetCodeExpires`, `bookings[]`
  - `Event` — `title`, `description`, `date`, `location`, `capacity`, `tags[]`, `price`, `imageUrl`, `bookings[]`
  - `Booking` — `numberOfSeats`, `paymentStatus`, `stripeSessionId`, `amountPaid`, → `User`, → `Event` (both `onDelete: CASCADE`)
- **`seed/`** runs on `OnModuleInit` and creates the default admin account if missing.
- **`mail/`** sends Handlebars templates from `src/mail/templates/` (booking confirmation, password reset).
- **Uploads** are written to `backend/uploads/` (see `src/config/multer.config.ts`) and are **committed to git**.

### Routes

| Method | Path | Access |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/verify-reset-code` | public |
| PATCH | `/auth/reset-password` | public |
| GET | `/auth/profile` | any authenticated |
| GET | `/auth/admin-test` | admin |
| GET | `/events/upcoming`, `/events/past` · POST `/events/public/find` | public |
| GET/POST/PATCH/DELETE | `/events`, `/events/find`, `/events/:id` | admin |
| POST/GET/DELETE | `/bookings`, `/bookings/my-bookings`, `/bookings/cancel` | user |
| DELETE | `/bookings/cancel-pending/:id` | public |
| GET | `/payments/verify-session` · POST `/payments/webhook` | public |
| POST | `/mail/test-booking`, `/mail/test-reset` | admin |

### Frontend (`frontend/src/`)

- `app/(auth)/` — login, register, forgot-password, reset-password
- `app/(dashboard)/admin/…` and `app/(dashboard)/user/…` — role-scoped dashboards
- `app/events/[id]`, `app/my-bookings`, `app/booking/success|cancel`
- `components/shared/` (feature components + skeleton loaders), `components/ui/` (Modal, Pagination, theme)
- `context/AuthContext.tsx` + `hooks/useAuth.ts` — token in `localStorage`, hydrates via `GET /auth/profile`, redirects by role on login
- `lib/axios.ts` — the single API client; a request interceptor attaches `Authorization: Bearer <token>`. **Always import this**, never call `fetch`/`axios` directly.
- `types/index.ts` — shared TS types (`IUser`, etc.)

## Environment

`backend/.env` — `DATABASE_URL` *or* the discrete `DATABASE_HOST/PORT/USERNAME/PASSWORD/NAME` set; `JWT_SECRET`; `EMAIL_USER`/`EMAIL_PASSWORD`; `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`; `FRONTEND_URL`; `PORT`; `NODE_ENV` (`production` enables Postgres SSL).

`frontend/.env.local` — `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

## Conventions

- TypeScript everywhere; backend uses DTOs with `class-validator` — because `forbidNonWhitelisted` is on, any field missing from the DTO makes the request 400.
- Frontend validates with Zod through `@hookform/resolvers`; user feedback via `react-hot-toast`.
- Tailwind + daisyUI utility classes; merge conditional classes with `clsx` / `tailwind-merge` (`lib/utils.ts`).
- Backend formatting is Prettier (`backend/.prettierrc`); `npm run lint` autofixes.

## Gotchas

- Backend listens on **5007**, not 3000. CORS falls back to `http://localhost:3001` while `next dev` defaults to **3000** — set `FRONTEND_URL` (or the Next port) or requests get blocked.
- `synchronize: true` is on in every environment. Entity edits mutate the live schema; a careless change can drop columns.
- `password` is `select: false` — queries needing it must `addSelect`.
- The Stripe webhook depends on `rawBody: true`; don't add a body parser that consumes it first.
- The seed admin's credentials are hardcoded in `backend/src/seed/seed.service.ts`. Treat as a known issue — don't propagate the literal into new code.
- Deployment target is Render (`engines.node: 22.x`); some `@types/*` packages sit in `dependencies` intentionally so the Render build resolves them.

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

---

## Session Log

<!-- Newest first. One entry per response. -->

### 2026-07-29

- **Fixed Stripe checkout in production, and a seat leak it exposed** (`/investigate`). Two bugs. (1) [payments.service.ts](backend/src/payments/payments.service.ts) built the Stripe client as `stripeSecretKey || 'sk_test_mock_placeholder'`. `STRIPE_SECRET_KEY` is unset on Render, so production ran on that committed fake and only failed when a user pressed Pay. Confirmed by calling the real Stripe API with the fallback: it returns `Invalid API Key provided: sk_test_************lder`, byte-for-byte the production error. [requireStripeSecretKey()](backend/src/config/stripe.config.ts) now throws at boot on a missing, placeholder-shaped, or `pk_` key — **`STRIPE_SECRET_KEY` must be set on Render or the backend will not start.** (2) [bookings.service.ts](backend/src/bookings/bookings.service.ts) saved the booking row *before* creating the Stripe session, and the availability query summed **all** bookings with no `paymentStatus` filter, so every failed or abandoned checkout stranded a `PENDING` row holding seats forever. The `/booking/cancel` cleanup only fires when Stripe redirects back, which cannot happen when session creation itself throws. Verified live: The Shur Project went from `0/250` to `10/250` booked with zero payments. Now the row is rolled back when Stripe throws, and [whereHoldsASeat()](backend/src/bookings/booking-seats.ts) time-limits `PENDING` holds to 30 min. **All three seat queries** (booking gate, event list, event detail) go through it — they disagreed before and would advertise seats booking then refused. The Stripe session gets a matching `expires_at`, so a hold and its session die together and a late payment cannot oversell. The 10 stranded seats free themselves on deploy; no DB surgery. 43 unit tests; the 7 pre-existing failing suites are unchanged.
- **Fixed the production CORS block, and the "invalid credentials" it was disguised as** (`/investigate`). [main.ts](backend/src/main.ts) passed `FRONTEND_URL` to `enableCors()` as a **single string**, so the API answered every caller with one fixed `Access-Control-Allow-Origin`. Vercel serves the frontend from several hostnames — the canonical alias, a unique URL per deployment, one per branch — so only the alias worked. Opening any deployment URL got a 200 with the right body that the browser discarded (`net::ERR_FAILED 200 (OK)`). The login symptom was **the same bug**: `POST /auth/login` was blocked too, leaving `err.response` undefined, and [login/page.tsx](frontend/src/app/(auth)/login/page.tsx) fell through to a hardcoded *"check your credentials"* — a wrong diagnosis, since the credentials were never sent. Probing the live endpoint with bogus creds returned a clean `401 {"message":"Invalid credentials"}`, proving auth was healthy. `FRONTEND_URL` is now a **comma-separated list** parsed by [buildCorsOptions()](backend/src/config/cors.config.ts); an entry may contain `*`, which matches one or more characters that are neither `.` nor `/`, so it cannot cross a hostname label and a pattern must name your own account scope. New [getApiErrorMessage()](frontend/src/lib/errors.ts) separates transport failure from a server answer, applied at all 7 call sites that shared the flaw. **`FRONTEND_URL` on Render must list both the alias and the preview pattern, or nothing changes** — the boot log prints `Allowed origins: ...` to confirm. Guarded by `npm run check:cors` (real HTTP + real preflight, no DB): 6/10 before, 10/10 after; 25/25 unit tests. Backend's 7 pre-existing failing suites (3 stale assertions) are unchanged.
- **Fixed login 500 and a token-forgery hole** (`/investigate`). `JWT_SECRET` is not set on Render. [auth.module.ts](backend/src/auth/auth.module.ts) passed the raw value to `JwtModule` with no fallback, so the app booted fine and then `sign()` threw on any *successful* login: wrong password → 401, correct password → **500**. Meanwhile [jwt.strategy.ts](backend/src/auth/strategies/jwt.strategy.ts) fell back to the literal `'your_default_secret'`, so token verification kept working against a string published in this repo — a token forged with it returned **200** on `/auth/profile`. Both now call [requireJwtSecret()](backend/src/config/jwt.config.ts), which throws at boot with an actionable message. **`JWT_SECRET` must be set on Render or the backend will not start.** Verified: process exits 1 without it; with it, login 200, wrong password 401, forged token 401, genuine token 200 (8/8).
- **Fixed admin "Invalid credentials" in production** (`/investigate`). `seedAdmin()` was create-only: it returned early whenever the email already existed, so editing `adminPassword` in source never touched a database that already had the row. Production's admin was created by a May deploy holding `AdminHachib123@`; the constant changed to `Hachib@1234` in `879a226`, and the row was never updated. Reproduced on a throwaway database: stale row → 401 for the new password, 200 for the old one. [seedAdmin()](backend/src/seed/seed.service.ts) now reads `ADMIN_EMAIL`/`ADMIN_PASSWORD` from env (falling back to the committed values with a loud warning), creates the admin when missing, and reconciles password and role when they drift. Documented every env var in [backend/.env.example](backend/.env.example). Verified end to end: env creds used, committed fallback rejected, stale row reconciled, rotation works, unchanged boot leaves the hash alone (8/8).
- **Deployed and verified in production** (commit `175cb79`, pushed to `main`). Render and Vercel both redeployed. Live checks: `/health` → `{"status":"ok"}`, `/events/upcoming` → 6, `/events/past` → 8, all seeded `/uploads/*` images → 200, `/` and `/privacy` on Vercel → 200. Seeder log path confirmed by the events appearing on first boot against the previously empty Render database.
- **Fixed production `ERR_CONNECTION_CLOSED`** (`/investigate`). Render sends `Connection: close` on every response, so the browser can reuse a pooled socket exactly as the server closes it; the homepage fires `/events/upcoming` and `/events/past` concurrently, so both died together. Free instances also sleep after ~15 min idle. [lib/axios.ts](frontend/src/lib/axios.ts) now has a 20s timeout and 3 retries with backoff, **GET/HEAD only** unless a request opts in with `retryable: true` — `POST /bookings` must never replay (double booking + double Stripe session). [EventList.tsx](frontend/src/components/shared/EventList.tsx) got a "Try again" button and a cold-start message. Added public `GET /health` ([app.controller.ts](backend/src/app.controller.ts)) for an uptime pinger to keep Render warm. Guarded by `npm run check:retry`, which drops sockets against the real client: 1/4 before, 4/4 after.
- **Fixed "events show locally but not in production"** (`/investigate`). Not a code bug: local backend talks to `localhost:5432/event_db` (14 events), Render talks to its own database (0 events). A deploy ships code, not data; `synchronize: true` created the tables so the API answered `200 {"total":0}`. Snapshotted the 14 local events into [backend/src/seed/events.seed.ts](backend/src/seed/events.seed.ts) and extended [SeedService](backend/src/seed/seed.service.ts) with `seedEvents()`, guarded on `count() === 0`. Regenerate with `node scripts/export-events.mjs`. **Fixture is `.ts`, not `.json`, on purpose** — `resolveJsonModule` is off and `nest-cli.json` has no `assets` rule, so a JSON import would compile but be absent from `dist/` at runtime. Verified by booting the built app twice against a throwaway database: boot 1 seeded 14, boot 2 skipped (no duplicates).
- **Fixed the production console 404** (`/investigate`). Root cause: [Footer.tsx:32](frontend/src/components/shared/Footer.tsx:32) links to `/privacy`, which had no route under `src/app/`. Next.js prefetches in-viewport `<Link>`s, so the footer scrolling into view fired a prefetch that 404'd. Added [frontend/src/app/privacy/page.tsx](frontend/src/app/privacy/page.tsx) plus [scripts/check-routes.mjs](frontend/scripts/check-routes.mjs) (`npm run check:routes`) to catch dangling internal links. Verified: check fails before / passes after, `tsc --noEmit` clean, `next build` lists `/privacy`. Separately confirmed **"No events found." is not a bug** — the Render backend returns `200 {"data":[],"total":0}`; the production DB has no events.
- **Created this `CLAUDE.md`.** Surveyed the repo (root, `backend/src`, `frontend/src`, both `package.json`s, entities, `main.ts`, `app.module.ts`, controllers, `AuthContext`, env usage) and wrote the initial guide: stack, commands, architecture, route table, env vars, conventions, gotchas. Noted the one uncommitted change on `main`: `backend/src/seed/seed.service.ts` (seed admin password + formatting).
