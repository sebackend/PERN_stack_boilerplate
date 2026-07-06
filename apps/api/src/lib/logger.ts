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
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
        level: "debug",
      }
    : {
        level: "info",
        redact: ["req.headers.authorization", "body.password", "body.passwordHash"],
      }
);
