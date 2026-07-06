import type { Request, Response, NextFunction } from "express";
import { AppError, ValidationError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Error operacional conocido
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, reqId: req.id }, err.message);
    } else {
      logger.warn({ err: { message: err.message, statusCode: err.statusCode }, reqId: req.id }, err.message);
    }

    const body: Record<string, unknown> = {
      error: err.message,
      statusCode: err.statusCode,
    };

    if (err instanceof ValidationError) {
      body["details"] = err.errors;
    }

    return res.status(err.statusCode).json(body);
  }

  // Error inesperado
  logger.error({ err, reqId: req.id }, "Error no manejado");
  return res.status(500).json({
    error: "Error interno del servidor",
    statusCode: 500,
  });
};
