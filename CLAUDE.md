# CLAUDE.md

This repository already maintains its canonical AI collaboration guide in `AGENTS.md`.

Read `AGENTS.md` first for:

- repository structure
- stack and runtime requirements
- development and test commands
- backend and frontend architecture
- shared schema contract rules
- Docker and security automation
- change guidelines for coding agents

Short summary:

- Public PERN monorepo boilerplate
- `pnpm` workspaces + `turbo`
- Express 5 API in `apps/api`
- React 19 web app in `apps/web`
- Shared Zod contracts in `packages/shared`
- Prisma + PostgreSQL for persistence
- RTK Query handles API calls and token refresh on the frontend
- Trivy, CodeQL, and Dependabot are configured under `.github/`
- Commit messages must be written in English and follow Conventional Commits v1.0.0
- Use English across docs, code comments, test titles, logs, and user-facing strings unless localization is intentional

When in doubt, treat `AGENTS.md` as the source of truth and keep both files aligned if you add repo-level guidance here.
