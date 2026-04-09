
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  actions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  actions,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <Input
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px] border-primary/20 focus:border-primary"
        />
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {actions}
      </div>
    </div>
  )
}

interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-between px-2 py-4 border-t">
      <div className="flex-1 text-sm text-muted-foreground pl-4">
        {table.getFilteredSelectedRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8 pr-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to last page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onSelectionChange?: (selectedRows: TData[]) => void
  onRowClick?: (row: TData) => void
  toolbarActions?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
  onRowClick,
  toolbarActions,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  /**
   * Next.js 15 / React 19 Selection Loop Fix.
   * Uses refs to track selection state changes without triggering re-effects.
   */
  const prevSelectionKeysRef = React.useRef("")
  const onSelectionChangeRef = React.useRef(onSelectionChange)
  const tableRef = React.useRef(table)
  
  React.useEffect(() => { tableRef.current = table }, [table])
  React.useEffect(() => { onSelectionChangeRef.current = onSelectionChange }, [onSelectionChange])

  React.useEffect(() => {
    const selectionKeys = Object.keys(rowSelection).sort().join(",")
    if (prevSelectionKeysRef.current !== selectionKeys) {
      prevSelectionKeysRef.current = selectionKeys
      const selectedRows = tableRef.current.getSelectedRowModel().rows.map(r => r.original)
      onSelectionChangeRef.current?.(selectedRows)
    }
  }, [rowSelection]) 

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} actions={toolbarActions} />
        <div className="rounded-md border border-primary/10 overflow-hidden">
            <Table>
            <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-primary/10">
                    {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} colSpan={header.colSpan} className="h-8 text-foreground font-bold uppercase text-[10px] tracking-wider">
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-[10px] font-bold uppercase tracking-wider text-foreground hover:bg-transparent"
                            onClick={() => header.column.toggleSorting(header.column.getIsSorted() === "asc")}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === "asc" ? (
                              <ArrowUp className="ml-1 h-3.5 w-3.5" />
                            ) : header.column.getIsSorted() === "desc" ? (
                              <ArrowDown className="ml-1 h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
                            )}
                          </Button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        </TableHead>
                    ))}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`hover:bg-primary/5 data-[state=selected]:bg-primary/10 transition-colors border-b border-primary/5 ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onRowClick?.(row.original)}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-1.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">No matching records found.</TableCell></TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      <DataTablePagination table={table} />
    </div>
  )
}
