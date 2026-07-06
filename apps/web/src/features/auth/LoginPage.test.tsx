import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./LoginPage";
import { setCredentials, setUser } from "./authSlice";

const navigateMock = vi.fn();
const dispatchMock = vi.fn();
const loginMock = vi.fn();
const fetchMeMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
}));

vi.mock("./authApi", () => ({
  useLoginMutation: () => [loginMock, { isLoading: false }],
  useLazyMeQuery: () => [fetchMeMock],
}));

describe("LoginPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    dispatchMock.mockReset();
    loginMock.mockReset();
    fetchMeMock.mockReset();
  });

  it("muestra error cuando las credenciales son inválidas", async () => {
    const user = userEvent.setup();

    loginMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("invalid credentials")),
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    expect(
      await screen.findByText("Credenciales inválidas. Verifica tu email y contraseña.")
    ).toBeInTheDocument();
    expect(dispatchMock).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("guarda credenciales, carga el usuario y navega a tasks", async () => {
    const user = userEvent.setup();
    const loginUnwrap = vi.fn().mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
    const meUnwrap = vi.fn().mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      createdAt: "2026-01-01T00:00:00.000Z",
    });

    loginMock.mockReturnValue({ unwrap: loginUnwrap });
    fetchMeMock.mockReturnValue({ unwrap: meUnwrap });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        setCredentials({
          accessToken: "access-token",
          refreshToken: "refresh-token",
        })
      );
    });

    expect(dispatchMock).toHaveBeenCalledWith(
      setUser({
        id: "user-1",
        email: "admin@example.com",
        createdAt: "2026-01-01T00:00:00.000Z",
      })
    );
    expect(navigateMock).toHaveBeenCalledWith("/tasks");
  });

  it("navega aunque falle /auth/me después del login", async () => {
    const user = userEvent.setup();

    loginMock.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      }),
    });
    fetchMeMock.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("me failed")),
    });

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Email"), "admin@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "password123");
    await user.click(screen.getByRole("button", { name: "Iniciar sesión" }));

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        setCredentials({
          accessToken: "access-token",
          refreshToken: "refresh-token",
        })
      );
    });

    expect(navigateMock).toHaveBeenCalledWith("/tasks");
  });
});
