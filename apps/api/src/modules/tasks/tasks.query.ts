import { prisma } from "../../lib/prisma.js";
import type { TaskResponse } from "@repo/shared";

function serializeTask(task: {
  id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export const tasksQuery = {
  async findAll(userId: string): Promise<TaskResponse[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ dueDate: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    });
    return tasks.map(serializeTask);
  },

  async findById(id: string, userId: string): Promise<TaskResponse | null> {
    const task = await prisma.task.findFirst({
      where: { id, userId },
    });
    return task ? serializeTask(task) : null;
  },
};
