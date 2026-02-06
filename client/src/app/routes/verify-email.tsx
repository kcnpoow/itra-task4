import { createFileRoute } from "@tanstack/react-router";

import { VerifyEmail } from "@/features/verify-email";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmail,
});
