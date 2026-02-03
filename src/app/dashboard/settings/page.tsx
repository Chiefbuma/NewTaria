import { fetchClinicalParameters } from '@/lib/data';
import SettingsClient from './settings-client';

export default async function SettingsPage() {
  const parameters = await fetchClinicalParameters();

  return (
     <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Settings
            </h1>
            <p className="text-muted-foreground">
                Manage clinical parameters for patient assessments.
            </p>
            </div>
        </div>
        <SettingsClient initialParameters={parameters} />
    </div>
  )
}
