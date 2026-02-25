'use client';

import { useState, useCallback, useRef } from 'react';
import type { User } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2, CheckSquare, MoreVertical } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface UserManagementProps {
  initialUsers: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

const emptyUser: Omit<User, 'id'> = {
  name: '',
  email: '',
  role: 'navigator',
  avatarUrl: ''
};

export default function UserManagement({ initialUsers, onUsersUpdate }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User> | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');
  const lastSelectedIdsRef = useRef("");

  const handleSelectionChange = useCallback((selectedRows: User[]) => {
      const ids = selectedRows.map(r => r.id).sort();
      const idsString = ids.join(",");
      if (lastSelectedIdsRef.current !== idsString) {
          lastSelectedIdsRef.current = idsString;
          setSelectedIds(ids);
      }
  }, []);

  const handleOpenModal = (user?: User) => {
    setCurrentUser(user || { ...emptyUser });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, [name]: value });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.name || !currentUser.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'Name and email are required.' });
      return;
    }
    
    setIsSubmitting(true);
    setTimeout(() => {
        let updatedUsers;
        if (currentUser.id) {
            updatedUsers = users.map(u => u.id === currentUser!.id ? (currentUser as User) : u);
        } else {
            const newUser: User = { id: Date.now(), ...emptyUser, ...currentUser };
            updatedUsers = [...users, newUser];
        }
        
        setUsers(updatedUsers);
        onUsersUpdate(updatedUsers);
        toast({ title: 'Success', description: `User ${currentUser.id ? 'updated' : 'created'} successfully.` });
        setIsSubmitting(false);
        handleCloseModal();
    }, 500);
  };
  
  const handleDelete = (id: number) => {
      const updatedUsers = users.filter(u => u.id !== id);
      setUsers(updatedUsers);
      onUsersUpdate(updatedUsers);
      toast({ title: 'Success', description: 'User deleted successfully.' });
  }

  const handleBulkDelete = () => {
      if (selectedIds.length === 0) return;
      if (!confirm(`Delete ${selectedIds.length} users?`)) return;
      
      const updatedUsers = users.filter(u => !selectedIds.includes(u.id));
      setUsers(updatedUsers);
      onUsersUpdate(updatedUsers);
      setSelectedIds([]);
      lastSelectedIdsRef.current = "";
      toast({ title: 'Success', description: 'Selected users removed.' });
  }

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
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={row.original.avatarUrl || userAvatar?.imageUrl} />
                    <AvatarFallback>{row.original.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-sm">{row.original.name}</p>
                    <p className="text-xs text-muted-foreground">{row.original.email}</p>
                </div>
            </div>
        )
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <span className="capitalize text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">{row.original.role}</span>
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <AnimatePresence>
            {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-primary text-primary">
                                <CheckSquare className="mr-2 h-4 w-4" />
                                {selectedIds.length} Selected
                                <MoreVertical className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.div>
            )}
        </AnimatePresence>
        <div className="flex-1" />
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="rounded-md border border-primary/10">
        <DataTable columns={columns} data={users} onSelectionChange={handleSelectionChange} />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentUser?.id ? 'Edit' : 'Add'} User</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={currentUser?.name || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={currentUser?.email || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" value={currentUser?.role || ''} onValueChange={(value) => handleSelectChange('role', value)}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="navigator">Navigator</SelectItem>
                        <SelectItem value="physician">Physician</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                    </SelectContent>
                </Select>
              </div>
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
    </div>
  );
}
