'use client';

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Prescription } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface GetPrescriptionColumnsProps {
  onEdit: (prescription: Prescription) => void;
  onDelete: (id: number) => void;
}

export const getPrescriptionColumns = ({ onEdit, onDelete }: GetPrescriptionColumnsProps): ColumnDef<Prescription>[] => {
  return [
    {
      accessorKey: "medication.name",
      header: "Medication",
    },
    {
      accessorKey: "dosage",
      header: "Dosage",
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => new Date(row.original.start_date).toLocaleDateString(),
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry Date",
      cell: ({ row }) => row.original.expiry_date ? new Date(row.original.expiry_date).toLocaleDateString() : 'N/A',
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === 'active' ? 'default' : status === 'completed' ? 'secondary' : 'destructive';
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
      }
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const prescription = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(prescription)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(prescription.id)} className="text-red-500">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
};
