
'use client';

import React, { useState } from 'react';
import type { ClinicalParameter, User, Partner, Medication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Settings as SettingsIcon, 
    Building2, 
    Activity, 
    Pill,
    Layers,
    Stethoscope
} from 'lucide-react';
import ClinicalParameters from './clinical-parameters';
import UserManagement from './user-management';
import PartnerManagement from './partner-management';
import MedicationManagement from './medication-management';
import ClinicManagement from './clinic-management';
import DiagnosisManagement from './diagnosis-management';

interface SettingsViewProps {
  clinicalParameters: ClinicalParameter[];
  onParametersUpdate: (updatedParameters: ClinicalParameter[]) => void;
  users: User[];
  onUsersUpdate: (updatedUsers: User[]) => void;
}

type SettingsSection = 'parameters' | 'partners' | 'users' | 'medications' | 'clinics' | 'diagnoses';

export default function SettingsView({
  clinicalParameters,
  onParametersUpdate,
  users,
  onUsersUpdate
}: SettingsViewProps) {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [partners, setPartners] = React.useState<Partner[]>([]);
  const [activeSection, setActiveSection] = useState<SettingsSection>('parameters');

  React.useEffect(() => {
      fetch('/api/auth/session')
        .then((res) => (res.ok ? res.json() : { user: null }))
        .then((data) => setCurrentUser(data.user ?? null))
        .catch(() => setCurrentUser(null));
      fetch('/api/partners').then(res => res.json()).then(setPartners);
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const sections = [
      { id: 'parameters', label: 'Clinical Parameters', icon: <Activity className="h-4 w-4" /> },
      { id: 'partners', label: 'Partners', icon: <Building2 className="h-4 w-4" /> },
      { id: 'medications', label: 'Medications', icon: <Pill className="h-4 w-4" /> },
      { id: 'clinics', label: 'Clinics', icon: <Building2 className="h-4 w-4" /> },
      { id: 'diagnoses', label: 'Diagnoses', icon: <Stethoscope className="h-4 w-4" /> },
      ...(isAdmin ? [{ id: 'users', label: 'User Management', icon: <Users className="h-4 w-4" /> }] : []),
  ];

  return (
    <div className="space-y-8">
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-xl border w-full overflow-x-auto no-scrollbar">
            {sections.map((section) => (
                <NavButton 
                    key={section.id}
                    label={section.label} 
                    icon={section.icon} 
                    isActive={activeSection === section.id}
                    onClick={() => setActiveSection(section.id as SettingsSection)}
                />
            ))}
        </div>

        <AnimatePresence mode="wait">
            <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {activeSection === 'parameters' && (
                    <Card className="border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Clinical Parameters</CardTitle>
                            <CardDescription>Define the health metrics you want to track for patients.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ClinicalParameters 
                                initialParameters={clinicalParameters} 
                                onParametersUpdate={onParametersUpdate} 
                            />
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'partners' && (
                    <Card className="border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Partner Management</CardTitle>
                            <CardDescription>Manage your insurance and corporate partners.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <PartnerManagement 
                                initialPartners={partners}
                                onPartnersUpdate={setPartners}
                            />
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'medications' && (
                    <Card className="border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Pill className="h-5 w-5 text-primary" />Medication Catalog</CardTitle>
                            <CardDescription>Maintain the central medication database for prescriptions.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <MedicationManagement />
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'clinics' && (
                    <Card className="border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />Clinic Management</CardTitle>
                            <CardDescription>Manage your clinics.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ClinicManagement />
                        </CardContent>
                    </Card>
                )}

                {activeSection === 'diagnoses' && (
                    <Card className="border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" />Diagnosis Management</CardTitle>
                            <CardDescription>Manage your diagnoses.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <DiagnosisManagement />
                        </CardContent>
                    </Card>
                )}
                
                {activeSection === 'users' && isAdmin && (
                    <Card className="border-primary/10 shadow-sm overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle className="text-xl flex items-center gap-2"><Users className="h-5 w-5 text-primary" />System Users</CardTitle>
                            <CardDescription>Add, edit, or remove staff accounts and system users.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <UserManagement 
                                initialUsers={users}
                                onUsersUpdate={onUsersUpdate}
                            />
                        </CardContent>
                    </Card>
                )}
            </motion.div>
        </AnimatePresence>
    </div>
  );
}

const NavButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 whitespace-nowrap flex-1 justify-center ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {isActive && (
        <motion.div
          layoutId="active-settings-nav-bg"
          className="absolute inset-0 bg-background rounded-lg shadow-sm z-0 border border-primary/10"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};
