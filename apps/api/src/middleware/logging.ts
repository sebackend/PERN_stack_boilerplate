import { pinoHttp } from "pino-http";
import type { Options } from "pino-http";
import type { Request } from "express";
import { logger } from "../lib/logger.js";

// Campos sensibles que nunca deben aparecer en los logs del body.
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
  // El body se agrega vía customProps porque recibe el req real de express
  // (ya parseado por express.json); el serializer de req no lo expone de forma fiable.
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
