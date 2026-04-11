'use client';

import { ColumnDef } from "@tanstack/react-table";
import type React from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Prescription } from "@/lib/types";

interface GetPrescriptionColumnsProps {
  renderEdit?: (prescription: Prescription) => React.ReactNode;
  onDeactivate: (id: number) => void;
  readOnly?: boolean;
}

function formatExpiry(value: string | null) {
  if (!value) return "No expiry"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "No expiry"
  return date.toLocaleDateString()
}

function initials(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? "R"
  const second = parts[1]?.[0] ?? "X"
  return `${first}${second}`.toUpperCase()
}

export const getPrescriptionColumns = ({
  renderEdit,
  onDeactivate,
  readOnly = false,
}: GetPrescriptionColumnsProps): ColumnDef<Prescription>[] => {
  const cols: ColumnDef<Prescription>[] = [
    {
      id: "medication",
      header: "Medication",
      accessorFn: (row) => row.medication?.name ?? "",
      meta: {
        headerClassName: "w-auto",
        cellClassName: "w-auto",
      },
      cell: ({ row }) => {
        const p = row.original
        const name = p.medication?.name || "Medication"
        return (
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px] font-bold">{initials(name)}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 gap-0.5">
              <p className="truncate text-xs font-semibold text-foreground">{name}</p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                <span className="font-medium text-foreground">{p.dosage}</span>
                {p.expiry_date ? ` • Exp: ${formatExpiry(p.expiry_date)}` : " • No expiry"}
              </p>
            </div>
          </div>
        )
      },
    },
  ]

  if (!readOnly) {
    cols.push({
      id: "actions",
      meta: {
        headerClassName: "w-[88px] text-right",
        cellClassName: "w-[88px] text-right",
      },
      cell: ({ row }) => {
        const prescription = row.original;
        return (
          <div className="flex items-center justify-end gap-1.5" data-prevent-row-click="true">
            {renderEdit ? renderEdit(prescription) : (
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:bg-destructive/10"
              onClick={() => onDeactivate(prescription.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Deactivate</span>
            </Button>
          </div>
        );
      },
    })
  }

  return cols
};
