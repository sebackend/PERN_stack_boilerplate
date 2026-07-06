import { Router, type Router as ExpressRouter } from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.js";
import { authenticate } from "../../middleware/auth.js";
import { LoginSchema, RefreshSchema } from "@repo/shared";

export const authRoutes: ExpressRouter = Router();

// POST /api/v1/auth/login
authRoutes.post("/login", validate(LoginSchema), authController.login);

// POST /api/v1/auth/refresh
authRoutes.post("/refresh", validate(RefreshSchema), authController.refresh);

// POST /api/v1/auth/logout
authRoutes.post("/logout", authenticate, authController.logout);

// GET /api/v1/auth/me
authRoutes.get("/me", authenticate, authController.me);
