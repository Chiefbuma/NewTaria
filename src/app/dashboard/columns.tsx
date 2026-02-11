"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, User, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { placeholderImages } from "@/lib/placeholder-images"
import type { Patient } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"

const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

const ViewPatientButton = ({ patient }: { patient: Patient }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const isPending = patient.status === 'Pending';

    const handleClick = () => {
        setIsLoading(true);
        // The router will take over. No need to set loading to false.
        router.push(`/patient/${patient.id}`);
    };

    const buttonLabel = isPending ? 'Onboard Patient' : 'View Patient';

    return (
         <Button
            variant={isPending ? 'default' : 'outline'}
            size="sm"
            onClick={handleClick}
            disabled={isLoading}
            className="w-[140px] transition-all duration-300 ease-in-out"
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    {buttonLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </>
            )}
        </Button>
    );
};


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
      const variant = status === 'Active' ? 'default' : status === 'Critical' ? 'destructive' : 'secondary';
      return <Badge variant={variant} className={cn(status === 'Active' && 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30', status === 'Critical' && 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30')}>{status}</Badge>
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
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original
      return (
        <div className="text-right">
          <ViewPatientButton patient={patient} />
        </div>
      )
    },
  },
]
