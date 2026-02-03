'use client';

import { useState } from 'react';
import type { ClinicalParameter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, X, Save } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

interface ClinicalParametersProps {
  initialParameters: ClinicalParameter[];
  onParametersUpdate: (updatedParameters: ClinicalParameter[]) => void;
}

const emptyParameter: Omit<ClinicalParameter, 'id'> = {
  name: '',
  type: 'numeric',
  unit: '',
  options: [],
};

export default function ClinicalParameters({ initialParameters, onParametersUpdate }: ClinicalParametersProps) {
  const [parameters, setParameters] = useState<ClinicalParameter[]>(initialParameters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentParameter, setCurrentParameter] = useState<Partial<ClinicalParameter> | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (parameter?: ClinicalParameter) => {
    setCurrentParameter(parameter || { ...emptyParameter });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentParameter(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentParameter) return;
    setCurrentParameter({ ...currentParameter, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!currentParameter) return;
    setCurrentParameter({ ...currentParameter, [name]: value });
  };
  
  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!currentParameter) return;
      setCurrentParameter({ ...currentParameter, options: e.target.value.split(',').map(opt => opt.trim()) });
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParameter || !currentParameter.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'Parameter name is required.' });
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
        let updatedParameters;
        if (currentParameter.id) {
            // Update existing
            updatedParameters = parameters.map(p => p.id === currentParameter!.id ? (currentParameter as ClinicalParameter) : p);
        } else {
            // Add new
            const newParam: ClinicalParameter = {
                id: Date.now(), // mock id
                ...emptyParameter,
                ...currentParameter,
            };
            updatedParameters = [...parameters, newParam];
        }
        
        setParameters(updatedParameters);
        onParametersUpdate(updatedParameters);
        toast({ title: 'Success', description: `Parameter ${currentParameter.id ? 'updated' : 'saved'} successfully.` });
        
        setIsSubmitting(false);
        handleCloseModal();
    }, 500);
  };
  
  const handleDelete = (id: number) => {
      const updatedParameters = parameters.filter(p => p.id !== id);
      setParameters(updatedParameters);
      onParametersUpdate(updatedParameters);
      toast({ title: 'Success', description: 'Parameter deleted successfully.' });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Parameter
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="space-y-2 p-4">
          {parameters.length > 0 ? (
            parameters.map(param => (
              <div key={param.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-semibold">{param.name}</p>
                  <p className="text-sm text-muted-foreground">{param.type}{param.unit ? ` (${param.unit})` : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(param)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete the "{param.name}" parameter.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(param.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No clinical parameters defined.</p>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentParameter?.id ? 'Edit' : 'Add'} Clinical Parameter</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Parameter Name</Label>
                <Input id="name" name="name" value={currentParameter?.name || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Parameter Type</Label>
                <Select name="type" value={currentParameter?.type || ''} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="numeric">Numeric</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="choice">Choice</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {currentParameter?.type === 'numeric' && (
                <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" value={currentParameter?.unit || ''} onChange={handleChange} placeholder="e.g., kg, bpm, mg/dL" />
                </div>
              )}
               {currentParameter?.type === 'choice' && (
                <div className="space-y-2">
                    <Label htmlFor="options">Options</Label>
                    <Input id="options" name="options" value={Array.isArray(currentParameter?.options) ? currentParameter.options.join(', ') : ''} onChange={handleOptionsChange} placeholder="Comma-separated values" />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentParameter?.id ? 'Save Changes' : 'Create Parameter'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
