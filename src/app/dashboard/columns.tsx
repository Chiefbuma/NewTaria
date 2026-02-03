"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User, MoreHorizontal, FileText, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { placeholderImages } from "@/lib/placeholder-images"
import type { Patient } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"

const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  Active: 'default',
  Pending: 'secondary',
  Critical: 'destructive',
  'In Review': 'secondary',
  Discharged: 'secondary'
}

export const columns: ColumnDef<Patient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const patient = row.original
      const name = `${patient.first_name} ${patient.surname || ''}`
      const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`

      return (
        <div className="flex items-center gap-4">
            <Avatar className="hidden h-10 w-10 sm:flex">
                {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={name} />}
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
                <Link href={`/patient/${patient.id}`} className="font-medium leading-none hover:underline">{name}</Link>
                <p className="text-sm text-muted-foreground">{patient.email || patient.phone}</p>
            </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={statusVariant[status]} className={cn(status === 'Active' && 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30')}>{status}</Badge>
    },
  },
  {
    accessorKey: "wellness_date",
    header: "Wellness Date",
    cell: ({ row }) => {
        const date = row.getValue("wellness_date") as string | null;
        if (!date) return <span className="text-muted-foreground">-</span>
        return <div>{new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    },
  },
    {
    accessorKey: "navigator_name",
    header: "Navigator",
    cell: ({ row }) => {
      return row.getValue("navigator_name") || <span className="text-muted-foreground">Unassigned</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/patient/${patient.id}`}>
                  <User className="mr-2 h-4 w-4" /> View Patient
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" /> Generate Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/40">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
