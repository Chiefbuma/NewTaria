'use client';

import type { Assessment, ClinicalParameter } from '@/lib/types';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from './assessment-columns';
import { formatISO } from 'date-fns';

interface AssessmentListProps {
    patientId: number;
    assessments: Assessment[];
    clinicalParameters: ClinicalParameter[];
    onAssessmentAdded: (newAssessment: Assessment) => void;
    onAssessmentUpdated: (updatedAssessment: Assessment) => void;
    onAssessmentDeleted: (assessmentId: number) => void;
}

type AssessmentFormData = {
  id?: number;
  clinical_parameter_id: string;
  value: string;
  notes: string;
  measured_at: string;
}

const getInitialFormData = (): AssessmentFormData => ({
  clinical_parameter_id: '',
  value: '',
  notes: '',
  measured_at: new Date().toISOString().split('T')[0],
});

export default function AssessmentList({ 
    patientId, 
    assessments, 
    clinicalParameters, 
    onAssessmentAdded,
    onAssessmentUpdated,
    onAssessmentDeleted,
}: AssessmentListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [formData, setFormData] = useState<AssessmentFormData>(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOpenModal = (assessment: Assessment | null) => {
    setEditingAssessment(assessment);
    if (assessment) {
      setFormData({
        id: assessment.id,
        clinical_parameter_id: String(assessment.clinical_parameter_id),
        value: assessment.value,
        notes: assessment.notes || '',
        measured_at: new Date(assessment.measured_at).toISOString().split('T')[0],
      });
    } else {
      setFormData(getInitialFormData());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAssessment(null);
    setFormData(getInitialFormData());
  };

  const handleFormChange = (field: keyof AssessmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
     if (field === 'clinical_parameter_id') {
      setFormData(prev => ({ ...prev, value: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clinical_parameter_id || !formData.value) {
        toast({ variant: 'destructive', title: 'Missing Information', description: 'Please select a parameter and provide a value.'});
        return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const selectedParam = clinicalParameters.find(p => p.id === Number(formData.clinical_parameter_id));

    if (editingAssessment) {
      const updatedAssessment: Assessment = {
        ...editingAssessment,
        value: formData.value,
        notes: formData.notes,
        measured_at: formatISO(new Date(formData.measured_at)),
        parameter: selectedParam,
      };
      onAssessmentUpdated(updatedAssessment);
      toast({ title: 'Success', description: 'Assessment updated. (Mock)' });
    } else {
      const newAssessment: Assessment = {
        id: Math.random(),
        patient_id: patientId,
        clinical_parameter_id: Number(formData.clinical_parameter_id),
        value: formData.value,
        notes: formData.notes,
        measured_at: formatISO(new Date(formData.measured_at)),
        created_at: formatISO(new Date()),
        is_normal: null,
        parameter: selectedParam,
      };
      onAssessmentAdded(newAssessment);
      toast({ title: 'Success', description: 'New assessment recorded. (Mock)' });
    }

    handleCloseModal();
    setIsSubmitting(false);
  };

  const handleDelete = (id: number) => {
    onAssessmentDeleted(id);
    toast({ title: "Success", description: "Assessment deleted successfully. (Mock)" });
  };
  
  const columns = getColumns({
    onEdit: handleOpenModal,
    onDelete: handleDelete,
    clinicalParameters
  });

  const selectedParamForForm = clinicalParameters.find(p => p.id === Number(formData.clinical_parameter_id));

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={assessments}
            customActions={
              <Button onClick={() => handleOpenModal(null)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Assessment
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAssessment ? 'Edit Assessment' : 'Record New Assessment'}</DialogTitle>
            <DialogDescription>
                {editingAssessment ? 'Update the details for this measurement.' : 'Add a new measurement for this patient.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinical_parameter_id">Parameter</Label>
                  <Select 
                    required
                    value={formData.clinical_parameter_id} 
                    onValueChange={(value) => handleFormChange('clinical_parameter_id', value)}
                    disabled={!!editingAssessment}
                  >
                    <SelectTrigger id="clinical_parameter_id"><SelectValue placeholder="Select parameter" /></SelectTrigger>
                    <SelectContent>
                      {clinicalParameters.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="measured_at">Measurement Date</Label>
                    <Input id="measured_at" type="date" value={formData.measured_at} onChange={(e) => handleFormChange('measured_at', e.target.value)} required />
                </div>
              </div>
              
              {selectedParamForForm && (
                 <div className="space-y-2">
                    <Label htmlFor="value">Value {selectedParamForForm.unit && `(${selectedParamForForm.unit})`}</Label>
                    {selectedParamForForm.type === 'numeric' && <Input id="value" type="number" value={formData.value} onChange={e => handleFormChange('value', e.target.value)} required />}
                    {selectedParamForForm.type === 'text' && <Input id="value" value={formData.value} onChange={e => handleFormChange('value', e.target.value)} required />}
                    {selectedParamForForm.type === 'choice' && selectedParamForForm.options && (
                        <Select onValueChange={(val) => handleFormChange('value', val)} value={formData.value} required>
                            <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                            <SelectContent>
                                {selectedParamForForm.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" value={formData.notes} onChange={e => handleFormChange('notes', e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingAssessment ? 'Save Changes' : 'Save Assessment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}