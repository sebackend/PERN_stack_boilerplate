// ─── Error base de la app ─────────────────────────────────────────────────────

export class AppError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Errores tipados ──────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Acceso prohibido") {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  readonly errors: unknown;
  constructor(errors: unknown) {
    super("Error de validación", 422);
    this.errors = errors;
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto") {
    super(message, 409);
  }
}
