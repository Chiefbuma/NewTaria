'use client';
import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { clinicalParameters as mockClinicalParameters } from '@/lib/mock-data';

export default function GoalsSettingSection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const [goals, setGoals] = useState(patient.goals);
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                           <Target className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Treatment Goals</CardTitle>
                            <CardDescription>Set and track patient health goals</CardDescription>
                        </div>
                    </div>
                     <Button onClick={() => {}} variant="outline">Add Goal</Button>
                </CardHeader>
                <CardContent>
                    {goals.length > 0 ? (
                        <div className="space-y-4">
                        {goals.map(goal => (
                            <div key={goal.id} className="p-4 rounded-xl border bg-background/50">
                                <p className="font-semibold">{mockClinicalParameters.find(p => p.id === goal.clinical_parameter_id)?.name}</p>
                                <p className="text-sm text-muted-foreground">Target: {goal.target_operator} {goal.target_value}</p>
                                <p className="text-sm text-muted-foreground">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground capitalize">Status: {goal.status}</p>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No goals set.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
