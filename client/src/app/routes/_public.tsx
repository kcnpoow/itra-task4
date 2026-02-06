import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

const PublicRoute = () => {
  return (
    <main>
      <Outlet />
    </main>
  );
};

export const Route = createFileRoute("/_public")({
  component: PublicRoute,
  beforeLoad: async ({ context }) => {
    if (context.isAuthenticated) {
      throw redirect({
        to: "/",
      });
    }
  },
});
