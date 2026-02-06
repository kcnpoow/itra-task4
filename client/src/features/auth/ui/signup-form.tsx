import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Mail } from "lucide-react";

import { authApi } from "../api";
import type { RegisterDto } from "../types";
import type { ApiError } from "@/shared/types/api-error";
import {
  FloatingLabelInput,
  FloatingLabelPasswordInput,
} from "@/shared/ui/floating-label-input";
import { Button } from "@/shared/shadcn/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
} from "@/shared/shadcn/components/ui/field";
import { Alert, AlertDescription } from "@/shared/shadcn/components/ui/alert";
import { Spinner } from "@/shared/shadcn/components/ui/spinner";
import { useAuthStore } from "@/shared/store/authStore";
import { toast } from "sonner";

export const SignupForm = () => {
  const authStore = useAuthStore();

  const {
    formState: { errors },
    register,
    setError,
    handleSubmit,
  } = useForm<RegisterDto>();

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      authStore.login(data);

      toast.info("A verification link has been sent to your email");
    },
    onError: (error) => {
      if (axios.isAxiosError<ApiError>(error)) {
        const { status, response } = error;
        const message = response?.data.message;

        switch (status) {
          case 409:
            setError("email", { message });
            break;
          default:
            setError("root", { message });
            break;
        }
      }
    },
  });

  const onSubmit: SubmitHandler<RegisterDto> = async (data) => {
    registerMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FloatingLabelInput
            id="first-name"
            label="First name"
            autoComplete="none"
            disabled={registerMutation.isPending}
            {...register("firstName", {
              required: "First name is required",
              maxLength: {
                value: 50,
                message: "First name must be at most 50 characters",
              },
              validate: (value) =>
                value.trim() !== "" || "First name cannot be empty",
            })}
          />

          {errors.firstName?.message && (
            <FieldDescription className="text-destructive">
              {errors.firstName.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FloatingLabelInput
            id="last-name"
            label="Last name"
            autoComplete="none"
            disabled={registerMutation.isPending}
            {...register("lastName", {
              required: "Last name is required",
              maxLength: {
                value: 50,
                message: "Last name must be at most 50 characters",
              },
              validate: (value) =>
                value.trim() !== "" || "Last name cannot be empty",
            })}
          />

          {errors.lastName?.message && (
            <FieldDescription className="text-destructive">
              {errors.lastName.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FloatingLabelInput
            id="position"
            label="Position"
            autoComplete="none"
            disabled={registerMutation.isPending}
            {...register("position", {
              required: "Position is required",
              maxLength: {
                value: 100,
                message: "Position must be at most 100 characters",
              },
              validate: (value) =>
                value.trim() !== "" || "Position cannot be empty",
            })}
          />

          {errors.position?.message && (
            <FieldDescription className="text-destructive">
              {errors.position.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FloatingLabelInput
            id="email"
            label="E-mail"
            autoComplete="none"
            disabled={registerMutation.isPending}
            addon={<Mail />}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email",
              },
            })}
          />

          {errors.email?.message && (
            <FieldDescription className="text-destructive">
              {errors.email.message}
            </FieldDescription>
          )}
        </Field>

        <Field>
          <FloatingLabelPasswordInput
            id="password"
            label="Password"
            disabled={registerMutation.isPending}
            {...register("password", {
              required: "Password is required",
            })}
          />

          {errors.password?.message && (
            <FieldDescription className="text-destructive">
              {errors.password.message}
            </FieldDescription>
          )}
        </Field>

        {errors.root?.message && (
          <Alert variant="destructive">
            <AlertDescription className="justify-center">
              {errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <Field>
          <Button size="lg" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? <Spinner /> : "Sign Up"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
};
