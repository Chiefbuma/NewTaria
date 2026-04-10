'use client';

import { useState } from 'react';
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
import type { Assessment, ClinicalParameter } from "@/lib/types";
import AddAssessmentModal from './add-assessment-modal';

interface GetAssessmentColumnsProps {
  clinicalParameters: ClinicalParameter[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: number) => void;
}

export const getAssessmentColumns = ({ clinicalParameters, onEdit, onDelete }: GetAssessmentColumnsProps): ColumnDef<Assessment>[] => {
  
  const EditableCell = ({ assessment, onSave }: { assessment: Assessment, onSave: (updated: Assessment) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
    const parameter = clinicalParameters.find(p => p.id === assessment.clinical_parameter_id);

    const handleEdit = () => {
        setEditingAssessment(assessment);
        setIsEditing(true);
    };

    const handleSave = (updatedData: Omit<Assessment, 'id' | 'patient_id' | 'created_at'>) => {
        onSave({ ...assessment, ...updatedData });
        setIsEditing(false);
        setEditingAssessment(null);
    }
    
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-7 w-7 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(assessment.id)} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {isEditing && parameter && (
            <AddAssessmentModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                onSave={handleSave}
                parameter={parameter}
                existingAssessment={editingAssessment}
                allParameters={clinicalParameters}
            />
        )}
      </>
    );
  };

  return [
    {
      accessorKey: "clinical_parameter_id",
      header: "Parameter",
      cell: ({ row }) => {
        const parameterId = row.getValue("clinical_parameter_id") as number;
        const parameter = clinicalParameters.find(p => p.id === parameterId);
        return <div className="text-xs font-medium">{parameter?.name || `Unknown (${parameterId})`}</div>
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const parameterId = row.original.clinical_parameter_id;
        const parameter = clinicalParameters.find(p => p.id === parameterId);
        const value = row.getValue("value") as string;
        return <div className="text-xs">{value} {parameter?.unit}</div>
      }
    },
    {
      accessorKey: "measured_at",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("measured_at") as string;
        return <div className="text-xs">{new Date(date).toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
          return <EditableCell assessment={row.original} onSave={onEdit} />
      },
    },
  ];
};
