'use client';

import { ColumnDef } from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Assessment, ClinicalParameter } from "@/lib/types";
import AddAssessmentModal from './add-assessment-modal';
import { FileAudio, Image as ImageIcon } from 'lucide-react';

interface GetAssessmentColumnsProps {
  clinicalParameters: ClinicalParameter[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (id: number) => void;
}

export const getAssessmentColumns = ({ clinicalParameters, onEdit, onDelete }: GetAssessmentColumnsProps): ColumnDef<Assessment>[] => {
  
  const EditableCell = ({ assessment, onSave }: { assessment: Assessment, onSave: (updated: Assessment) => void }) => {
    const parameter = clinicalParameters.find(p => p.id === assessment.clinical_parameter_id);
    
    return (
      <div className="flex items-center justify-end gap-1">
        <AddAssessmentModal
          trigger={
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Edit className="h-3.5 w-3.5" />
            </Button>
          }
          parameter={parameter ?? null}
          existingAssessment={assessment}
          allParameters={clinicalParameters}
          onSave={(updatedData) => {
            onSave({ ...assessment, ...updatedData });
          }}
          disabled={!parameter}
        />
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => onDelete(assessment.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
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
        if (parameter?.type === 'image') {
          return (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-primary underline-offset-2 hover:underline"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              View photo
            </a>
          );
        }
        if (parameter?.type === 'voice') {
          return (
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-primary underline-offset-2 hover:underline"
            >
              <FileAudio className="h-3.5 w-3.5" />
              Play voice note
            </a>
          );
        }
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
