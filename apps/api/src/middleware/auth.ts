import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../lib/errors.js";

export interface JwtPayload {
  sub: string;
  email: string;
  type: "access" | "refresh";
}

// Extender tipos de Express
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Token no proporcionado"));
    }

    const token = authHeader.slice(7);
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

    const { payload } = await jwtVerify(token, secret);

    if (payload["type"] !== "access") {
      return next(new UnauthorizedError("Tipo de token inválido"));
    }

    req.user = {
      id: payload.sub as string,
      email: payload["email"] as string,
    };

    next();
  } catch {
    next(new UnauthorizedError("Token inválido o expirado"));
  }
};
