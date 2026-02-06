import { Link } from "@tanstack/react-router";

import { AuthLayout } from "@/shared/layouts/auth-layout";
import { Logo } from "@/shared/ui/logo";
import { SigninForm } from "@/features/auth";

export const Signin = () => {
  return (
    <AuthLayout>
      <Logo classname="text-4xl" />

      <div className="max-w-xs mx-auto my-8 lg:my-24">
        <span className="font-light">Start your journey</span>
        <h1 className="mb-10 text-2xl font-bold">Sign In to The App</h1>

        <SigninForm />
      </div>

      <p className="text-center">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </AuthLayout>
  );
};
