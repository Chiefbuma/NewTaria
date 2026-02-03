'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function GoalsSettingSection({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <PlusCircle className="text-white" />
          </div>
          <div>
            <CardTitle>Treatment Goals</CardTitle>
            <CardDescription>Set and track patient health goals</CardDescription>
          </div>
        </div>
        <Button variant="outline" onClick={() => onUpdate()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {patient.goals && patient.goals.length > 0 ? (
          patient.goals.map(goal => (
            <div key={goal.id} className="p-4 rounded-xl border bg-muted/50 space-y-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{goal.notes}</p>
                        <p className="text-sm text-muted-foreground">
                            Target: {goal.target_operator} {goal.target_value}
                        </p>
                         <p className="text-sm text-muted-foreground">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>{goal.status}</Badge>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-4">No goals have been set for this patient.</p>
        )}
      </CardContent>
    </Card>
  );
}
