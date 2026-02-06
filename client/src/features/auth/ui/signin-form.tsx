import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Mail } from "lucide-react";

import { authApi } from "../api";
import type { LoginDto } from "../types";
import {
  FloatingLabelInput,
  FloatingLabelPasswordInput,
} from "@/shared/ui/floating-label-input";
import { Button } from "@/shared/shadcn/components/ui/button";
import { Field, FieldGroup } from "@/shared/shadcn/components/ui/field";
import type { ApiError } from "@/shared/types/api-error";
import { Alert, AlertDescription } from "@/shared/shadcn/components/ui/alert";
import { Spinner } from "@/shared/shadcn/components/ui/spinner";
import { useAuthStore } from "@/shared/store/authStore";

export const SigninForm = () => {
  const authStore = useAuthStore();

  const {
    formState: { errors },
    register,
    setError,
    handleSubmit,
  } = useForm<LoginDto>();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      authStore.login(data);
    },
    onError: (error) => {
      if (axios.isAxiosError<ApiError>(error)) {
        const data = error.response?.data;

        const status = data?.status;
        const message = data?.message;

        if (!message) {
          setError("root", { message: "Unexpected error" });

          return;
        }

        switch (status) {
          case 401:
          case 404:
            setError("root", { message: "Invalid email or password" });
            break;
          case 403:
            setError("root", { message: "Email is blocked" });
            break;
          default:
            setError("root", { message });
            break;
        }
      }
    },
  });

  const onSubmit: SubmitHandler<LoginDto> = async (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <FloatingLabelInput
          id="email"
          label="E-mail"
          autoComplete="none"
          addon={<Mail />}
          disabled={loginMutation.isPending}
          {...register("email", { required: true })}
        />

        <FloatingLabelPasswordInput
          id="password"
          label="Password"
          disabled={loginMutation.isPending}
          {...register("password", { required: true })}
        />

        {errors.root?.message && (
          <Alert variant="destructive">
            <AlertDescription className="justify-center">
              {errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <Field>
          <Button size="lg" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <Spinner /> : "Sign In"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
