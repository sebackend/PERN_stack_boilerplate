import { describe, expect, it } from "vitest";
import { store } from "./store";
import { api } from "./api";

describe("store", () => {
  it("configura reducers de api y auth", () => {
    const state = store.getState();

    expect(state).toHaveProperty(api.reducerPath);
    expect(state).toHaveProperty("auth");
  });
});
