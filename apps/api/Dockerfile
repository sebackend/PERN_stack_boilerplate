# ─── Stage 1: deps + build ────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copiar manifests del monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/tsconfig ./packages/tsconfig
COPY packages/shared ./packages/shared

# Copiar api
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/prisma ./apps/api/prisma

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Compilar paquetes compartidos antes de las apps que los consumen
RUN pnpm --filter @repo/shared build

# Copiar source y compilar
COPY apps/api/src ./apps/api/src
RUN pnpm --filter api db:generate
RUN pnpm --filter api build

# ─── Stage 2: producción ──────────────────────────────────────────────────────
FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo necesario
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/tsconfig ./packages/tsconfig
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

# Script de entrada: aplica migraciones y arranca
COPY apps/api/docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
