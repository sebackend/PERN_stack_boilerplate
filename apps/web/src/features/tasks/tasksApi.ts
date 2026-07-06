import { api } from "../../store/api";
import type {
  TaskResponse,
  CreateTaskInput,
  UpdateTaskInput,
} from "@repo/shared";

export const tasksApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TaskResponse[], void>({
      query: () => "/tasks",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Task" as const, id })),
              { type: "Task", id: "LIST" },
            ]
          : [{ type: "Task", id: "LIST" }],
    }),

    getTask: builder.query<TaskResponse, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _err, id) => [{ type: "Task", id }],
    }),

    createTask: builder.mutation<TaskResponse, CreateTaskInput>({
      query: (body) => ({
        url: "/tasks",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),

    updateTask: builder.mutation<TaskResponse, { id: string } & UpdateTaskInput>({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: "Task", id }],
    }),

    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Task", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
