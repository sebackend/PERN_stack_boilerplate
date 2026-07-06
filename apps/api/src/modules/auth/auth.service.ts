import argon2 from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { UnauthorizedError, NotFoundError } from "../../lib/errors.js";
import type { LoginInput, Tokens, UserResponse } from "@repo/shared";

// ─── Helpers JWT ──────────────────────────────────────────────────────────────

function parseDuration(d: string): number {
  const match = d.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Duración inválida: ${d}`);
  const [, num, unit] = match;
  const n = parseInt(num!, 10);
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return n * (multipliers[unit!] ?? 1);
}

async function signToken(
  payload: Record<string, unknown>,
  secret: string,
  expiresIn: string
): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + parseDuration(expiresIn))
    .sign(key);
}

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  async login(input: LoginInput): Promise<Tokens> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedError("Credenciales inválidas");
    }

    const [accessToken, refreshToken] = await Promise.all([
      signToken(
        { sub: user.id, email: user.email, type: "access" },
        env.JWT_ACCESS_SECRET,
        env.JWT_ACCESS_EXPIRES_IN
      ),
      signToken(
        { sub: user.id, email: user.email, type: "refresh" },
        env.JWT_REFRESH_SECRET,
        env.JWT_REFRESH_EXPIRES_IN
      ),
    ]);

    return { accessToken, refreshToken };
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const key = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
      const { payload } = await jwtVerify(refreshToken, key);

      if (payload["type"] !== "refresh") {
        throw new UnauthorizedError("Tipo de token inválido");
      }

      const accessToken = await signToken(
        { sub: payload.sub, email: payload["email"], type: "access" },
        env.JWT_ACCESS_SECRET,
        env.JWT_ACCESS_EXPIRES_IN
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedError("Refresh token inválido o expirado");
    }
  },

  async me(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("Usuario");

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  },
};
