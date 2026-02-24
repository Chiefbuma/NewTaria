'use client';

import React from 'react';
import type { ClinicalParameter, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ClinicalParameters from './clinical-parameters';
import UserManagement from './user-management';

interface SettingsViewProps {
  clinicalParameters: ClinicalParameter[];
  onParametersUpdate: (updatedParameters: ClinicalParameter[]) => void;
  users: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

export default function SettingsView({
  clinicalParameters,
  onParametersUpdate,
  users,
  onUsersUpdate
}: SettingsViewProps) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);

  React.useEffect(() => {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-primary/10 shadow-sm">
            <CardHeader className="bg-muted/30">
            <CardTitle className="text-xl">Clinical Parameters</CardTitle>
            <CardDescription>
                Define the health metrics you want to track for patients.
            </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
            <ClinicalParameters 
                initialParameters={clinicalParameters} 
                onParametersUpdate={onParametersUpdate} 
            />
            </CardContent>
        </Card>
        
        {isAdmin && (
            <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>
                    Add, edit, or remove staff accounts and system users.
                </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <UserManagement 
                        initialUsers={users}
                        onUsersUpdate={onUsersUpdate}
                    />
                </CardContent>
            </Card>
        )}
    </div>
  );
}
