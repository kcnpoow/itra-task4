import { LogOut } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/features/auth";
import { Button } from "@/shared/shadcn/components/ui/button";
import { useAuthStore } from "@/shared/store/authStore";
import { Spinner } from "@/shared/shadcn/components/ui/spinner";

export const Header = () => {
  const { user, logout } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: logout,
  });

  return (
    <header className="container flex justify-end py-2">
      <Button
        variant="destructive"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        {logoutMutation.isPending ? <Spinner /> : <LogOut />} {user?.firstName}{" "}
        {user?.lastName}
      </Button>
    </header>
  );
};
