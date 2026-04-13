''''use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { User, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SlideOver, SlideOverContent } from '@/components/ui/slide-over';
import { SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { getRoleLabel, isPayerRole } from '@/lib/role-utils';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { cn } from '@/lib/utils';

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
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
      fetch('/api/partners').then(res => res.json()).then(setPartners);
  }, []);

  const saveUser = async (data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await fetch('/api/users', {
      method: data.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload.error || 'Unable to save user.');
    }
    return payload as User;
  };

  const applySavedUser = (saved: User) => {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === saved.id);
      const updated = exists ? prev.map((u) => (u.id === saved.id ? saved : u)) : [saved, ...prev];
      onUsersUpdate(updated);
      return updated;
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
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => (
            <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                    <AvatarFallback>{row.original.name?.[0] || 'U'}</AvatarFallback>
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
                <UserUpsertForm
                  user={row.original}
                  partners={partners}
                  saveUser={saveUser}
                  onSaved={(saved, mode) => {
                    applySavedUser(saved);
                    toast({
                      title: mode === 'create' ? 'User created' : 'Success',
                      description:
                        mode === 'create'
                          ? 'Initial password saved. User will be required to change it on first login.'
                          : 'User updated successfully.',
                    });
                  }}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  }
                />
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        )
    }
  ];

  const toolbarActions = (
    <UserUpsertForm
      user={null}
      partners={partners}
      saveUser={saveUser}
      onSaved={(saved, mode) => {
        applySavedUser(saved);
        toast({
          title: mode === 'create' ? 'User created' : 'Success',
          description:
            mode === 'create'
              ? 'Initial password saved. User will be required to change it on first login.'
              : 'User updated successfully.',
        });
      }}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
        <DataTable columns={columns} data={users} toolbarActions={toolbarActions} />

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

function UserUpsertForm({
  trigger,
  user,
  partners,
  saveUser,
  onSaved,
}: {
  trigger: React.ReactNode;
  user: User | null;
  partners: Partner[];
  saveUser: (data: Partial<User> & { password?: string }) => Promise<User>;
  onSaved: (saved: User, mode: 'create' | 'update') => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<User['role']>('navigator');
  const [partnerId, setPartnerId] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mode: 'create' | 'update' = user?.id ? 'update' : 'create';
  const title = user?.id ? 'Edit User' : 'Add User';

  return (
    <SlideOver
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(user?.name || '');
          setEmail(user?.email || '');
          setPhone(user?.phone || '');
          setRole(normalizeRoleValue(user?.role) as User['role']);
          setPartnerId(typeof user?.partner_id === 'number' ? user.partner_id : null);
          setPassword('');
          setConfirmPassword('');
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SlideOverContent className="h-full w-[420px] max-w-[calc(100vw-2rem)] flex flex-col p-0">
        <SheetHeader className="px-4 py-3">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

          <form
            className="flex-1 flex flex-col"
            onSubmit={async (e) => {
              e.preventDefault();

              if (!name.trim() || !email.trim() || !phone.trim()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Name, phone number, and email are required.' });
                return;
              }

              if (mode === 'create') {
                if (!password || !confirmPassword) {
                  toast({ variant: 'destructive', title: 'Error', description: 'Initial password and confirmation are required.' });
                  return;
                }
                if (password.length < 8) {
                  toast({ variant: 'destructive', title: 'Error', description: 'Initial password must be at least 8 characters.' });
                  return;
                }
                if (password !== confirmPassword) {
                  toast({ variant: 'destructive', title: 'Error', description: 'Password confirmation does not match.' });
                  return;
                }
              }

              try {
                setIsSubmitting(true);
                const payload: Partial<User> & { password?: string } = {
                  ...(user?.id ? { id: user.id } : null),
                  name: name.trim(),
                  email: email.trim(),
                  phone: phone.trim(),
                  role,
                  partner_id: isPayerRole(role) ? partnerId : null,
                };
                if (mode === 'create') payload.password = password;

                const saved = await saveUser(payload);
                onSaved(saved, mode);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Unable to save user.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="flex-1 space-y-3 p-4 overflow-y-auto">
              <InlineField label="Full Name" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-8" required />
              </InlineField>
              <InlineField label="Email" htmlFor="email">
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8" required />
              </InlineField>
              <InlineField label="Phone Number" htmlFor="phone">
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8" required />
              </InlineField>

              {mode === 'create' ? (
                <>
                  <InlineField label="Initial Password" htmlFor="password">
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </InlineField>
                  <InlineField label="Confirm Password" htmlFor="confirmPassword">
                    <PasswordInput
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={8}
                      required
                    />
                  </InlineField>
                </>
              ) : null}

              <InlineField label="Role" htmlFor="role">
                <Select value={role} onValueChange={(value) => setRole(value as User['role'])}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
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

              {isPayerRole(role) ? (
                <InlineField label="Assign to Partner" htmlFor="partner_id">
                  <Select
                    value={String(partnerId ?? 'null')}
                    onValueChange={(value) => setPartnerId(value === 'null' ? null : Number(value))}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None</SelectItem>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </InlineField>
              ) : null}
            </div>

            <SheetFooter className="px-4 py-3 bg-muted/20 border-t">
              <Button type="button" variant="outline" className="h-8" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </SheetFooter>
          </form>
      </SlideOverContent>
    </SlideOver>
  );
}

function InlineField({
  label,
  htmlFor,
  children,
  alignStart = false,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div className={cn('grid grid-cols-[120px_minmax(0,1fr)] gap-3', alignStart ? 'items-start' : 'items-center')}>
      <Label htmlFor={htmlFor} className={cn('text-[11px] font-bold uppercase tracking-wider text-muted-foreground', alignStart ? 'pt-2' : null)}>
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
'''