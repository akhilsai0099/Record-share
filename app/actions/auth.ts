import { authClient } from "@/lib/auth-client";
import { createServerFn } from "@tanstack/react-start";
import { getHeaders } from "@tanstack/react-start/server";
import { setTimeout } from "timers/promises";

export const fetchUser = createServerFn({ method: "GET" }).handler(
  async ({}) => {
    const { data: session } = await authClient.getSession({
      fetchOptions: {
        headers: getHeaders() as HeadersInit,
      },
    });

    if (!session) {
      return null;
    }
    return {
      user: session.user,
      session: session.session,
    };
  }
);
