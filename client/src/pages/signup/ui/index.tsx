import { Link } from "@tanstack/react-router";

import { AuthLayout } from "@/shared/layouts/auth-layout";
import { Logo } from "@/shared/ui/logo";
import { SignupForm } from "@/features/auth";

export const Signup = () => {
  return (
    <AuthLayout>
      <Logo classname="text-4xl" />

      <div className="max-w-xs mx-auto my-8 lg:my-24">
        <span className="font-light">Start your journey</span>
        <h1 className="mb-10 text-2xl font-bold">Sign Up</h1>

        <SignupForm />
      </div>

      <p className="text-center">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  );
};
