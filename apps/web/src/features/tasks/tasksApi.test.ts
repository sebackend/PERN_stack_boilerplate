import { describe, expect, it, vi } from "vitest";

const { injectEndpointsMock } = vi.hoisted(() => ({
  injectEndpointsMock: vi.fn((config: {
    endpoints: (builder: {
      mutation: <T>(definition: T) => T;
      query: <T>(definition: T) => T;
    }) => Record<string, unknown>;
    overrideExisting: boolean;
  }) => {
    const endpoints = config.endpoints({
      mutation: (definition) => definition,
      query: (definition) => definition,
    });

    return {
      endpoints,
      useGetTasksQuery: vi.fn(),
      useGetTaskQuery: vi.fn(),
      useCreateTaskMutation: vi.fn(),
      useUpdateTaskMutation: vi.fn(),
      useDeleteTaskMutation: vi.fn(),
    };
  }),
}));

vi.mock("../../store/api", () => ({
  api: {
    injectEndpoints: injectEndpointsMock,
  },
}));

import { tasksApi } from "./tasksApi";

describe("tasksApi", () => {
  it("defines the expected queries, mutations, and tags", () => {
    expect(injectEndpointsMock).toHaveBeenCalledWith(
      expect.objectContaining({ overrideExisting: false })
    );

    const getTasks = tasksApi.endpoints.getTasks as {
      query: () => unknown;
      providesTags: (result?: Array<{ id: string }>) => unknown;
    };
    const getTask = tasksApi.endpoints.getTask as {
      query: (id: string) => unknown;
      providesTags: (_result: unknown, _err: unknown, id: string) => unknown;
    };
    const createTask = tasksApi.endpoints.createTask as {
      query: (body: { title: string }) => unknown;
      invalidatesTags: unknown;
    };
    const updateTask = tasksApi.endpoints.updateTask as {
      query: (body: { id: string; status: string }) => unknown;
      invalidatesTags: (_result: unknown, _err: unknown, body: { id: string }) => unknown;
    };
    const deleteTask = tasksApi.endpoints.deleteTask as {
      query: (id: string) => unknown;
      invalidatesTags: unknown;
    };

    expect(getTasks.query()).toBe("/tasks");
    expect(getTasks.providesTags([{ id: "task-1" }])).toEqual([
      { type: "Task", id: "task-1" },
      { type: "Task", id: "LIST" },
    ]);
    expect(getTasks.providesTags()).toEqual([{ type: "Task", id: "LIST" }]);

    expect(getTask.query("task-1")).toBe("/tasks/task-1");
    expect(getTask.providesTags(undefined, undefined, "task-1")).toEqual([
      { type: "Task", id: "task-1" },
    ]);

    expect(createTask.query({ title: "New task" })).toEqual({
      url: "/tasks",
      method: "POST",
      body: { title: "New task" },
    });
    expect(createTask.invalidatesTags).toEqual([{ type: "Task", id: "LIST" }]);

    expect(updateTask.query({ id: "task-1", status: "DONE" })).toEqual({
      url: "/tasks/task-1",
      method: "PATCH",
      body: { status: "DONE" },
    });
    expect(updateTask.invalidatesTags(undefined, undefined, { id: "task-1" })).toEqual([
      { type: "Task", id: "task-1" },
    ]);

    expect(deleteTask.query("task-1")).toEqual({
      url: "/tasks/task-1",
      method: "DELETE",
    });
    expect(deleteTask.invalidatesTags).toEqual([{ type: "Task", id: "LIST" }]);
  });
});
