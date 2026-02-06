import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { Header } from "@/widgets/header";

const ProtectedRoute = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export const Route = createFileRoute("/_protected")({
  component: ProtectedRoute,
  beforeLoad: async ({ context }) => {
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/signin",
      });
    }
  },
});
