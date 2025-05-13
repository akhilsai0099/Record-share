import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routerWithQueryClient } from "@tanstack/react-router-with-query";
import { ErrorFallback } from "./components/loaders/error-fallback";
import { LoadingFallback } from "./components/loaders/loading-fallback";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  const queryClient = new QueryClient();

  return routerWithQueryClient(
    createTanStackRouter({
      routeTree,
      context: { queryClient },
      defaultPreload: "intent",
      scrollRestoration: true,
      defaultPendingComponent: () => <LoadingFallback />,
      defaultPendingMinMs: 300,
      defaultErrorComponent: ({ error }) => (
        <ErrorFallback error={error as Error} />
      ),
    }),
    queryClient
  );
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
