import { pinoHttp } from "pino-http";
import type { Options } from "pino-http";
import type { Request } from "express";
import { logger } from "../lib/logger.js";

// Sensitive fields that must never appear in request body logs.
const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "token",
  "refreshToken",
  "accessToken",
]);

function redactBody(body: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      SENSITIVE_KEYS.has(key) ? "[REDACTED]" : value,
    ])
  );
}

const options: Options = {
  logger,
  genReqId: (req) => {
    return (req.headers["x-request-id"] as string) ?? crypto.randomUUID();
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // The body is added via customProps because it receives the real Express req
  // (already parsed by express.json); the req serializer does not expose it reliably.
  customProps: (req) => {
    const body = (req as Request).body as Record<string, unknown> | undefined;
    if (body && typeof body === "object" && Object.keys(body).length > 0) {
      return { body: redactBody(body) };
    }
    return {};
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  redact: {
    paths: ["req.headers.authorization"],
    censor: "[REDACTED]",
  },
};

export const loggingMiddleware = pinoHttp(options);
