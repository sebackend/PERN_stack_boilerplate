import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const TaskStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// ─── Input schemas ───────────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  description: z.string().max(2000).optional(),
  status: TaskStatusEnum.optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: TaskStatusEnum.optional(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export const TaskIdParamsSchema = z.object({
  id: z.string().trim().min(1, "El id es requerido").max(191, "El id es inválido"),
});

export type TaskIdParams = z.infer<typeof TaskIdParamsSchema>;

// ─── Response schema ─────────────────────────────────────────────────────────

export const TaskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export const TaskListResponseSchema = z.array(TaskResponseSchema);
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
