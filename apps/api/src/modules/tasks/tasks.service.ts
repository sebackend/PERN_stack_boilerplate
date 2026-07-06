import { prisma } from "../../lib/prisma.js";
import { NotFoundError } from "../../lib/errors.js";
import type { CreateTaskInput, UpdateTaskInput, TaskResponse } from "@repo/shared";

function serializeTask(task: {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export const tasksService = {
  async create(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
    const task = await prisma.task.create({
      data: {
        title: input.title,
        description: input.description,
        status: input.status ?? ("PENDING" as const),
        userId,
      },
    });
    return serializeTask(task);
  },

  async update(
    id: string,
    userId: string,
    input: UpdateTaskInput
  ): Promise<TaskResponse> {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError("Tarea");

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });
    return serializeTask(task);
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundError("Tarea");
    await prisma.task.delete({ where: { id } });
  },
};
