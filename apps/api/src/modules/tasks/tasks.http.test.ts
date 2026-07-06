import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";
import { createApp } from "../../app.js";
import { prisma } from "../../lib/prisma.js";

const mockPrismaTask = prisma.task as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const baseTask = {
  id: "cktask0000000000000000001",
  title: "Preparar release",
  description: "Validar entregables",
  status: "PENDING" as const,
  userId: "user-1",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

async function signAccessToken(): Promise<string> {
  const key = new TextEncoder().encode(process.env["JWT_ACCESS_SECRET"]);

  return new SignJWT({ sub: baseTask.userId, email: "admin@example.com", type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

describe("tasks routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /api/v1/tasks requiere autenticación", async () => {
    const response = await request(createApp()).get("/api/v1/tasks");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: "Token no proporcionado",
      statusCode: 401,
    });
  });

  it("GET /api/v1/tasks devuelve tareas del usuario", async () => {
    const accessToken = await signAccessToken();
    mockPrismaTask.findMany.mockResolvedValue([baseTask]);

    const response = await request(createApp())
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...baseTask,
        createdAt: baseTask.createdAt.toISOString(),
        updatedAt: baseTask.updatedAt.toISOString(),
      },
    ]);
  });

  it("POST /api/v1/tasks crea una tarea", async () => {
    const accessToken = await signAccessToken();
    mockPrismaTask.create.mockResolvedValue(baseTask);

    const response = await request(createApp())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: baseTask.title, description: baseTask.description });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...baseTask,
      createdAt: baseTask.createdAt.toISOString(),
      updatedAt: baseTask.updatedAt.toISOString(),
    });
  });

  it("POST /api/v1/tasks valida el body", async () => {
    const accessToken = await signAccessToken();

    const response = await request(createApp())
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "" });

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: "Error de validación",
      statusCode: 422,
    });
  });

  it("GET /api/v1/tasks/:id devuelve 404 si no existe", async () => {
    const accessToken = await signAccessToken();
    mockPrismaTask.findFirst.mockResolvedValue(null);

    const response = await request(createApp())
      .get("/api/v1/tasks/cktask4040000000000000000")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: "Tarea no encontrado",
      statusCode: 404,
    });
  });

  it("PATCH /api/v1/tasks/:id actualiza una tarea", async () => {
    const accessToken = await signAccessToken();
    const updatedTask = { ...baseTask, status: "DONE" as const };
    mockPrismaTask.findFirst.mockResolvedValue(baseTask);
    mockPrismaTask.update.mockResolvedValue(updatedTask);

    const response = await request(createApp())
      .patch(`/api/v1/tasks/${baseTask.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ status: "DONE" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ...updatedTask,
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString(),
    });
  });

  it("DELETE /api/v1/tasks/:id elimina una tarea", async () => {
    const accessToken = await signAccessToken();
    mockPrismaTask.findFirst.mockResolvedValue(baseTask);
    mockPrismaTask.delete.mockResolvedValue(baseTask);

    const response = await request(createApp())
      .delete(`/api/v1/tasks/${baseTask.id}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(204);
    expect(response.text).toBe("");
  });

  it("GET /api/v1/tasks/:id devuelve 422 si el id es vacío o whitespace", async () => {
    const accessToken = await signAccessToken();

    const response = await request(createApp())
      .get("/api/v1/tasks/%20")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: "Error de validación",
      statusCode: 422,
    });
  });

  it("GET /api/v1/tasks devuelve 500 ante error inesperado", async () => {
    const accessToken = await signAccessToken();
    mockPrismaTask.findMany.mockRejectedValue(new Error("db down"));

    const response = await request(createApp())
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(500);
    expect(response.body).toMatchObject({
      error: "Error interno del servidor",
      statusCode: 500,
    });
  });
});
