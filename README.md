# Task Manager - PERN Stack Boilerplate v1

Monorepo with Express 5 + React 19, based on the `BOILERPLATE_BLUEPRINT_NODE_REACT.md` blueprint.

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Monorepo | pnpm workspaces + Turborepo 2 |
| Backend | Express 5 + TypeScript |
| ORM | Prisma 6 + PostgreSQL 17 |
| Auth | jose (JWT) + argon2 |
| Logging | Pino + pino-http |
| Validation | Zod 3 (shared front/back schemas) |
| Jobs | BullMQ 5 + Redis 7 (scaffolded, no workers yet) |
| Frontend | React 19 + Vite 6 |
| State | Redux Toolkit 2 + RTK Query |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Testing | Vitest 3 + Supertest + Testing Library + jsdom |

## Quick Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Environment variables
```bash
cp .env.example .env
# Edit .env if needed; the default values work for local development
```

### 3. Start Postgres + Redis
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Run migrations + seed
```bash
pnpm --filter api db:migrate    # creates tables
pnpm --filter api db:seed       # creates the sample user
```

Seed credentials:
- **Email:** `admin@example.com`
- **Password:** `password123`

### 5. Start everything
```bash
pnpm dev
```

- API: http://localhost:3000
- Web: http://localhost:5173

Notes:
- The frontend automatically attempts session recovery with the `refresh token` when the `access token` expires.
- Protected routes validate the session with `/auth/me` before rendering the private view.

## API Endpoints

```
GET  /health

POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout        <- requires auth
GET  /api/v1/auth/me            <- requires auth

GET    /api/v1/tasks            <- requires auth
POST   /api/v1/tasks            <- requires auth
GET    /api/v1/tasks/:id        <- requires auth
PATCH  /api/v1/tasks/:id        <- requires auth
DELETE /api/v1/tasks/:id        <- requires auth
```

## Quality And Tests

### Lint
```bash
pnpm lint
```

### Monorepo tests
```bash
pnpm test
```

### API tests
```bash
pnpm --filter api test
```

Current coverage:
- Service and query unit tests
- HTTP tests with `supertest` for auth and tasks

### Web tests
```bash
pnpm --filter web test
```

Current coverage:
- Unit tests with `Vitest + Testing Library + jsdom`
- Authentication state
- Task form UI

Build note:
- The production web build uses `apps/web/tsconfig.build.json`, which excludes test files.
- Test type-safety and behavior are validated separately through `pnpm --filter web test`.

## Docker Deployment
```bash
# Build and start all services
docker compose up --build -d

# Web available at http://localhost
# API available at http://localhost:3000
```

Notes:
- Requires a `.env` file at the repository root.
- Docker builds use the workspace lockfile and compile `@repo/shared` before building `api` and `web`.
- TypeScript incremental build artifacts such as `*.tsbuildinfo` are not committed.

## Project Structure
```
boilerplate_PERN_stack_v1/
├── apps/
│   ├── api/          # Express 5 + Prisma + Auth + Tasks
│   └── web/          # React 19 + RTK Query + Tailwind
└── packages/
    ├── shared/       # Shared Zod schemas (source of truth)
    ├── tsconfig/     # Reusable base TSConfig
    └── eslint-config/
```

## Current Boilerplate Status

- Complete auth flow in the API: `login`, `refresh`, `logout`, `me`
- Automatic session recovery in the frontend
- JWT-protected task CRUD
- Shared Zod validation between frontend and backend
- Working lint setup with ESLint 9 flat config
- Docker ready for reproducible monorepo builds
- Redis/BullMQ included as a foundation, but no business workers or jobs implemented yet
