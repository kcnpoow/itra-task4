import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UseUserMutationOptions {
  mutationFn: () => Promise<number[]>;
  onSuccessMessage?: (userIds: number[]) => string;
  onError?: (error: unknown) => string;
}

export const useUserMutation = ({
  mutationFn,
  onSuccessMessage,
}: UseUserMutationOptions) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });

      if (onSuccessMessage) {
        const message = onSuccessMessage(data);

        toast.success(message);
      }
    },
  });

  return mutation;
};
