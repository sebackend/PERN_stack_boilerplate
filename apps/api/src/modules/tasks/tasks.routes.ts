import { Router, type Router as ExpressRouter } from "express";
import { tasksController } from "./tasks.controller.js";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { CreateTaskSchema, TaskIdParamsSchema, UpdateTaskSchema } from "@repo/shared";

export const tasksRoutes: ExpressRouter = Router();

// All task routes require authentication.
tasksRoutes.use(authenticate);

// GET /api/v1/tasks
tasksRoutes.get("/", tasksController.getAll);

// GET /api/v1/tasks/:id
tasksRoutes.get("/:id", validate(TaskIdParamsSchema, "params"), tasksController.getById);

// POST /api/v1/tasks
tasksRoutes.post("/", validate(CreateTaskSchema), tasksController.create);

// PATCH /api/v1/tasks/:id
tasksRoutes.patch(
  "/:id",
  validate(TaskIdParamsSchema, "params"),
  validate(UpdateTaskSchema),
  tasksController.update
);

// DELETE /api/v1/tasks/:id
tasksRoutes.delete("/:id", validate(TaskIdParamsSchema, "params"), tasksController.delete);
