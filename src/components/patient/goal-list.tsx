'use client';

import type { Patient, Goal, ClinicalParameter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import AddGoalModal from './add-goal-modal';

export default function GoalList({ patient, goals, clinicalParameters, onGoalsUpdate }: { patient: Patient, goals: Goal[], clinicalParameters: ClinicalParameter[], onGoalsUpdate: (goals: Goal[]) => void }) {
    const handleSaveGoal = (newGoalData: Omit<Goal, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => {
        let updatedGoals;
        if (newGoalData.id) {
            updatedGoals = goals.map(g => g.id === newGoalData.id ? { ...g, ...newGoalData } : g);
        } else {
            const fullGoal: Goal = {
                id: Date.now(),
                patient_id: patient.id,
                created_at: new Date().toISOString(),
                ...newGoalData,
            } as Goal;
            updatedGoals = [...goals, fullGoal];
        }
        onGoalsUpdate(updatedGoals);
    }

    const handleDeleteGoal = (id: number) => {
        const updatedGoals = goals.filter(g => g.id !== id);
        onGoalsUpdate(updatedGoals);
    }

    const getParameterName = (id: number) => {
        return clinicalParameters.find(p => p.id === id)?.name || 'Unknown Parameter';
    }

    return (
        <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
                <div />
                <AddGoalModal
                    trigger={
                        <Button>
                            <PlusCircle className="mr-2" /> Add Goal
                        </Button>
                    }
                    onSave={handleSaveGoal}
                    clinicalParameters={clinicalParameters}
                    existingGoal={null}
                />
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Treatment Goals</CardTitle>
                    <CardDescription>All treatment goals for this patient.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {goals.length > 0 ? (
                        goals.map(goal => (
                            <div key={goal.id} className="p-4 rounded-xl border bg-muted/50 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{getParameterName(goal.clinical_parameter_id)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Target: {goal.target_operator} {goal.target_value}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                        </p>
                                        {goal.notes && <p className="text-sm italic text-muted-foreground pt-2">Notes: {goal.notes}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>{goal.status}</Badge>
                                        <AddGoalModal
                                            trigger={
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            }
                                            onSave={handleSaveGoal}
                                            clinicalParameters={clinicalParameters}
                                            existingGoal={goal}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No goals set for this patient.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
