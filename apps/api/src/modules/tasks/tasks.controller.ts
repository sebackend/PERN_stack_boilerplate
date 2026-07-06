import type { Request, Response, NextFunction } from "express";
import { tasksQuery } from "./tasks.query.js";
import { tasksService } from "./tasks.service.js";
import { NotFoundError } from "../../lib/errors.js";

export const tasksController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await tasksQuery.findAll(req.user!.id);
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const task = await tasksQuery.findById(id, req.user!.id);
      if (!task) return next(new NotFoundError("Tarea"));
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await tasksService.create(req.user!.id, req.body);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const task = await tasksService.update(id, req.user!.id, req.body);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      await tasksService.delete(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
