# AGENTS.md

## Purpose

This repository is a public PERN monorepo boilerplate for a task manager app.

- Monorepo toolchain: `pnpm` workspaces + `turbo`
- Backend: Express 5 + TypeScript + Prisma + PostgreSQL
- Frontend: React 19 + Vite + Redux Toolkit + RTK Query + React Router
- Shared contracts: Zod schemas in `packages/shared`
- Infra primitives: Redis + BullMQ scaffolded, but no business workers yet

Use this file as the canonical repository guide for AI agents and automated coding assistants.

## Repository Layout

```text
apps/
  api/        Express API, Prisma schema, migrations, auth, tasks
  web/        React SPA with auth flow and task UI
packages/
  shared/     Shared Zod schemas and exported request/response types
  tsconfig/   Shared TypeScript config package
  eslint-config/ Shared ESLint config package
```

Key files:

- `package.json`: root scripts for the monorepo
- `pnpm-workspace.yaml`: workspace package declarations
- `turbo.json`: task pipeline for build, lint, and test
- `apps/api/prisma/schema.prisma`: database schema
- `apps/api/src/app.ts`: Express app wiring
- `apps/api/src/server.ts`: API server startup and shutdown
- `apps/web/src/main.tsx`: React entry point
- `apps/web/src/router.tsx`: app routes
- `.github/workflows/`: security automation with Trivy and CodeQL

## Runtime And Tooling

- Node.js: `>=20`
- pnpm: `>=9`
- Package manager pinned in root: `pnpm@9.15.4`
- Database: PostgreSQL
- Cache/queue infra: Redis

Prefer running commands from the repository root.

## Common Commands

Install dependencies:

```bash
pnpm install
```

Run the full monorepo in development:

```bash
pnpm dev
```

Run quality checks:

```bash
pnpm lint
pnpm test
pnpm test:coverage
pnpm build
```

Run app-specific commands:

```bash
pnpm --filter api dev
pnpm --filter api test
pnpm --filter web dev
pnpm --filter web test
```

Database commands:

```bash
pnpm --filter api db:migrate
pnpm --filter api db:deploy
pnpm --filter api db:seed
pnpm --filter api db:generate
pnpm --filter api db:studio
```

Local infra:

```bash
docker compose -f docker-compose.dev.yml up -d
```

## Environment Variables

Copy `.env.example` to `.env`.

Important variables:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `API_PORT`
- `API_CORS_ORIGIN`
- `VITE_API_URL`

Backend env validation lives in `apps/api/src/config/env.ts` and uses Zod. Invalid or missing required values stop the API at startup.

## How The Backend Works

API base:

- Health check: `/health`
- Versioned API: `/api/v1`

Current modules:

- `auth`: login, refresh, logout, current user
- `tasks`: authenticated CRUD for tasks

Important backend pieces:

- `apps/api/src/app.ts`: registers middleware, routes, 404 handler, and error handler
- `apps/api/src/middleware/auth.ts`: validates JWT access tokens and populates `req.user`
- `apps/api/src/middleware/validate.ts`: validates request payloads with Zod
- `apps/api/src/lib/prisma.ts`: Prisma client

Backend conventions:

- Keep route validation in shared Zod schemas when the contract is used by both frontend and backend.
- Prefer adding or updating schemas in `packages/shared` rather than duplicating request validation types.
- Protected routes should use `authenticate`.
- Keep API routes under `/api/v1/...`.
- If you change Prisma models, commit the generated migration files.

## How The Frontend Works

Frontend stack:

- React 19
- React Router
- Redux Toolkit
- RTK Query
- Tailwind CSS 4

Important frontend pieces:

- `apps/web/src/main.tsx`: renders the app with the Redux provider
- `apps/web/src/router.tsx`: public and protected routes
- `apps/web/src/store/api.ts`: RTK Query base API with automatic refresh flow
- `apps/web/src/features/auth/authSlice.ts`: auth state stored in Redux and mirrored to `localStorage`

Frontend auth behavior:

- Access and refresh tokens are stored in `localStorage`.
- Requests attach `Authorization: Bearer <accessToken>` when present.
- On `401`, RTK Query attempts `/auth/refresh` using the stored refresh token.
- If refresh fails, the app dispatches `logout()`.

Frontend conventions:

- If you change API shapes, update `packages/shared` first, then align API and UI consumers.
- Keep feature code grouped under `apps/web/src/features/...`.
- Preserve the protected route flow built around `RequireAuth`.

## Shared Package

`packages/shared` is the contract layer between apps.

- It exports shared auth and task schemas.
- It should remain the source of truth for API payload validation and shared types.

When changing a contract:

1. Update the Zod schema in `packages/shared/src/schemas`.
2. Rebuild dependent packages if needed.
3. Update API handlers and frontend consumers together.
4. Update tests on both sides when behavior changes.

## Testing

Current testing stack:

- Backend: Vitest + Supertest
- Frontend: Vitest + Testing Library + jsdom

Existing coverage includes:

- Auth service and HTTP tests
- Tasks service, query, and HTTP tests
- Frontend auth state and API tests
- Frontend task UI tests

When making changes:

- Add or update focused tests near the affected module.
- Prefer app-specific test runs during iteration.
- Run the relevant root or package-level tests before finishing.

## Docker And Deployment

Dockerfiles exist for:

- `apps/api/Dockerfile`
- `apps/web/Dockerfile`

Both builds rely on the root workspace manifests and the shared package.

Operational detail:

- The API image runs Prisma generate during build.
- The API entrypoint applies migrations before startup.
- The web image serves the built SPA through Nginx.

## Security Automation

This repository includes:

- `.github/dependabot.yml`
- `.github/workflows/trivy.yml`
- `.github/workflows/codeql.yml`

These handle:

- dependency update PRs
- vulnerability scanning for dependencies and Docker images
- static analysis for JavaScript/TypeScript

## Git Conventions

- Write commit messages in English.
- Use the Conventional Commits v1.0.0 specification for all commits.
- Prefer concise commit subjects such as `feat: add task status filter` or `fix: handle expired refresh token`.

## Language Conventions

- Use English for documentation, code comments, identifiers when naming new code, test titles, log messages, and user-facing strings unless a feature explicitly requires localization.
- Avoid introducing Spanish in source files, scripts, fixtures, or repository-level docs.

## Change Guidelines For Agents

- Prefer minimal changes that fit the existing structure.
- Do not introduce a second validation source when `packages/shared` already owns the contract.
- Keep backend and frontend behavior aligned when touching auth or task flows.
- Avoid moving files or renaming modules without a concrete need.
- Respect the existing module split: `lib`, `middleware`, `modules`, `features`, `store`, `shared`.
- If a change affects the database schema, include Prisma migration artifacts.
- If a change affects API behavior, update tests.
- If a change affects auth or routing, verify both API and web tests where relevant.

## Quick Start For A New Contributor Or Agent

1. `pnpm install`
2. `cp .env.example .env`
3. `docker compose -f docker-compose.dev.yml up -d`
4. `pnpm --filter api db:migrate`
5. `pnpm --filter api db:seed`
6. `pnpm dev`

Default local URLs:

- API: `http://localhost:3000`
- Web: `http://localhost:5173`

Seed credentials:

- Email: `admin@example.com`
- Password: `password123`
