import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location, context }) => {
    if (!context.authState?.user)
      return redirect({
        to: "/login",
        search: {
          redirectTo: location.href,
        },
      });
  },
});
