import { type ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";

import { SortableHeader } from "./sortable-header";
import type { User } from "@/entities/user";
import { Checkbox } from "@/shared/shadcn/components/ui/checkbox";
import { Cell } from "./cell";
import clsx from "clsx";

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    id: "name",
    header: (header) => <SortableHeader header={header} title="Name" />,
    accessorFn: (row) => `${row.lastName} ${row.firstName}`,
    cell: (cell) => {
      const original = cell.row.original;

      return (
        <Cell cell={cell}>
          <span className={clsx(original.isBlocked && "line-through")}>
            {original.lastName}, {original.firstName}
          </span>

          <br />

          <span>{original.position}</span>
        </Cell>
      );
    },
  },
  {
    accessorKey: "email",
    header: (header) => <SortableHeader header={header} title="Email" />,
    cell: (cell) => <Cell cell={cell} />,
  },
  {
    id: "status",
    accessorFn: (row) => {
      const { isBlocked, isVerified } = row;

      if (isBlocked) {
        return "Blocked";
      }

      if (!isVerified) {
        return "Unverified";
      }

      return "Active";
    },
    header: (header) => <SortableHeader header={header} title="Status" />,
    cell: (cell) => <Cell cell={cell} />,
  },
  {
    accessorKey: "lastSeenAt",
    header: (header) => <SortableHeader header={header} title="Last seen" />,
    cell: (cell) => {
      const parsedDate = formatDistanceToNow(cell.row.original.lastSeenAt, {
        addSuffix: true,
      });

      return <Cell cell={cell}>{parsedDate}</Cell>;
    },
  },
];
