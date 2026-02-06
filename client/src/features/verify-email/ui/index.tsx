import { useEffect } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/features/auth";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/shared/shadcn/components/ui/empty";

export const VerifyEmail = () => {
  const { token } = useSearch({ from: "/verify-email" }) as {
    token?: string;
  };

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
  });

  useEffect(() => {
    if (!token) {
      return;
    }

    verifyMutation.mutate(token);
  }, [token]);

  const renderMessage = () => {
    if (verifyMutation.isPending) {
      return "Hang tight! We're verifying your email address...";
    }

    if (verifyMutation.isError || !token) {
      return "Oops! This verification link is invalid or has expired";
    }

    return "Success! Your email has been verified";
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{renderMessage()}</EmptyTitle>
          </EmptyHeader>

          {!verifyMutation.isPending && (
            <EmptyContent>
              <EmptyDescription>
                <Link to="/" replace>
                  Return Home
                </Link>
              </EmptyDescription>
            </EmptyContent>
          )}
        </Empty>
      </div>
    </div>
  );
};
