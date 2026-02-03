'use client';

import { useState } from 'react';
import type { ClinicalParameter } from '@/lib/types';
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
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Loader2, X } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from './columns';

type ParameterFormData = Omit<ClinicalParameter, 'id'>;

export default function SettingsClient({ initialParameters }: { initialParameters: ClinicalParameter[] }) {
  const [parameters, setParameters] = useState<ClinicalParameter[]>(initialParameters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParam, setEditingParam] = useState<ClinicalParameter | null>(null);
  const [formData, setFormData] = useState<ParameterFormData>({ name: '', type: 'numeric', unit: '', options: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchParameters = async () => {
    try {
      const res = await fetch('/api/clinical-parameters');
      const data = await res.json();
      setParameters(data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch parameters." });
    }
  };

  const handleOpenModal = (param: ClinicalParameter | null) => {
    setEditingParam(param);
    if (param) {
      setFormData({ name: param.name, type: param.type, unit: param.unit || '', options: param.options || [] });
    } else {
      setFormData({ name: '', type: 'numeric', unit: '', options: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParam(null);
    setFormData({ name: '', type: 'numeric', unit: '', options: [] });
  };
  
  const handleFormChange = (field: keyof ParameterFormData, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  }
  
  const handleOptionChange = (index: number, value: string) => {
      const newOptions = [...(formData.options || [])];
      newOptions[index] = value;
      handleFormChange('options', newOptions);
  }

  const addOption = () => {
      const newOptions = [...(formData.options || []), ''];
      handleFormChange('options', newOptions);
  }

  const removeOption = (index: number) => {
      const newOptions = [...(formData.options || [])];
      newOptions.splice(index, 1);
      handleFormChange('options', newOptions);
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = editingParam ? `/api/clinical-parameters/${editingParam.id}` : '/api/clinical-parameters';
    const method = editingParam ? 'PUT' : 'POST';

    const body: any = { ...formData };
    if (body.type !== 'choice') {
        body.options = null;
    }
     if (body.type !== 'numeric') {
        body.unit = null;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${editingParam ? 'update' : 'create'} parameter.`);
      }

      toast({
        title: "Success",
        description: `Parameter ${editingParam ? 'updated' : 'created'} successfully.`,
      });
      await fetchParameters();
      handleCloseModal();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
        const res = await fetch(`/api/clinical-parameters/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete parameter');
        toast({ title: "Success", description: "Parameter deleted successfully." });
        await fetchParameters();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    }
  };
  
  const columns = getColumns({
    onEdit: handleOpenModal,
    onDelete: handleDelete,
  });

  return (
    <>
      <Card>
          <CardContent className="pt-6">
                <DataTable 
                    columns={columns} 
                    data={parameters}
                    customActions={
                        <Button onClick={() => handleOpenModal(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Parameter
                        </Button>
                    }
                />
          </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-lg">
           <DialogHeader>
            <DialogTitle>{editingParam ? 'Edit Parameter' : 'Add New Parameter'}</DialogTitle>
            <DialogDescription>
                Clinical parameters define the metrics you can track for patients.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Parameter Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select required value={formData.type} onValueChange={(value) => handleFormChange('type', value as ParameterFormData['type'])}>
                        <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="numeric">Numeric</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="choice">Choice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 {formData.type === 'numeric' && (
                     <div className="space-y-2">
                        <Label htmlFor="unit">Unit (e.g. kg, mmHg)</Label>
                        <Input id="unit" value={formData.unit || ''} onChange={(e) => handleFormChange('unit', e.target.value)} />
                    </div>
                 )}
              </div>
              {formData.type === 'choice' && (
                  <div className="space-y-4">
                      <Label>Options</Label>
                      <div className="space-y-2">
                        {(formData.options || []).map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={option} onChange={(e) => handleOptionChange(index, e.target.value)} placeholder={`Option ${index + 1}`} />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>Add Option</Button>
                  </div>
              )}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingParam ? 'Save Changes' : 'Create Parameter'}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
