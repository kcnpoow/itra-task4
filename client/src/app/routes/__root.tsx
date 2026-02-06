import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import { NotFound } from "@/pages/not-found";
import { Toaster } from "@/shared/shadcn/components/ui/sonner";

interface RouterContext {
  isAuthenticated: boolean;
}

const RootRoute = () => {
  return (
    <>
      <Outlet />

      <Toaster position="bottom-center" />
    </>
  );
};

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
  notFoundComponent: NotFound,
});
