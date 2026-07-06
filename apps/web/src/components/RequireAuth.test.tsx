import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "./RequireAuth";
import { setUser } from "../features/auth/authSlice";

const dispatchMock = vi.fn();
const meQueryMock = vi.fn();

const mockState = {
  auth: {
    isAuthenticated: false,
    user: null as null | {
      id: string;
      email: string;
      createdAt: string;
    },
  },
};

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");

  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate">{to}</div>,
  };
});

vi.mock("../store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: typeof mockState) => unknown) => selector(mockState),
}));

vi.mock("../features/auth/authApi", () => ({
  useMeQuery: (...args: unknown[]) => meQueryMock(...args),
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    dispatchMock.mockReset();
    meQueryMock.mockReset();
    mockState.auth.isAuthenticated = false;
    mockState.auth.user = null;
  });

  it("redirige a login si no hay sesión", () => {
    meQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(
      <RequireAuth>
        <div>Private content</div>
      </RequireAuth>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("/login");
  });

  it("muestra estado de carga mientras valida la sesión", () => {
    mockState.auth.isAuthenticated = true;

    meQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
    });

    render(
      <RequireAuth>
        <div>Private content</div>
      </RequireAuth>
    );

    expect(screen.getByText("Verificando sesión...")).toBeInTheDocument();
  });

  it("hidrata el usuario cuando /me responde y renderiza children", async () => {
    mockState.auth.isAuthenticated = true;

    meQueryMock.mockReturnValue({
      data: {
        id: "user-1",
        email: "admin@example.com",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      isLoading: false,
      isFetching: false,
      isError: false,
    });

    render(
      <RequireAuth>
        <div>Private content</div>
      </RequireAuth>
    );

    expect(screen.getByText("Private content")).toBeInTheDocument();

    await waitFor(() => {
      expect(dispatchMock).toHaveBeenCalledWith(
        setUser({
          id: "user-1",
          email: "admin@example.com",
          createdAt: "2026-01-01T00:00:00.000Z",
        })
      );
    });
  });

  it("redirige a login si falla la validación de sesión", () => {
    mockState.auth.isAuthenticated = true;

    meQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
    });

    render(
      <RequireAuth>
        <div>Private content</div>
      </RequireAuth>
    );

    expect(screen.getByTestId("navigate")).toHaveTextContent("/login");
  });
});
