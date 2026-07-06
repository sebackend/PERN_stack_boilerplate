import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TaskForm from "./TaskForm";

const createTaskMock = vi.fn();
const updateTaskMock = vi.fn();

vi.mock("./tasksApi", () => ({
  useCreateTaskMutation: () => [createTaskMock, { isLoading: false }],
  useUpdateTaskMutation: () => [updateTaskMock, { isLoading: false }],
}));

describe("TaskForm", () => {
  beforeEach(() => {
    createTaskMock.mockReset();
    updateTaskMock.mockReset();
  });

  it("muestra error si el título está vacío", async () => {
    const user = userEvent.setup();

    render(<TaskForm onClose={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Crear" }));

    expect(await screen.findByText("El título es requerido")).toBeInTheDocument();
    expect(createTaskMock).not.toHaveBeenCalled();
  });

  it("crea una tarea con valores trimmeados y cierra el modal", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const unwrap = vi.fn().mockResolvedValue({ id: "task-1" });

    createTaskMock.mockReturnValue({ unwrap });

    render(<TaskForm onClose={onClose} />);

    await user.type(screen.getByPlaceholderText("Nombre de la tarea"), "  Nueva tarea  ");
    await user.type(screen.getByPlaceholderText("Descripción opcional..."), "  Revisar PR  ");
    await user.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledWith({
        title: "Nueva tarea",
        description: "Revisar PR",
        status: "PENDING",
      });
    });

    expect(unwrap).toHaveBeenCalled();
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
