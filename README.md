# Task Manager — Boilerplate PERN Stack v1

Monorepo con Express 5 + React 19, siguiendo el blueprint `BOILERPLATE_BLUEPRINT_NODE_REACT.md`.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 20+ |
| Monorepo | pnpm workspaces + Turborepo 2 |
| Backend | Express 5 + TypeScript |
| ORM | Prisma 6 + PostgreSQL 17 |
| Auth | jose (JWT) + argon2 |
| Logging | Pino + pino-http |
| Validación | Zod 3 (schemas compartidos front/back) |
| Jobs | BullMQ 5 + Redis 7 (scaffold configurado, sin workers) |
| Frontend | React 19 + Vite 6 |
| Estado | Redux Toolkit 2 + RTK Query |
| Routing | React Router 7 |
| Estilos | Tailwind CSS 4 |
| Testing | Vitest 3 + Supertest + Testing Library + jsdom |

## Setup rápido

### 1. Instalar dependencias
```bash
pnpm install
```

### 2. Variables de entorno
```bash
cp .env.example .env
# Editar .env si necesario (los valores por defecto funcionan para dev local)
```

### 3. Levantar Postgres + Redis
```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Migración + seed
```bash
pnpm --filter api db:migrate    # crea tablas
pnpm --filter api db:seed       # crea usuario de prueba
```

Credenciales del seed:
- **Email:** `admin@example.com`
- **Password:** `password123`

### 5. Levantar todo
```bash
pnpm dev
```

- API: http://localhost:3000
- Web: http://localhost:5173

Notas:
- El frontend intenta recuperar la sesión automáticamente con `refresh token` ante expiración del `access token`.
- Las rutas protegidas validan la sesión con `/auth/me` antes de renderizar la vista privada.

## Endpoints de la API

```
GET  /health

POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout        ← requiere auth
GET  /api/v1/auth/me            ← requiere auth

GET    /api/v1/tasks            ← requiere auth
POST   /api/v1/tasks            ← requiere auth
GET    /api/v1/tasks/:id        ← requiere auth
PATCH  /api/v1/tasks/:id        ← requiere auth
DELETE /api/v1/tasks/:id        ← requiere auth
```

## Calidad y tests

### Lint
```bash
pnpm lint
```

### Tests del monorepo
```bash
pnpm test
```

### Tests de API
```bash
pnpm --filter api test
```

Cobertura actual:
- Unit tests de servicios y queries
- Tests HTTP con `supertest` para auth y tasks

### Tests de Web
```bash
pnpm --filter web test
```

Cobertura actual:
- Unit tests con `Vitest + Testing Library + jsdom`
- Estado de autenticación
- UI del formulario de tareas

## Deploy con Docker (stack completo)
```bash
# Construir e iniciar todos los servicios
docker compose up --build -d

# Web disponible en http://localhost
# API disponible en http://localhost:3000
```

Notas:
- Requiere un archivo `.env` en la raíz del repo.
- Los builds Docker usan el lockfile del workspace y compilan `@repo/shared` antes de construir `api` y `web`.

## Estructura del proyecto
```
boilerplate_PERN_stack_v1/
├── apps/
│   ├── api/          # Express 5 + Prisma + Auth + Tasks
│   └── web/          # React 19 + RTK Query + Tailwind
└── packages/
    ├── shared/       # Schemas Zod compartidos (fuente de verdad)
    ├── tsconfig/     # TSConfig base reutilizable
    └── eslint-config/
```

## Estado actual del boilerplate

- Auth completa en API: `login`, `refresh`, `logout`, `me`
- Recuperación automática de sesión en frontend
- CRUD de tasks protegido por JWT
- Validación compartida con Zod entre frontend y backend
- Lint operativo con ESLint 9 flat config
- Docker listo para builds reproducibles del monorepo
- Redis/BullMQ presente como base, pero sin workers ni jobs de negocio implementados todavía
