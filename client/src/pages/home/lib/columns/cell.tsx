import type { ReactNode } from "react";
import type { CellContext } from "@tanstack/react-table";

import type { User } from "@/entities/user";
import clsx from "clsx";

interface Props {
  cell: CellContext<User, unknown>;
  children?: ReactNode;
}

export const Cell = ({ cell, children }: Props) => {
  const value = cell.getValue();

  return (
    <div
      className={clsx({
        "text-muted-foreground": cell.row.original.isBlocked,
      })}
    >
      {children ?? String(value)}
    </div>
  );
};
