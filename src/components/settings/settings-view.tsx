// This is a new component to encapsulate the settings UI
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
            <CardHeader>
            <CardTitle>Manage Clinical Parameters</CardTitle>
            <CardDescription>
                Define the health metrics you want to track for patients.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ClinicalParameters 
                initialParameters={clinicalParameters} 
                onParametersUpdate={onParametersUpdate} 
            />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Manage Users</CardTitle>
            <CardDescription>
                Add, edit, or remove users from the system.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <UserManagement 
                    initialUsers={users}
                    onUsersUpdate={onUsersUpdate}
                />
            </CardContent>
        </Card>
    </div>
  );
}
