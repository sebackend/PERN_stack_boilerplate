import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service.js";

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await authService.login(req.body);
      res.status(200).json(tokens);
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      const result = await authService.refresh(refreshToken);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response) {
    // Stateless JWT: the client removes tokens locally.
    // If a blacklist is added later, invalidate the refresh token in the DB here.
    res.status(200).json({ message: "Session closed successfully" });
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.user!.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },
};
