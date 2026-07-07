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

    void tasksApi;

    const config = injectEndpointsMock.mock.calls[0]?.[0];
    if (!config) {
      throw new Error("injectEndpoints was not called");
    }

    const endpoints = config.endpoints({
      mutation: <T>(definition: T) => definition,
      query: <T>(definition: T) => definition,
    }) as {
      getTasks: {
        query: () => unknown;
        providesTags: (result?: Array<{ id: string }>) => unknown;
      };
      getTask: {
        query: (id: string) => unknown;
        providesTags: (_result: unknown, _err: unknown, id: string) => unknown;
      };
      createTask: {
        query: (body: { title: string }) => unknown;
        invalidatesTags: unknown;
      };
      updateTask: {
        query: (body: { id: string; status: string }) => unknown;
        invalidatesTags: (_result: unknown, _err: unknown, body: { id: string }) => unknown;
      };
      deleteTask: {
        query: (id: string) => unknown;
        invalidatesTags: unknown;
      };
    };

    expect(endpoints.getTasks.query()).toBe("/tasks");
    expect(endpoints.getTasks.providesTags([{ id: "task-1" }])).toEqual([
      { type: "Task", id: "task-1" },
      { type: "Task", id: "LIST" },
    ]);
    expect(endpoints.getTasks.providesTags()).toEqual([{ type: "Task", id: "LIST" }]);

    expect(endpoints.getTask.query("task-1")).toBe("/tasks/task-1");
    expect(endpoints.getTask.providesTags(undefined, undefined, "task-1")).toEqual([
      { type: "Task", id: "task-1" },
    ]);

    expect(endpoints.createTask.query({ title: "New task" })).toEqual({
      url: "/tasks",
      method: "POST",
      body: { title: "New task" },
    });
    expect(endpoints.createTask.invalidatesTags).toEqual([{ type: "Task", id: "LIST" }]);

    expect(endpoints.updateTask.query({ id: "task-1", status: "DONE" })).toEqual({
      url: "/tasks/task-1",
      method: "PATCH",
      body: { status: "DONE" },
    });
    expect(endpoints.updateTask.invalidatesTags(undefined, undefined, { id: "task-1" })).toEqual([
      { type: "Task", id: "task-1" },
    ]);

    expect(endpoints.deleteTask.query("task-1")).toEqual({
      url: "/tasks/task-1",
      method: "DELETE",
    });
    expect(endpoints.deleteTask.invalidatesTags).toEqual([{ type: "Task", id: "LIST" }]);
  });
});
