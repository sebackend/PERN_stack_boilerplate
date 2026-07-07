# ─── Stage 1: deps + build ────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy monorepo manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/tsconfig ./packages/tsconfig
COPY packages/shared ./packages/shared

# Copy API files
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/tsconfig.json ./apps/api/tsconfig.json
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages before the apps that consume them
RUN pnpm --filter @repo/shared build

# Fail early if shared declarations were not produced inside the image.
RUN test -f packages/shared/dist/index.d.ts

# Copy source and build
COPY apps/api/src ./apps/api/src
RUN pnpm --filter api db:generate
RUN pnpm --filter api build
RUN pnpm --filter api --prod deploy /prod/api

# ─── Stage 2: production ──────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install patched runtime libraries and remove package-manager tooling.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/* \
  && rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

# Copy only what is required
COPY --from=builder /prod/api ./
COPY apps/api/docker-entrypoint.mjs /app/docker-entrypoint.mjs

EXPOSE 3000

CMD ["/app/docker-entrypoint.mjs"]
