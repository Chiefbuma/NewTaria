'use client';

import { useMemo } from 'react';
import type { Assessment, ClinicalParameter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

export default function AllNotesCard({ assessments, clinicalParameters }: { assessments: Assessment[], clinicalParameters: ClinicalParameter[] }) {
    const latestNotesByParameter = useMemo(() => {
        const parameterIdsWithNotes = new Set(assessments.filter(a => a.notes).map(a => a.clinical_parameter_id));
        
        return Array.from(parameterIdsWithNotes).map(paramId => {
            const parameter = clinicalParameters.find(p => p.id === paramId);
            const latestAssessmentWithNote = assessments
                .filter(a => a.clinical_parameter_id === paramId && a.notes)
                .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())[0];
            
            return {
                parameter,
                assessment: latestAssessmentWithNote
            };
        }).filter(item => item.parameter && item.assessment);

    }, [assessments, clinicalParameters]);

    return (
        <Card className="overflow-hidden border-primary/10">
            <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/>Latest Notes</CardTitle>
                <CardDescription>Recent notes from all assessments.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                {latestNotesByParameter.length > 0 ? (
                    <ScrollArea className="h-96">
                        <div className="space-y-4 pr-4">
                            {latestNotesByParameter.map(({ parameter, assessment }) => (
                                <div key={parameter!.id} className="p-3 bg-muted/50 rounded-lg">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-semibold text-sm">{parameter!.name}</p>
                                        <p className="text-xs text-muted-foreground">{new Date(assessment.measured_at).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{assessment.notes}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No assessment notes found.</p>
                )}
            </CardContent>
        </Card>
    );
}
