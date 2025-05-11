import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  loader: async () => "Hello from the admin route! This is a static string.",
});

function RouteComponent() {
  const state = Route.useLoaderData();

  return (
    <>
      <div>{state}</div>
      <Link to="/">Go to /</Link>
    </>
  );
}
