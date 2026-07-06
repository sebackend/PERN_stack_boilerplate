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
    // Stateless JWT: el cliente elimina los tokens
    // Si se implementara blacklist, aquí se invalida el refreshToken en DB
    res.status(200).json({ message: "Sesión cerrada correctamente" });
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
