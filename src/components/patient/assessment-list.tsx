'use client';

import { useState } from 'react';
import type { Patient, Assessment, ClinicalParameter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { getAssessmentColumns } from './assessment-columns';
import AddAssessmentModal from './add-assessment-modal';


export default function AssessmentList({ patient, assessments, clinicalParameters, onAssessmentsUpdate }: { patient: Patient, assessments: Assessment[], clinicalParameters: ClinicalParameter[], onAssessmentsUpdate: (assessments: Assessment[]) => void }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParameter, setSelectedParameter] = useState<ClinicalParameter | null>(null);

    const handleAddAssessmentClick = () => {
        // When adding from the list, we don't pre-select a parameter
        setSelectedParameter(null);
        setIsModalOpen(true);
    };

    const handleSaveAssessment = (newAssessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'>) => {
        const fullAssessment: Assessment = {
            id: Date.now(),
            patient_id: patient.id,
            created_at: new Date().toISOString(),
            ...newAssessment
        };
        onAssessmentsUpdate([...assessments, fullAssessment]);
        setIsModalOpen(false);
    }
    
    const handleDeleteAssessment = (assessmentId: number) => {
        const updatedAssessments = assessments.filter(a => a.id !== assessmentId);
        onAssessmentsUpdate(updatedAssessments);
    }
    
    const handleEditAssessment = (updatedAssessment: Assessment) => {
         const updatedAssessments = assessments.map(a => a.id === updatedAssessment.id ? updatedAssessment : a);
         onAssessmentsUpdate(updatedAssessments);
    }

    const assessmentColumns = getAssessmentColumns({
        clinicalParameters,
        onEdit: handleEditAssessment,
        onDelete: handleDeleteAssessment,
    });

    return (
        <div className="space-y-6 pt-6">
             <div className="flex items-center justify-between">
                <div />
                <Button onClick={handleAddAssessmentClick}>
                    <PlusCircle className="mr-2" /> Add Assessment
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Assessment History</CardTitle>
                    <CardDescription>All clinical assessments recorded for this patient.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable columns={assessmentColumns} data={assessments} />
                </CardContent>
            </Card>

            {isModalOpen && (
                <AddAssessmentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    parameter={selectedParameter}
                    onSave={handleSaveAssessment}
                    allParameters={clinicalParameters}
                />
            )}
        </div>
    )
}
