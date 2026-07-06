import { describe, it, expect, vi, beforeEach } from "vitest";
import { tasksService } from "../../modules/tasks/tasks.service.js";
import { tasksQuery } from "../../modules/tasks/tasks.query.js";
import { prisma } from "../../lib/prisma.js";

const mockPrismaTask = prisma.task as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const baseTask = {
  id: "task-1",
  title: "Test task",
  description: null,
  status: "PENDING" as const,
  userId: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

describe("tasksQuery", () => {
  beforeEach(() => vi.clearAllMocks());

  it("findAll devuelve tareas serializadas", async () => {
    mockPrismaTask.findMany.mockResolvedValue([baseTask]);

    const result = await tasksQuery.findAll("user-1");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "task-1",
      title: "Test task",
      status: "PENDING",
    });
    expect(typeof result[0]!.createdAt).toBe("string"); // ISO string
  });

  it("findById devuelve null si no encuentra", async () => {
    mockPrismaTask.findFirst.mockResolvedValue(null);

    const result = await tasksQuery.findById("x", "user-1");
    expect(result).toBeNull();
  });
});

describe("tasksService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("create devuelve tarea creada", async () => {
    mockPrismaTask.create.mockResolvedValue({
      ...baseTask,
      title: "Nueva tarea",
    });

    const result = await tasksService.create("user-1", { title: "Nueva tarea" });

    expect(result.title).toBe("Nueva tarea");
    expect(result.userId).toBe("user-1");
  });

  it("delete lanza NotFoundError si la tarea no pertenece al usuario", async () => {
    mockPrismaTask.findFirst.mockResolvedValue(null);

    await expect(tasksService.delete("task-1", "otro-user")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
