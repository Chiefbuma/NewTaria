"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Loader2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Patient } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog"
import { useToast } from "@/hooks/use-toast"
import { bulkDeletePatients } from "@/lib/api-service"

const PatientActions = ({ patient }: { patient: Patient }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [pendingDeactivate, setPendingDeactivate] = useState(false)
    const [isDeactivating, setIsDeactivating] = useState(false)
    const router = useRouter();
    const { toast } = useToast()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        router.push(`/dashboard/patient/${patient.id}`);
    };

    return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(event) => event.stopPropagation()}
                disabled={isLoading || isDeactivating}
              >
                {isLoading || isDeactivating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Open actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleClick}>Open Patient Dashboard</DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(`/dashboard/patient/${patient.id}#edit`)
                }}
              >
                Edit Patient Details
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setPendingDeactivate(true)
                }}
              >
                Deactivate Patient
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ConfirmActionDialog
            open={pendingDeactivate}
            onOpenChange={(open) => setPendingDeactivate(open)}
            title="Deactivate patient?"
            description="This will archive the patient record and remove it from active registry lists."
            confirmLabel="Deactivate"
            onConfirm={async () => {
              try {
                setIsDeactivating(true)
                await bulkDeletePatients([patient.id])
                toast({ title: "Patient deactivated", description: "Patient has been archived from active lists." })
                router.refresh()
              } catch (error: any) {
                toast({ variant: "destructive", title: "Unable to deactivate", description: error.message })
              } finally {
                setIsDeactivating(false)
                setPendingDeactivate(false)
              }
            }}
          />
        </>
    );
};


export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "first_name",
    header: "Name",
    cell: ({ row }) => {
      const patient = row.original
      const name = `${patient.first_name || ''} ${patient.surname || ''}`.trim() || 'Unnamed Patient'
      const fallback = `${patient.first_name?.[0] || 'P'}${patient.surname ? patient.surname[0] : ''}`

      return (
        <div className="flex items-center gap-3">
            <Avatar className="hidden h-8 w-8 sm:flex">
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5">
                <Link href={`/dashboard/patient/${patient.id}`} className="text-sm font-medium leading-none hover:underline">{name}</Link>
                <p className="text-xs text-muted-foreground">{patient.patient_identifier || patient.email || patient.phone}</p>
            </div>
        </div>
      )
    },
  },
  {
    id: "diagnosis",
    accessorFn: (row) => row.primary_diagnosis || row.primary_diagnosis_name || row.diagnosis || "Not set",
    filterFn: (row, id, value) => String(row.getValue(id) ?? "") === String(value ?? ""),
    header: "Diagnosis",
    cell: ({ row }) => (
      <span className="text-xs text-foreground">
        {row.original.primary_diagnosis || 'Not set'}
      </span>
    ),
  },
  {
    id: "partner",
    accessorFn: (row) => row.partner_name || row.clinic_name || "Unassigned",
    filterFn: (row, id, value) => String(row.getValue(id) ?? "") === String(value ?? ""),
    header: "Partner",
    cell: ({ row }) => {
      const patient = row.original
      return (
        <span className="text-xs text-foreground">
          {patient.partner_name || patient.clinic_name || 'Unassigned'}
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    filterFn: (row, id, value) => String(row.getValue(id) ?? "") === String(value ?? ""),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === 'Active' ? 'default' : status === 'Critical' ? 'destructive' : 'secondary';
      return <Badge variant={variant} className={cn(status === 'Active' && 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30', status === 'Critical' && 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30')}>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original
      return (
        <div className="flex justify-end">
          <PatientActions patient={patient} />
        </div>
      )
    },
  },
]
