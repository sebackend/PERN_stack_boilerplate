import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const TaskStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "DONE"]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

// ─── Input schemas ───────────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  dueDate: z.string().datetime().nullable().optional(),
});

export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

export const TaskIdParamsSchema = z.object({
  id: z.string().trim().min(1, "ID is required").max(191, "Invalid ID"),
});

export type TaskIdParams = z.infer<typeof TaskIdParamsSchema>;

// ─── Response schema ─────────────────────────────────────────────────────────

export const TaskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: z.string().nullable(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TaskResponse = z.infer<typeof TaskResponseSchema>;

export const TaskListResponseSchema = z.array(TaskResponseSchema);
export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;
