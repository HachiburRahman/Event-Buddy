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

## Session Log

<!-- Newest first. One entry per response. -->

### 2026-07-29

- **Created this `CLAUDE.md`.** Surveyed the repo (root, `backend/src`, `frontend/src`, both `package.json`s, entities, `main.ts`, `app.module.ts`, controllers, `AuthContext`, env usage) and wrote the initial guide: stack, commands, architecture, route table, env vars, conventions, gotchas. Noted the one uncommitted change on `main`: `backend/src/seed/seed.service.ts` (seed admin password + formatting).
