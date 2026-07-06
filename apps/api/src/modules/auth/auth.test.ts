import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../../modules/auth/auth.service.js";
import { prisma } from "../../lib/prisma.js";
import argon2 from "argon2";

// Mock argon2
vi.mock("argon2", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$argon2id$hashed"),
    verify: vi.fn(),
  },
}));

const mockPrismaUser = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("devuelve tokens con credenciales válidas", async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: "user-1",
        email: "admin@example.com",
        passwordHash: "$argon2id$hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(argon2.verify).mockResolvedValue(true);

      const result = await authService.login({
        email: "admin@example.com",
        password: "password123",
      });

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });

    it("lanza UnauthorizedError si el usuario no existe", async () => {
      mockPrismaUser.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({ email: "noexiste@example.com", password: "abc123" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("lanza UnauthorizedError si la contraseña es incorrecta", async () => {
      mockPrismaUser.findUnique.mockResolvedValue({
        id: "user-1",
        email: "admin@example.com",
        passwordHash: "$argon2id$hashed",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(argon2.verify).mockResolvedValue(false);

      await expect(
        authService.login({ email: "admin@example.com", password: "wrong" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
