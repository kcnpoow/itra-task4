import type { HeaderContext } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";

import type { User } from "@/entities/user";
import { Button } from "@/shared/shadcn/components/ui/button";

interface Props {
  header: HeaderContext<User, unknown>;
  title: string;
}

export const SortableHeader = ({ header, title }: Props) => {
  const handleClick = () => {
    header.column.toggleSorting();
  };

  const isSorted = header.column.getIsSorted();

  return (
    <Button
      className="p-0 hover:bg-transparent"
      size="sm"
      variant="ghost"
      onClick={handleClick}
    >
      {title}

      <span className={"text-muted-foreground"}>
        {isSorted === "asc" && <ArrowUp />}
        {isSorted === "desc" && <ArrowDown />}
      </span>
    </Button>
  );
};
