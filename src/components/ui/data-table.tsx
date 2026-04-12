
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  Table as TanstackTable,
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
  Columns3,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"

type DataTableDensity = "comfortable" | "compact"

type SavedViewState = {
  sorting: SortingState
  columnVisibility: VisibilityState
  columnFilters: ColumnFiltersState
  globalFilter: string
  pageSize: number
}

type SavedView = { name: string; state: SavedViewState }

function loadSavedViews(viewKey: string): SavedView[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(`datatable:${viewKey}:views`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedView[]) : []
  } catch {
    return []
  }
}

function saveSavedViews(viewKey: string, views: SavedView[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(`datatable:${viewKey}:views`, JSON.stringify(views))
}

function loadDensity(viewKey: string, fallback: DataTableDensity): DataTableDensity {
  if (typeof window === "undefined") return fallback
  const raw = localStorage.getItem(`datatable:${viewKey}:density`)
  return raw === "compact" || raw === "comfortable" ? raw : fallback
}

function saveDensity(viewKey: string, density: DataTableDensity) {
  if (typeof window === "undefined") return
  localStorage.setItem(`datatable:${viewKey}:density`, density)
}

interface DataTableToolbarProps<TData> {
  table: TanstackTable<TData>
  filters?: React.ReactNode
  actions?: React.ReactNode
  showSearch?: boolean
  searchPlaceholder?: string
}

export function DataTableToolbar<TData>({
  table,
  filters,
  actions,
  showSearch = true,
  searchPlaceholder = "Search records...",
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center md:gap-3">
          {showSearch ? (
            <Input
              value={(table.getState().globalFilter as string) ?? ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-xl border-border/70 bg-background/80 md:max-w-[260px]"
            />
          ) : null}
          {filters ? (
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 md:flex md:w-auto md:flex-wrap md:items-center">
              {filters}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-stretch gap-2 md:justify-end">
          {actions}
        </div>
      </div>
    </div>
  )
}

interface DataTablePaginationProps<TData> {
  table: TanstackTable<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  return (
    <div className="flex flex-col gap-3 border-t px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
      {selectedCount > 0 ? (
        <div className="text-xs text-muted-foreground">{selectedCount} selected.</div>
      ) : (
        <div className="text-xs text-muted-foreground" />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:justify-end lg:gap-6">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium">Rows per page</p>
          <Select
            value="5"
          >
            <SelectTrigger className="h-7 w-[64px] rounded-lg" disabled>
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs font-medium sm:min-w-[90px] sm:text-center">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden h-7 w-7 rounded-lg p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to first page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 rounded-lg p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-7 w-7 rounded-lg p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-7 w-7 rounded-lg p-0 lg:flex"
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
  renderToolbarFilters?: (table: TanstackTable<TData>) => React.ReactNode
  renderToolbarActions?: (table: TanstackTable<TData>) => React.ReactNode
  viewKey?: string
  defaultDensity?: DataTableDensity
  renderMobileRow?: (row: TData) => React.ReactNode
  enableRowSelection?: boolean
  enableSearch?: boolean
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onSelectionChange,
  onRowClick,
  toolbarActions,
  renderToolbarFilters,
  renderToolbarActions,
  viewKey,
  defaultDensity = "comfortable",
  renderMobileRow,
  enableRowSelection = false,
  enableSearch = true,
  searchPlaceholder,
}: DataTableProps<TData, TValue>) {
  const FIXED_PAGE_SIZE = 5
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [density, setDensity] = React.useState<DataTableDensity>(defaultDensity)
  const [savedViews, setSavedViews] = React.useState<SavedView[]>([])

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: FIXED_PAGE_SIZE,
      },
    },
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      globalFilter,
      ...(enableRowSelection ? { rowSelection } : {}),
    },
    enableRowSelection,
    ...(enableRowSelection ? { onRowSelectionChange: setRowSelection } : {}),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  React.useEffect(() => {
    if (!viewKey) return
    setDensity(loadDensity(viewKey, defaultDensity))
    setSavedViews(loadSavedViews(viewKey))
  }, [viewKey, defaultDensity])

  React.useEffect(() => {
    // Keep pagination fixed at 5 rows per page for consistent UX/perf.
    if (table.getState().pagination.pageSize !== FIXED_PAGE_SIZE) {
      table.setPageSize(FIXED_PAGE_SIZE)
    }
  }, [table])

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
    if (!enableRowSelection) return
    const selectionKeys = Object.keys(rowSelection).sort().join(",")
    if (prevSelectionKeysRef.current !== selectionKeys) {
      prevSelectionKeysRef.current = selectionKeys
      const selectedRows = tableRef.current.getSelectedRowModel().rows.map(r => r.original)
      onSelectionChangeRef.current?.(selectedRows)
    }
  }, [rowSelection, enableRowSelection]) 

  const toolbarFiltersNode = renderToolbarFilters?.(table)
  const toolbarActionsNode = renderToolbarActions?.(table)

  const viewControls =
    viewKey ? (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 rounded-xl">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Views
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {savedViews.length ? (
              savedViews.map((view) => (
                <DropdownMenuItem
                  key={view.name}
                  onClick={() => {
                    setSorting(view.state.sorting ?? [])
                    setColumnVisibility(view.state.columnVisibility ?? {})
                    setColumnFilters(view.state.columnFilters ?? [])
                    setGlobalFilter(view.state.globalFilter ?? "")
                    table.setPageSize(FIXED_PAGE_SIZE)
                    table.setPageIndex(0)
                  }}
                >
                  {view.name}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No saved views yet</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                const name = window.prompt("Save view as:")
                if (!name) return
                const next: SavedView = {
                  name,
                  state: {
                    sorting,
                    columnVisibility,
                    columnFilters,
                    globalFilter,
                    pageSize: FIXED_PAGE_SIZE,
                  },
                }
                const updated = [...savedViews.filter((v) => v.name !== name), next].sort((a, b) =>
                  a.name.localeCompare(b.name)
                )
                setSavedViews(updated)
                saveSavedViews(viewKey, updated)
              }}
            >
              Save current view
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSavedViews([])
                saveSavedViews(viewKey, [])
              }}
            >
              Clear saved views
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 rounded-xl">
              <Columns3 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllLeafColumns()
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onSelect={(event) => event.preventDefault()}
                  className="flex items-center gap-2"
                >
                  <Checkbox checked={col.getIsVisible()} onCheckedChange={() => col.toggleVisibility()} />
                  <span className="truncate">
                    {typeof col.columnDef.header === "string" ? col.columnDef.header : col.id}
                  </span>
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-xl"
          onClick={() => {
            const next = density === "compact" ? "comfortable" : "compact"
            setDensity(next)
            if (viewKey) saveDensity(viewKey, next)
          }}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {density === "compact" ? "Comfort" : "Compact"}
        </Button>
      </div>
    ) : null

  const allToolbarActions = (
    <>
      {viewControls}
      {toolbarActionsNode}
      {toolbarActions}
    </>
  )

  const cellPaddingClass = density === "compact" ? "px-2.5 py-0.5" : "px-2.5 py-1"
  const headHeightClass = density === "compact" ? "h-6" : "h-7"

  const defaultMobileRow = (row: any) => {
    const visibleCells = row
      .getVisibleCells()
      .filter((cell: any) => cell.column.id !== "select" && cell.column.id !== "actions")
      .slice(0, 4)

    return (
      <div className="space-y-2">
        {visibleCells.map((cell: any, idx: number) => {
          const header = cell.column.columnDef.header
          const label = typeof header === "string" ? header : cell.column.id
          return (
            <div key={cell.id} className="flex items-start justify-between gap-3">
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {label}
              </span>
              <div
                className={cn(
                  "min-w-0 text-right text-sm font-medium text-foreground",
                  idx > 0 && "text-xs font-normal text-muted-foreground"
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        filters={toolbarFiltersNode}
        actions={allToolbarActions}
        showSearch={enableSearch}
        searchPlaceholder={searchPlaceholder}
      />

      {/* Mobile: card/block view to avoid horizontal scrolling */}
	      <div className="space-y-2 md:hidden">
	        {table.getRowModel().rows?.length ? (
	          table.getRowModel().rows.map((row) => (
	            <div
              key={row.id}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
	              className={cn(
	                "rounded-2xl border border-border/70 bg-background p-3 shadow-sm",
	                onRowClick ? "cursor-pointer hover:bg-muted/30" : ""
	              )}
	              onClick={(event) => {
	                if (!onRowClick) return
	                const target = event.target as HTMLElement | null
	                // Ignore clicks originating from interactive elements inside the row (checkboxes, menus, links, etc.)
	                if (target?.closest("button, a, input, [role='checkbox'], [data-prevent-row-click='true']")) return
	                onRowClick(row.original)
	              }}
	              onKeyDown={(event) => {
	                if (!onRowClick) return
	                if (event.key === "Enter" || event.key === " ") {
	                  event.preventDefault()
                  onRowClick(row.original)
                }
              }}
            >
              {renderMobileRow ? renderMobileRow(row.original) : defaultMobileRow(row)}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-border/70 bg-background p-6 text-center text-sm text-muted-foreground">
            No matching records found.
          </div>
        )}
      </div>

      {/* Desktop/tablet: table view */}
      <div className="hidden overflow-hidden rounded-2xl border border-primary/10 bg-background shadow-[0_22px_45px_-30px_rgba(15,23,42,0.24)] md:block">
            <Table className="w-full table-fixed">
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-primary/10">
                    {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={cn(
                            headHeightClass,
                            "font-bold uppercase text-[10px] tracking-wider text-muted-foreground",
                            (header.column.columnDef.meta as any)?.headerClassName
                          )}
                        >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-transparent hover:text-foreground"
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
	                      className={`border-b border-primary/5 transition-colors hover:bg-primary/5 data-[state=selected]:bg-primary/10 ${onRowClick ? 'cursor-pointer' : ''}`}
	                      onClick={(event) => {
	                        if (!onRowClick) return
	                        const target = event.target as HTMLElement | null
	                        // Ignore clicks originating from interactive elements inside the row (checkboxes, menus, links, etc.)
	                        if (target?.closest("button, a, input, [role='checkbox'], [data-prevent-row-click='true']")) return
	                        onRowClick(row.original)
	                      }}
	                    >
	                    {row.getVisibleCells().map((cell) => (
	                        <TableCell
                            key={cell.id}
                            className={cn(
                              cellPaddingClass,
                              "break-words",
                              (cell.column.columnDef.meta as any)?.cellClassName
                            )}
                          >
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
