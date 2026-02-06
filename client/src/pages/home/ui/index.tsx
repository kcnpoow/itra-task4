import { useState, type ChangeEvent } from "react";
import { useQuery } from "@tanstack/react-query";

import { columns } from "../lib/columns";
import { UserToolbar } from "@/features/user-toolbar";
import { userApi } from "@/entities/user/";
import type { User } from "@/entities/user";
import { DataTable } from "@/shared/ui/data-table";

export const Home = () => {
  const [filter, setFilter] = useState("");

  const { data, dataUpdatedAt } = useQuery({
    initialData: [],
    queryKey: ["users"],
    queryFn: userApi.getUsers,
  });

  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  const handleFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleSelectionChange = (users: User[]) => {
    const ids = users.map((user) => user.id);

    setSelectedUserIds(ids);
  };

  return (
    <div className="container">
      <UserToolbar
        userIds={selectedUserIds}
        onEmailFilterChange={handleFilterChange}
      />

      <DataTable
        columns={columns}
        data={data}
        defaultSortKey="lastSeenAt"
        filter={{ value: filter, key: "email" }}
        selection={{
          resetKey: dataUpdatedAt,
          onSelectionChange: handleSelectionChange,
        }}
      />
    </div>
  );
};
