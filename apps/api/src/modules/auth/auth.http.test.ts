import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";
import argon2 from "argon2";
import { createApp } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

vi.mock("argon2", () => ({
  default: {
    verify: vi.fn(),
  },
}));

const mockPrismaUser = prisma.user as unknown as {
  findUnique: ReturnType<typeof vi.fn>;
};

const baseUser = {
  id: "user-1",
  email: "admin@example.com",
  passwordHash: "$argon2id$hashed",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

async function signToken(type: "access" | "refresh"): Promise<string> {
  const secret =
    type === "access"
      ? process.env["JWT_ACCESS_SECRET"]
      : process.env["JWT_REFRESH_SECRET"];

  const key = new TextEncoder().encode(secret);

  return new SignJWT({ sub: baseUser.id, email: baseUser.email, type })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

describe("auth routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /api/v1/auth/login returns valid tokens", async () => {
    mockPrismaUser.findUnique.mockResolvedValue(baseUser);
    vi.mocked(argon2.verify).mockResolvedValue(true);

    const response = await request(createApp()).post("/api/v1/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });

  it("POST /api/v1/auth/login validates the body", async () => {
    const response = await request(createApp()).post("/api/v1/auth/login").send({
      email: "not-an-email",
      password: "123",
    });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: "Validation error",
      statusCode: 422,
    });
  });

  it("POST /api/v1/auth/refresh returns a new access token", async () => {
    const refreshToken = await signToken("refresh");

    const response = await request(createApp()).post("/api/v1/auth/refresh").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ accessToken: expect.any(String) });
  });

  it("GET /api/v1/auth/me requires an access token", async () => {
    const response = await request(createApp()).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: "Token not provided",
      statusCode: 401,
    });
  });

  it("GET /api/v1/auth/me returns the authenticated user", async () => {
    const accessToken = await signToken("access");
    mockPrismaUser.findUnique.mockResolvedValue(baseUser);

    const response = await request(createApp())
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: baseUser.id,
      email: baseUser.email,
      createdAt: baseUser.createdAt.toISOString(),
    });
  });

  it("POST /api/v1/auth/logout accepts authenticated users", async () => {
    const accessToken = await signToken("access");

    const response = await request(createApp())
      .post("/api/v1/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Session closed successfully" });
  });
});
