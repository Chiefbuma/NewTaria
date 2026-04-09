'use client';

import type React from 'react';
import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Clinic, ClinicalParameter, Diagnosis, Partner, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import PartnerManagement from '@/components/settings/partner-management';
import MedicationManagement from '@/components/settings/medication-management';
import UserManagement from '@/components/settings/user-management';
import ReferenceCatalogManagement from '@/components/settings/reference-catalog-management';
import ClinicalParameters from '@/components/settings/clinical-parameters';
import {
  bulkDeleteClinics,
  bulkDeleteDiagnoses,
  deleteClinic,
  deleteDiagnosis,
  upsertClinic,
  upsertDiagnosis,
} from '@/lib/api-service';

export type SetupSection = 'payers' | 'clinics' | 'diagnoses' | 'medications' | 'clinical-parameters' | 'users';

type SystemSetupViewProps = {
  payers: Partner[];
  clinics: Clinic[];
  diagnoses: Diagnosis[];
  users: User[];
  clinicalParameters?: ClinicalParameter[];
  onUsersUpdate?: (users: User[]) => void;
  activeSection?: SetupSection;
};

export default function SystemSetupView({
  payers,
  clinics,
  diagnoses,
  users,
  clinicalParameters = [],
  onUsersUpdate = () => undefined,
  activeSection = 'payers',
}: SystemSetupViewProps) {
  const content = useMemo(() => {
    if (activeSection === 'payers') {
      return <PartnerManagement initialPartners={payers} onPartnersUpdate={() => undefined} />;
    }
    if (activeSection === 'clinics') {
      return (
        <ReferenceCatalogManagement
          title="Clinics"
          addLabel="Add Clinic"
          singularLabel="Clinic"
          initialItems={clinics}
          fields={[
            { key: 'name', label: 'Clinic Name', required: true },
            { key: 'location', label: 'Location' },
          ]}
          saveItem={upsertClinic}
          deleteItem={deleteClinic}
          bulkDeleteItems={bulkDeleteClinics}
        />
      );
    }
    if (activeSection === 'diagnoses') {
      return (
        <ReferenceCatalogManagement
          title="Diagnoses"
          addLabel="Add Diagnosis"
          singularLabel="Diagnosis"
          initialItems={diagnoses}
          fields={[
            { key: 'code', label: 'ICD-10 Code', required: true },
            { key: 'name', label: 'Diagnosis Name', required: true },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          saveItem={upsertDiagnosis}
          deleteItem={deleteDiagnosis}
          bulkDeleteItems={bulkDeleteDiagnoses}
        />
      );
    }
    if (activeSection === 'medications') {
      return <MedicationManagement />;
    }
    if (activeSection === 'clinical-parameters') {
      return (
        <ClinicalParameters
          initialParameters={clinicalParameters}
          onParametersUpdate={() => undefined}
        />
      );
    }
    return <UserManagement initialUsers={users} onUsersUpdate={onUsersUpdate} />;
  }, [activeSection, clinicalParameters, clinics, diagnoses, onUsersUpdate, payers, users]);

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <SetupCard>{content}</SetupCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SetupCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}
