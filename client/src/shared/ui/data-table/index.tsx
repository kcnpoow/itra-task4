import { useEffect, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/shadcn/components/ui/table";

interface Filter<TData, TValue> {
  value: TValue;
  key: keyof TData;
}

interface Selection<TData> {
  resetKey: unknown;
  onSelectionChange: (selected: TData[]) => void;
}

interface Props<TData, TValue> {
  filter: Filter<TData, TValue>;
  selection: Selection<TData>;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  defaultSortKey?: Extract<keyof TData, string>;
}

export const DataTable = <TData, TValue>({
  filter,
  selection,
  columns,
  data,
  defaultSortKey,
}: Props<TData, TValue>) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const initialSorting: SortingState = [];

  if (defaultSortKey) {
    initialSorting.push({ id: defaultSortKey, desc: true });
  }

  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const table = useReactTable({
    columns,
    data,
    state: {
      rowSelection,
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    const selected = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    selection.onSelectionChange(selected);
  }, [rowSelection, setRowSelection]);

  useEffect(() => {
    setRowSelection({});
  }, [selection.resetKey]);

  useEffect(() => {
    setColumnFilters([{ id: String(filter.key), value: filter.value }]);
  }, [filter]);

  return (
    <Table className="border">
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
