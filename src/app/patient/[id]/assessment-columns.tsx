'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { Assessment, ClinicalParameter } from '@/lib/types';
import { format } from 'date-fns';

interface AssessmentColumnsProps {
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: number) => void;
  clinicalParameters: ClinicalParameter[];
}

export const getColumns = ({ onEdit, onDelete, clinicalParameters }: AssessmentColumnsProps): ColumnDef<Assessment>[] => [
  {
    accessorKey: 'clinical_parameter_id',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Parameter
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const paramId = row.getValue('clinical_parameter_id');
      const param = clinicalParameters.find(p => p.id === paramId);
      return <div className="font-medium">{param?.name || 'Unknown'}</div>;
    },
  },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => {
        const paramId = row.original.clinical_parameter_id;
        const param = clinicalParameters.find(p => p.id === paramId);
        const value = row.getValue('value');
        return <div>{value} {param?.unit}</div>;
    },
  },
  {
    accessorKey: 'measured_at',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Date Measured
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = row.getValue('measured_at') as string;
      return <div>{format(new Date(date), 'PPpp')}</div>;
    },
     sortingFn: 'datetime',
  },
   {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => row.getValue("notes") || <span className="text-muted-foreground">-</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const assessment = row.original;
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(assessment)} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <div className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm text-red-600 outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this assessment record.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(assessment.id)} className="bg-destructive hover:bg-destructive/90">
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
