import { useEffect } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { routeTree } from "../routeTree.gen";
import { authApi } from "@/features/auth";
import { useAuthStore } from "@/shared/store/authStore";
import { Loader } from "@/shared/ui/loader";

export const router = createRouter({
  routeTree,
  notFoundMode: "root",
  context: { isAuthenticated: false },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const RouterProviderWithContext = () => {
  const { isAuthenticated, login, logout } = useAuthStore();

  const { data, status } = useQuery({
    queryFn: authApi.auth,
    queryKey: ["auth"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (status === "success") {
      login(data);
    }

    if (status === "error") {
      logout();
    }
  }, [data, status]);

  useEffect(() => {
    router.invalidate();
  }, [isAuthenticated]);

  if (status === "pending") {
    return <Loader />;
  }

  return <RouterProvider router={router} context={{ isAuthenticated }} />;
};
