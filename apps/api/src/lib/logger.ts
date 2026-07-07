import pino from "pino";
import { env } from "../config/env.js";

if (env.NODE_ENV === "test") {
  process.env["PINO_LOG_LEVEL"] = "silent";
}

export const logger = pino(
  env.NODE_ENV === "test"
    ? {
        level: "silent",
      }
    : env.NODE_ENV === "development"
    ? {
        level: "debug",
      }
    : {
        level: "info",
        redact: ["req.headers.authorization", "body.password", "body.passwordHash"],
      }
);
