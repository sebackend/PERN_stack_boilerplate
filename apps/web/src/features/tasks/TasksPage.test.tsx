import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TasksPage from "./TasksPage";
import { logout } from "../auth/authSlice";

const navigateMock = vi.fn();
const dispatchMock = vi.fn();
const getTasksQueryMock = vi.fn();
const deleteTaskMock = vi.fn();
const updateTaskMock = vi.fn();
const logoutMutationMock = vi.fn();

const mockState = {
  auth: {
    user: {
      id: "user-1",
      email: "admin@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  },
};

const baseTask = {
  id: "task-1",
  title: "Preparar release",
  description: "Validar entregables",
  status: "PENDING" as const,
  userId: "user-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("../auth/authApi", () => ({
  useLogoutMutation: () => [logoutMutationMock],
}));

vi.mock("./tasksApi", () => ({
  useGetTasksQuery: () => getTasksQueryMock(),
  useDeleteTaskMutation: () => [deleteTaskMock, { isLoading: false }],
  useUpdateTaskMutation: () => [updateTaskMock],
}));

vi.mock("./TaskForm", () => ({
  default: ({ task, onClose }: { task?: { title: string }; onClose: () => void }) => (
    <div data-testid="task-form">
      <span>{task?.title ?? "New task"}</span>
      <button onClick={onClose}>Close form</button>
    </div>
  ),
}));

describe("TasksPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    dispatchMock.mockReset();
    getTasksQueryMock.mockReset();
    deleteTaskMock.mockReset();
    updateTaskMock.mockReset();
    logoutMutationMock.mockReset();
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("shows loading, error, and empty state", async () => {
    getTasksQueryMock
      .mockReturnValueOnce({ data: undefined, isLoading: true, isError: false })
      .mockReturnValueOnce({ data: undefined, isLoading: false, isError: true })
      .mockReturnValueOnce({ data: [], isLoading: false, isError: false });

    const { rerender } = render(<TasksPage />);
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();

    rerender(<TasksPage />);
    expect(
      screen.getByText("Error loading tasks. Try refreshing the page.")
    ).toBeInTheDocument();

    rerender(<TasksPage />);
    expect(screen.getByText("You do not have any tasks yet.")).toBeInTheDocument();
  });

  it("opens and closes the create modal from the empty state", async () => {
    const user = userEvent.setup();

    getTasksQueryMock.mockReturnValue({ data: [], isLoading: false, isError: false });

    render(<TasksPage />);

    await user.click(screen.getByRole("button", { name: "Create the first one" }));
    expect(screen.getByTestId("task-form")).toHaveTextContent("New task");

    await user.click(screen.getByRole("button", { name: "Close form" }));
    expect(screen.queryByTestId("task-form")).not.toBeInTheDocument();
  });

  it("renders tasks and runs quick status, edit, delete, and logout", async () => {
    const user = userEvent.setup();
    const deleteUnwrap = vi.fn().mockResolvedValue(undefined);
    const updateUnwrap = vi.fn().mockResolvedValue({ ...baseTask, status: "IN_PROGRESS" });
    const logoutUnwrap = vi.fn().mockResolvedValue({ message: "ok" });

    getTasksQueryMock.mockReturnValue({
      data: [baseTask],
      isLoading: false,
      isError: false,
    });
    deleteTaskMock.mockReturnValue({ unwrap: deleteUnwrap });
    updateTaskMock.mockReturnValue({ unwrap: updateUnwrap });
    logoutMutationMock.mockReturnValue({ unwrap: logoutUnwrap });

    render(<TasksPage />);

    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
    expect(screen.getByText("1 task")).toBeInTheDocument();
    expect(screen.getByText("Preparar release")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Pending" }));

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith({
        id: "task-1",
        status: "IN_PROGRESS",
      });
    });

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByTestId("task-form")).toHaveTextContent("Preparar release");

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(deleteTaskMock).toHaveBeenCalledWith("task-1");
    });

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(logout());
    });
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
