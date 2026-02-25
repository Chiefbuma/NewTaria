
'use client';

import { useState } from 'react';
import type { Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
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

interface PartnerManagementProps {
  initialPartners: Partner[];
  onPartnersUpdate: (updatedPartners: Partner[]) => void;
}

export default function PartnerManagement({ initialPartners, onPartnersUpdate }: PartnerManagementProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner> | null>(null);
  const { toast } = useToast();

  const handleOpenModal = (partner?: Partner) => {
    setCurrentPartner(partner || { name: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner?.name) return;
    
    setIsSubmitting(true);
    try {
        const method = currentPartner.id ? 'PUT' : 'POST';
        const res = await fetch('/api/partners', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentPartner)
        });
        
        if (!res.ok) throw new Error('Failed to save partner');
        const saved = await res.json();

        let updated;
        if (currentPartner.id) {
            updated = partners.map(p => p.id === saved.id ? saved : p);
        } else {
            updated = [saved, ...partners];
        }
        
        setPartners(updated);
        onPartnersUpdate(updated);
        toast({ title: 'Success', description: 'Partner saved successfully.' });
        setIsModalOpen(false);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
      try {
          const res = await fetch(`/api/partners?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete partner');
          const updated = partners.filter(p => p.id !== id);
          setPartners(updated);
          onPartnersUpdate(updated);
          toast({ title: 'Success', description: 'Partner removed.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Partner
        </Button>
      </div>

      <div className="rounded-md border">
        <div className="space-y-2 p-4">
          {partners.length > 0 ? (
            partners.map(partner => (
              <div key={partner.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <p className="font-semibold">{partner.name}</p>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(partner)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the partner "{partner.name}".</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(partner.id)} className="bg-destructive">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-4">No partners found.</p>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentPartner?.id ? 'Edit' : 'Add'} Partner</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Partner Name</Label>
                <Input 
                    id="name" 
                    value={currentPartner?.name || ''} 
                    onChange={(e) => setCurrentPartner(p => ({...p!, name: e.target.value}))} 
                    required 
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Partner
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
