import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { ValidationError } from "../lib/errors.js";

type ValidateTarget = "body" | "params" | "query";

export const validate =
  (schema: ZodSchema, target: ValidateTarget = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(new ValidationError(result.error.flatten().fieldErrors));
    }
    req[target] = result.data;
    next();
  };
