"use client"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type CustomData = {
  id: number
  name: string
  status: string
  priority: string
  assignee: string
}

const columns: ColumnDef<CustomData>[] = [
  {
    accessorKey: "name",
    header: "Project Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Active" ? "default" : "secondary"}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={
          row.original.priority === "High"
            ? "border-red-200 text-red-700"
            : row.original.priority === "Medium"
              ? "border-yellow-200 text-yellow-700"
              : "border-green-200 text-green-700"
        }
      >
        {row.original.priority}
      </Badge>
    ),
  },
  {
    accessorKey: "assignee",
    header: "Assignee",
  },
  {
    id: "actions",
    cell: () => (
      <Button variant="ghost" size="sm">
        Edit
      </Button>
    ),
  },
]

export function CustomDataTable({ data }: { data: CustomData[] }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
