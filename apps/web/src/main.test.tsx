import { beforeEach, describe, expect, it, vi } from "vitest";

describe("main", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it("monta la app en el nodo root", async () => {
    const renderMock = vi.fn();
    const createRootMock = vi.fn(() => ({ render: renderMock }));

    vi.doMock("react-dom/client", () => ({
      createRoot: createRootMock,
    }));

    await import("./main");

    expect(createRootMock).toHaveBeenCalledWith(document.getElementById("root"));
    expect(renderMock).toHaveBeenCalledTimes(1);
  });
});
