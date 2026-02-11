'use client';

import { useState } from 'react';
import type { Patient, ClinicalParameter, User, Corporate } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, SlidersHorizontal } from 'lucide-react';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import ActivityFeed from '@/components/dashboard/activity-feed';
import UpcomingAppointments from '@/components/dashboard/upcoming-appointments';
import CriticalPatients from '@/components/dashboard/critical-patients';

type View = 'patients' | 'settings';

export default function DashboardClient({ 
  initialPatients, 
  initialClinicalParameters,
  initialUsers,
  initialCorporates,
}: { 
  initialPatients: Patient[],
  initialClinicalParameters: ClinicalParameter[],
  initialUsers: User[],
  initialCorporates: Corporate[],
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [clinicalParameters, setClinicalParameters] = useState(initialClinicalParameters);
  const [users, setUsers] = useState(initialUsers);
  const [corporates, setCorporates] = useState(initialCorporates);
  const [activeView, setActiveView] = useState<View>('patients');

  const handleUpdateParameters = (updatedParameters: ClinicalParameter[]) => {
    setClinicalParameters(updatedParameters);
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {activeView === 'patients' ? 'Patient Dashboard' : 'Settings'}
                </h1>
                <p className="text-muted-foreground">
                {activeView === 'patients' ? 'View and manage patient records' : 'Configure application settings'}
                </p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border w-fit">
                <NavButton 
                    label="Patients" 
                    icon={<Users />} 
                    isActive={activeView === 'patients'}
                    onClick={() => setActiveView('patients')}
                />
                <NavButton 
                    label="Settings" 
                    icon={<SlidersHorizontal />} 
                    isActive={activeView === 'settings'}
                    onClick={() => setActiveView('settings')}
                />
            </div>
       </div>
      

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeView === 'patients' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    <PatientList patients={patients} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <ActivityFeed patients={patients} corporates={corporates} />
                    <UpcomingAppointments patients={patients} />
                    <CriticalPatients patients={patients} />
                </div>
            </div>
          )}
          {activeView === 'settings' && <SettingsView 
              clinicalParameters={clinicalParameters} 
              onParametersUpdate={handleUpdateParameters}
              users={users}
              onUsersUpdate={handleUpdateUsers}
           />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const NavButton = ({ label, icon, isActive, onClick }: { label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }) => {
  return (
    <motion.button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav-bg"
          className="absolute inset-0 bg-background rounded-lg shadow-sm z-0"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};
