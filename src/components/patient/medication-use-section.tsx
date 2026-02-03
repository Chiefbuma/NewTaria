'use client';
import type { Patient, Prescription } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const frequencyDisplayMap: { [key: string]: string } = {
    'daily': 'Daily',
    'twice_daily': 'Twice Daily',
    'weekly': 'Weekly',
    'as_needed': 'As Needed'
  };

  const statusDisplayMap: { [key: string]: { label: string; color: string; } } = {
    'active': { label: 'Active', color: 'green' },
    'completed': { label: 'Completed', color: 'blue' },
    'discontinued': { label: 'Discontinued', color: 'gray' }
  };

export function MedicationUseSection({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <PlusCircle className="text-white"/>
                    </div>
                    <div>
                        <CardTitle>Current Medications</CardTitle>
                    </div>
                </div>
                <Button variant="outline" onClick={() => onUpdate()}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
                </Button>
            </CardHeader>
            <CardContent>
                 {patient.prescriptions && patient.prescriptions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {patient.prescriptions.map((p) => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.medication_id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{frequencyDisplayMap[p.frequency] || p.frequency}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.start_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No prescriptions found.</p>
                )}
            </CardContent>
        </Card>
    );
}
