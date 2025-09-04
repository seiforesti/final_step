"use client";
import * as React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow
} from "./table";
import { cn } from "@/lib/utils";

type ColumnDef<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  className?: string;
  cell?: (row: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  width?: number | string;
};

export type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  caption?: React.ReactNode;
  emptyState?: React.ReactNode;
  rowKey?: (row: T, index: number) => React.Key;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode | ((rows: T[]) => React.ReactNode);
};

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  emptyState,
  rowKey,
  className,
  headerClassName,
  bodyClassName,
  footer
}: DataTableProps<T>) {
  const resolvedRowKey = React.useCallback(
    (row: T, index: number) => (rowKey ? rowKey(row, index) : (row.id ?? index)),
    [rowKey]
  );

  return (
    <Table className={className}>
      {caption ? <TableCaption>{caption}</TableCaption> : null}
      <TableHeader className={headerClassName}>
        <TableRow>
          {columns.map((col, idx) => (
            <TableHead
              key={`h-${idx}`}
              className={cn(col.className, col.align === "right" && "text-right", col.align === "center" && "text-center")}
              style={{ width: col.width as any }}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody className={bodyClassName}>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
              {emptyState ?? "No records found"}
            </TableCell>
          </TableRow>
        ) : (
          data.map((row, rowIndex) => (
            <TableRow key={resolvedRowKey(row, rowIndex)}>
              {columns.map((col, colIndex) => (
                <TableCell
                  key={`c-${rowIndex}-${colIndex}`}
                  className={cn(col.className, col.align === "right" && "text-right", col.align === "center" && "text-center")}
                >
                  {col.cell ? col.cell(row) : String(row[col.key as keyof T] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
      {footer ? (
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length}>
              {typeof footer === "function" ? footer(data) : footer}
            </TableCell>
          </TableRow>
        </TableFooter>
      ) : null}
    </Table>
  );
}

export default DataTable;


