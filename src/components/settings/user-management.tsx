'use client';

import { useState, useEffect } from 'react';
import type { User, Partner } from '@/lib/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { getRoleLabel, isPayerRole } from '@/lib/role-utils';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

interface UserManagementProps {
  initialUsers: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

const emptyUser: Omit<User, 'id'> = {
  name: '',
  phone: '',
  email: '',
  role: 'navigator',
  avatarUrl: '',
  partner_id: null
};

function normalizeRoleValue(role: User['role'] | undefined) {
  if (role === 'clinician') return 'physician';
  if (role === 'payer') return 'partner';
  if (role === 'patient') return 'user';
  return role || 'navigator';
}

export default function UserManagement({ initialUsers, onUsersUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [initialPassword, setInitialPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');

  useEffect(() => {
      fetch('/api/partners').then(res => res.json()).then(setPartners);
  }, []);

  const handleOpenModal = (user?: User) => {
    setCurrentUser(user || { ...emptyUser });
    setInitialPassword('');
    setConfirmPassword('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setInitialPassword('');
    setConfirmPassword('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!currentUser) return;
    const val = value === 'null' ? null : value;
    setCurrentUser({ ...currentUser, [name]: val });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.name || !currentUser.phone || !currentUser.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name, phone number, and email are required.' });
      return;
    }

    if (!currentUser.id) {
      if (!initialPassword || !confirmPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Initial password and confirmation are required.' });
        return;
      }

      if (initialPassword.length < 8) {
        toast({ variant: 'destructive', title: 'Error', description: 'Initial password must be at least 8 characters.' });
        return;
      }

      if (initialPassword !== confirmPassword) {
        toast({ variant: 'destructive', title: 'Error', description: 'Password confirmation does not match.' });
        return;
      }
    }

    setIsSubmitting(true);
    const payload = currentUser.id
      ? currentUser
      : { ...currentUser, password: initialPassword };

    fetch('/api/users', {
      method: currentUser.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || 'Unable to save user.');
        }

        let updatedUsers;
        if (currentUser.id) {
          updatedUsers = users.map((user) => (user.id === payload.id ? payload : user));
        } else {
          updatedUsers = [payload, ...users];
          toast({
            title: 'User created',
            description: 'Initial password saved. User will be required to change it on first login.',
          });
        }

        setUsers(updatedUsers);
        onUsersUpdate(updatedUsers);

        if (currentUser.id) {
          toast({ title: 'Success', description: 'User updated successfully.' });
        }

        handleCloseModal();
      })
      .catch((error: any) => {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };
  
  const executeDelete = async (id: number) => {
      try {
        const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.error || 'Unable to deactivate user.');

        const updatedUsers = users.filter(u => u.id !== id);
        setUsers(updatedUsers);
        onUsersUpdate(updatedUsers);
        toast({ title: 'Success', description: 'User deactivated successfully.' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  }

  const handleDelete = (id: number) => {
    setConfirmTitle('Deactivate user?');
    setConfirmDescription('This will soft-delete the account and remove it from active user access.');
    setConfirmAction(() => () => executeDelete(id));
  };

  const columns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
            <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                    <AvatarImage src={row.original.avatarUrl || userAvatar?.imageUrl} />
                    <AvatarFallback>{row.original.name[0]}</AvatarFallback>
                </Avatar>
                <div className="grid gap-0.5">
                    <p className="text-sm font-bold">{row.original.name}</p>
                    <p className="text-[11px] text-muted-foreground">{row.original.phone || '-'}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span className="text-xs text-foreground">{row.original.email}</span>,
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{getRoleLabel(row.original.role)}</span>
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(row.original)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        )
    }
  ];

  const toolbarActions = (
    <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 shadow-sm">
      <PlusCircle className="mr-2 h-4 w-4" /> Add User
    </Button>
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={users} toolbarActions={toolbarActions} />

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (open) {
            setIsModalOpen(true);
            return;
          }
          handleCloseModal();
        }}
      >
        <DialogContent>
          <DialogHeader><DialogTitle>{currentUser?.id ? 'Edit' : 'Add'} User</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 py-4">
              <InlineField label="Full Name" htmlFor="name">
                <Input id="name" name="name" value={currentUser?.name || ''} onChange={handleChange} required />
              </InlineField>
              <InlineField label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" value={currentUser?.email || ''} onChange={handleChange} required />
              </InlineField>
              <InlineField label="Phone Number" htmlFor="phone">
                <Input id="phone" name="phone" type="tel" value={currentUser?.phone || ''} onChange={handleChange} required />
              </InlineField>
              {!currentUser?.id && (
                <>
                  <InlineField label="Initial Password" htmlFor="password">
                    <PasswordInput
                      id="password"
                      name="password"
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </InlineField>
                  <InlineField label="Confirm Password" htmlFor="confirmPassword">
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </InlineField>
                </>
              )}
              <InlineField label="Role" htmlFor="role">
                <Select name="role" value={normalizeRoleValue(currentUser?.role as User['role'] | undefined)} onValueChange={(value) => handleSelectChange('role', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="navigator">Navigator</SelectItem>
                        <SelectItem value="physician">Clinician</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="user">Patient</SelectItem>
                    </SelectContent>
                </Select>
              </InlineField>
              
              {isPayerRole(currentUser?.role as User['role']) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <InlineField label="Assign to Partner" htmlFor="partner_id">
                    <Select name="partner_id" value={String(currentUser?.partner_id || 'null')} onValueChange={(value) => handleSelectChange('partner_id', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {partners.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    </InlineField>
                  </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentUser?.id ? 'Save Changes' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setConfirmTitle('');
            setConfirmDescription('');
          }
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Deactivate"
        onConfirm={async () => {
          await confirmAction?.();
        }}
      />
    </div>
  );
}

function InlineField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
