import express, { type Express } from "express";
import { loggingMiddleware } from "./middleware/logging.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { tasksRoutes } from "./modules/tasks/tasks.routes.js";

export function createApp(): Express {
  const app = express();

  // ─── Global middleware ─────────────────────────────────────────────────────
  app.use(loggingMiddleware);
  app.use(corsMiddleware);
  app.use(express.json());

  // ─── Health check ─────────────────────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ─── Versioned routes ─────────────────────────────────────────────────────
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/tasks", tasksRoutes);

  // ─── 404 handler ─────────────────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found", statusCode: 404 });
  });

  // ─── Central error handler ────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
