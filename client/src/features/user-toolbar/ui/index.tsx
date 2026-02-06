import type { ChangeEvent } from "react";
import { BrushCleaning, Lock, LockOpen, Trash } from "lucide-react";

import { ActionButton } from "./action-button";
import { useUserMutation } from "../lib";
import { userApi } from "@/entities/user";
import { Input } from "@/shared/shadcn/components/ui/input";

interface Props {
  userIds: number[];
  onEmailFilterChange: (even: ChangeEvent<HTMLInputElement>) => void;
}

export const UserToolbar = ({ userIds, onEmailFilterChange }: Props) => {
  const blockUsers = useUserMutation({
    mutationFn: () => userApi.blockUsersByIds(userIds),
    onSuccessMessage: (userIds) => `Blocked users: ${userIds.length}`,
  });

  const unblockUsers = useUserMutation({
    mutationFn: () => userApi.unblockUsersByIds(userIds),
    onSuccessMessage: (userIds) => `Unblocked users: ${userIds.length}`,
  });

  const deleteUsers = useUserMutation({
    mutationFn: () => userApi.deleteUsersByIds(userIds),
    onSuccessMessage: (userIds) => `Deleted users: ${userIds.length}`,
  });

  const clearUsers = useUserMutation({
    mutationFn: userApi.deleteUnverifiedUsers,
    onSuccessMessage: (userIds) =>
      `Removed unverified users: ${userIds.length}`,
  });

  const isAnyPending =
    blockUsers.isPending ||
    unblockUsers.isPending ||
    deleteUsers.isPending ||
    clearUsers.isPending;

  const disabled = userIds.length === 0 || isAnyPending;

  return (
    <div className="flex gap-2 py-2">
      <ActionButton
        icon={<Lock />}
        tooltip="Block users"
        disabled={disabled}
        pending={blockUsers.isPending}
        onClick={() => blockUsers.mutate()}
      />

      <ActionButton
        icon={<LockOpen />}
        tooltip="Unblock users"
        disabled={disabled}
        pending={unblockUsers.isPending}
        onClick={() => unblockUsers.mutate()}
      />

      <ActionButton
        icon={<Trash />}
        tooltip="Delete users"
        destructive
        disabled={disabled}
        pending={deleteUsers.isPending}
        onClick={() => deleteUsers.mutate()}
      />

      <ActionButton
        icon={<BrushCleaning />}
        tooltip="Delete unverified users"
        destructive
        disabled={isAnyPending}
        pending={clearUsers.isPending}
        onClick={() => clearUsers.mutate()}
      />

      <Input
        className="ml-auto max-w-64"
        placeholder="Filter by email"
        onChange={onEmailFilterChange}
      />
    </div>
  );
};
