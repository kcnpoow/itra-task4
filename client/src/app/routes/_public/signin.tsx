import { createFileRoute } from "@tanstack/react-router";

import { Signin } from "@/pages/signin";

export const Route = createFileRoute("/_public/signin")({
  component: Signin,
});
