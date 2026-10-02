import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

// The root route renders a full document (<html>/<head>/<body>); React 19
// places that content into the real document singletons, so the render
// container stays empty. Assert via router state and document.body instead.
async function renderAt(path: string) {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  render(<RouterProvider router={router} />);
  return router;
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

// Assert only that the router mounts and paints, never page content:
// routes are rewritten as the app is built and this must keep passing.
describe("App routing", () => {
  it("renders the index route", async () => {
    const router = await renderAt("/");

    await waitFor(() => expect(router.state.status).toBe("idle"));
    expect(router.state.matches.some((m) => m.routeId === "/")).toBe(true);
    await waitFor(() => expect(document.body.textContent).not.toBe(""));
  });

  it("renders the not-found route", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const router = await renderAt("/this-route-does-not-exist");

    await waitFor(() => expect(router.state.status).toBe("idle"));
    await waitFor(() => expect(document.body.textContent).not.toBe(""));
  });
});
