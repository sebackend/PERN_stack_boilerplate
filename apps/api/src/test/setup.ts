import { vi } from "vitest";

// Mock de variables de entorno para tests
process.env["NODE_ENV"] = "test";
process.env["DATABASE_URL"] = "postgresql://postgres:postgres@localhost:5432/taskmanager_test";
process.env["REDIS_URL"] = "redis://localhost:6379";
process.env["JWT_ACCESS_SECRET"] = "test-access-secret-at-least-32-chars-long";
process.env["JWT_REFRESH_SECRET"] = "test-refresh-secret-at-least-32-chars-long";
process.env["JWT_ACCESS_EXPIRES_IN"] = "15m";
process.env["JWT_REFRESH_EXPIRES_IN"] = "7d";
process.env["API_PORT"] = "3001";
process.env["API_CORS_ORIGIN"] = "http://localhost:5173";

// Mock Prisma para no necesitar DB real en unit tests
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    task: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));
