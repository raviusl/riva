"use client";

import type { ReactNode } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  empty?: ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  empty,
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return empty ?? null;
  }

  return (
    <div
      className={cn(
        "riva-surface overflow-hidden rounded-[var(--riva-radius-lg)]",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={cn("px-4 py-3", column.headerClassName)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={getRowKey(row)}
              className="border-white/[0.05] transition duration-200 hover:bg-white/[0.025]"
            >
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className={cn("px-4 py-3.5", column.className)}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
