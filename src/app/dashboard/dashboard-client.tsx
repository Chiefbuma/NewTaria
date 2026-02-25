
'use client';

import { useState } from 'react';
import type { Patient, ClinicalParameter, User } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, SlidersHorizontal, LayoutDashboard } from 'lucide-react';
import PatientList from '@/components/dashboard/patient-list';
import SettingsView from '@/components/settings/settings-view';
import CriticalPatients from '@/components/dashboard/critical-patients';
import Notifications from '@/components/dashboard/notifications';
import AdminOverview from '@/components/dashboard/admin-overview';

type View = 'dashboard' | 'patients' | 'settings';

export default function DashboardClient({ 
  initialPatients, 
  initialClinicalParameters,
  initialUsers,
  initialStats,
}: { 
  initialPatients: Patient[],
  initialClinicalParameters: ClinicalParameter[],
  initialUsers: User[],
  initialStats: any
}) {
  const [patients, setPatients] = useState(initialPatients);
  const [clinicalParameters, setClinicalParameters] = useState(initialClinicalParameters);
  const [users, setUsers] = useState(initialUsers);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [stats, setStats] = useState(initialStats);

  const handleUpdateParameters = (updatedParameters: ClinicalParameter[]) => {
    setClinicalParameters(updatedParameters);
  };
  
  const handleUpdateUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                {activeView === 'dashboard' ? 'Health Overview' : activeView === 'patients' ? 'Patient Management' : 'System Settings'}
                </h1>
                <p className="text-muted-foreground">
                {activeView === 'dashboard' ? 'Analyze population health trends' : activeView === 'patients' ? 'View and manage patient records' : 'Configure application parameters'}
                </p>
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border w-fit">
                <NavButton 
                    label="Dashboard" 
                    icon={<LayoutDashboard />} 
                    isActive={activeView === 'dashboard'}
                    onClick={() => setActiveView('dashboard')}
                />
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
          {activeView === 'dashboard' && <AdminOverview stats={stats} user={users[0]} />}
          
          {activeView === 'patients' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <PatientList patients={patients} />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Notifications />
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
          className="absolute inset-0 bg-background rounded-lg shadow-sm z-0 border border-primary/10"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};
