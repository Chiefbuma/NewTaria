'use client';

import { useState, useEffect } from 'react';
import type { Patient, ClinicalParameter, User } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Users, SlidersHorizontal, LogOut } from 'lucide-react';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';

type View = 'patients' | 'settings';

export default function DashboardClient({ 
  initialPatients, 
  initialClinicalParameters,
  initialUsers,
}: { 
  initialPatients: Patient[],
  initialClinicalParameters: ClinicalParameter[],
  initialUsers: User[],
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [clinicalParameters, setClinicalParameters] = useState(initialClinicalParameters);
  const [users, setUsers] = useState(initialUsers);
  const [activeView, setActiveView] = useState<View>('patients');

  const handleUpdateParameters = (updatedParameters: ClinicalParameter[]) => {
    setClinicalParameters(updatedParameters);
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    setActiveView('patients');
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {activeView === 'patients' ? 'Patient Dashboard' : 'Settings'}
          </h1>
          <p className="text-muted-foreground">
            {activeView === 'patients' ? 'View and manage patient records' : 'Configure application settings'}
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border">
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
        >
          {activeView === 'patients' && <PatientList patients={patients} onAddPatientClick={() => handleAddPatient} />}
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
