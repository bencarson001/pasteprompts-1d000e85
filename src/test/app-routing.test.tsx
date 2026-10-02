import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { routeTree } from "@/routeTree.gen";

// The root route renders a full document (<html>/<head>/<body>); React 19
// places that content into the real document singletons, so the render
// container stays empty and only ONE router can be mounted per test file
// run (two mounts fight over the document singletons in jsdom). Assert via
// router state and document.body, and cover both routes in one mount.
function makeRouter(path: string) {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// Assert only that the router mounts and paints, never page content:
// routes are rewritten as the app is built and this must keep passing.
describe("App routing", () => {
  it("renders the index route, then the not-found route", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const router = makeRouter("/");
    await router.load();
    render(<RouterProvider router={router} />);

    await waitFor(() => expect(router.state.status).toBe("idle"));
    expect(router.state.matches.some((m) => m.routeId === "/")).toBe(true);
    await waitFor(() => expect(document.body.textContent).not.toBe(""));

    await router.navigate({ to: "/this-route-does-not-exist" as "/" });
    await waitFor(() => expect(router.state.status).toBe("idle"));
    expect(router.state.location.pathname).toBe("/this-route-does-not-exist");
    await waitFor(() => expect(document.body.textContent).not.toBe(""));
  });
});
