
'use client';

import React from 'react';
import type { ClinicalParameter, User, Partner } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClinicalParameters from './clinical-parameters';
import UserManagement from './user-management';
import PartnerManagement from './partner-management';

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
  const [partners, setPartners] = React.useState<Partner[]>([]);

  React.useEffect(() => {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) setCurrentUser(JSON.parse(stored));
      fetch('/api/partners').then(res => res.json()).then(setPartners);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  return (
    <Tabs defaultValue="parameters" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted border border-primary/10">
            <TabsTrigger value="parameters">Clinical Parameters</TabsTrigger>
            <TabsTrigger value="partners">Partners</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
        </TabsList>

        <TabsContent value="parameters">
            <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl">Clinical Parameters</CardTitle>
                    <CardDescription>Define the health metrics you want to track for patients.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <ClinicalParameters 
                        initialParameters={clinicalParameters} 
                        onParametersUpdate={onParametersUpdate} 
                    />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="partners">
            <Card className="border-primary/10 shadow-sm">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="text-xl">Partner Management</CardTitle>
                    <CardDescription>Manage your insurance and corporate partners.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <PartnerManagement 
                        initialPartners={partners}
                        onPartnersUpdate={setPartners}
                    />
                </CardContent>
            </Card>
        </TabsContent>
        
        {isAdmin && (
            <TabsContent value="users">
                <Card className="border-primary/10 shadow-sm">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-xl">User Management</CardTitle>
                        <CardDescription>Add, edit, or remove staff accounts and system users.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <UserManagement 
                            initialUsers={users}
                            onUsersUpdate={onUsersUpdate}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        )}
    </Tabs>
  );
}
