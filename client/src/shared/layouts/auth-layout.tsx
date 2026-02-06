import type { ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

export const AuthLayout = ({ children }: Props) => {
  return (
    <div className="grid lg:grid-cols-2 min-h-dvh">
      <div className="flex items-center justify-center">
        <div className="container max-w-xl p-4">{children}</div>
      </div>

      <div className="hidden lg:block bg-primary bg-[url('/images/auth-bg.jpg')] bg-cover bg-center bg-no-repeat shadow-2xl"></div>
    </div>
  );
};
