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
      useLoginMutation: vi.fn(),
      useLogoutMutation: vi.fn(),
      useMeQuery: vi.fn(),
      useLazyMeQuery: vi.fn(),
      useRefreshMutation: vi.fn(),
    };
  }),
}));

vi.mock("../../store/api", () => ({
  api: {
    injectEndpoints: injectEndpointsMock,
  },
}));

import { authApi } from "./authApi";

describe("authApi", () => {
  it("defines the expected auth endpoints", () => {
    expect(injectEndpointsMock).toHaveBeenCalledWith(
      expect.objectContaining({ overrideExisting: false })
    );

    const login = authApi.endpoints.login as {
      query: (body: { email: string; password: string }) => unknown;
    };
    const logout = authApi.endpoints.logout as { query: () => unknown };
    const me = authApi.endpoints.me as { query: () => unknown; providesTags: unknown };
    const refresh = authApi.endpoints.refresh as {
      query: (body: { refreshToken: string }) => unknown;
    };

    expect(login.query({ email: "admin@example.com", password: "secret" })).toEqual({
      url: "/auth/login",
      method: "POST",
      body: { email: "admin@example.com", password: "secret" },
    });
    expect(logout.query()).toEqual({ url: "/auth/logout", method: "POST" });
    expect(me.query()).toBe("/auth/me");
    expect(me.providesTags).toEqual(["User"]);
    expect(refresh.query({ refreshToken: "token" })).toEqual({
      url: "/auth/refresh",
      method: "POST",
      body: { refreshToken: "token" },
    });
  });
});
