'use client';
import { useState } from 'react';
import type { Patient, ClinicalParameter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save } from 'lucide-react';

export function ClinicalAssessments({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
  const [activeTab, setActiveTab] = useState('vital_sign');

  const tabs = [
    { id: 'vital_sign', label: 'Vital Signs' },
    { id: 'lab_result', label: 'Lab Results' },
    { id: 'clinical_measurement', label: 'Measurements' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
            <Save className="text-white" />
          </div>
          <div>
            <CardTitle>Clinical Assessments</CardTitle>
            <CardDescription>Create new assessment records for tracking over time</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id}>
              <div className="p-4 border rounded-md min-h-[200px]">
                <p className="text-muted-foreground text-center">
                  Form for "{tab.label}" would go here.
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="mt-6 flex justify-end">
            <Button onClick={onUpdate}>
                <Save className="mr-2 h-4 w-4"/>
                Create Assessment Records
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
