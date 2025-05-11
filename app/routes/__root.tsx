// app/routes/__root.tsx
import { fetchUserQueryOptions } from "@/actions/queryOptions";
import { Layout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Nav } from "@/components/ui/nav";
import { Toaster } from "@/components/ui/sonner";
import appCss from "@/styles/app.css?url";
import { QueryClient } from "@tanstack/react-query";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "RecSha - Screen Recorder",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const authState = await context.queryClient.ensureQueryData(
      fetchUserQueryOptions()
    );
    return { authState };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <ThemeProvider defaultTheme="system" storageKey="recsha-theme">
        <Layout>
          <div className="min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </Layout>
        <Toaster position="top-right" />
      </ThemeProvider>
      <ReactQueryDevtoolsPanel />
      <TanStackRouterDevtools />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />{" "}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                    const storageKey = "recsha-theme";
                    const theme = localStorage.getItem(storageKey);
                    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                    const documentTheme = theme === "system" ? systemTheme : theme || systemTheme;
                    
                    document.documentElement.classList.add(documentTheme);
                  }
                } catch (e) {
                  console.error("Theme initialization failed:", e);
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
