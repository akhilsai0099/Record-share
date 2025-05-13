import { authClient } from "@/lib/auth-client";
import { createMiddleware } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";

export const authenticated = createMiddleware().server(async ({ next }) => {
  const { data: session } = await authClient.getSession({
    fetchOptions: {
      headers: getHeaders() as HeadersInit,
    },
  });

  if (!session) {
    throw new Error("User not authenticated");
  }

  return next({
    context: {
      user: session.user,
    },
  });
});
