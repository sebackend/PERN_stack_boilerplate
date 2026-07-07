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

  it("findAll returns serialized tasks", async () => {
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

  it("findById returns null when the task is not found", async () => {
    mockPrismaTask.findFirst.mockResolvedValue(null);

    const result = await tasksQuery.findById("x", "user-1");
    expect(result).toBeNull();
  });
});

describe("tasksService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("create returns the created task", async () => {
    mockPrismaTask.create.mockResolvedValue({
      ...baseTask,
      title: "New task",
    });

    const result = await tasksService.create("user-1", { title: "New task" });

    expect(result.title).toBe("New task");
    expect(result.userId).toBe("user-1");
  });

  it("delete throws NotFoundError when the task does not belong to the user", async () => {
    mockPrismaTask.findFirst.mockResolvedValue(null);

    await expect(tasksService.delete("task-1", "other-user")).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
