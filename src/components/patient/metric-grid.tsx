'use client';
import type { Patient, ClinicalParameter, Assessment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import AddAssessmentModal from './add-assessment-modal';
import { FileAudio, Image as ImageIcon } from 'lucide-react';

type MetricCardProps = {
  parameter: ClinicalParameter;
  assessments: Assessment[];
  onSaveAssessment: (assessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => void;
};

const MetricCard = ({ parameter, assessments, onSaveAssessment }: MetricCardProps) => {
  const latestAssessment = assessments
    .filter(a => a.clinical_parameter_id === parameter.id)
    .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())[0];

  const history = parameter.type === 'numeric'
    ? assessments
        .filter(a => a.clinical_parameter_id === parameter.id)
        .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
        .slice(-10) // Get last 10 for chart
        .map(a => ({
          date: new Date(a.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: parseFloat(a.value),
        }))
        .filter((d) => Number.isFinite(d.value))
    : [];

  const chartConfig = {
    value: {
      label: parameter.name,
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
            <div>
                 <CardTitle className="text-lg">{parameter.name}</CardTitle>
                 {parameter.unit && <CardDescription>{parameter.unit}</CardDescription>}
            </div>
            <AddAssessmentModal
              trigger={
                <Button variant="ghost" size="icon">
                  <PlusCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              }
              parameter={parameter}
              existingAssessment={null}
              onSave={onSaveAssessment}
            />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div>
            {latestAssessment ? (
            <>
                {parameter.type === 'image' ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <a href={latestAssessment.value} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                      View photo
                    </a>
                  </div>
                ) : parameter.type === 'voice' ? (
                  <div className="flex items-center gap-2">
                    <FileAudio className="h-4 w-4 text-muted-foreground" />
                    <a href={latestAssessment.value} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline">
                      Play voice note
                    </a>
                  </div>
                ) : (
                  <p className="text-4xl font-bold">{latestAssessment.value}</p>
                )}
                <p className="text-sm text-muted-foreground">
                Measured on {new Date(latestAssessment.measured_at).toLocaleDateString()}
                </p>
            </>
            ) : (
            <p className="text-center text-muted-foreground py-4">No data yet</p>
            )}
        </div>
        {history.length > 1 && (
          <div className="h-24 -ml-4 mt-4">
             <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart data={history} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function MetricGrid({ patient, clinicalParameters, onAssessmentsUpdate }: { patient: Patient, clinicalParameters: ClinicalParameter[], onAssessmentsUpdate: (assessments: Assessment[]) => void }) {
  const handleSaveAssessment = (newAssessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => {
    const fullAssessment: Assessment = {
        id: Date.now(),
        patient_id: patient.id,
        created_at: new Date().toISOString(),
        ...newAssessment
    };
    onAssessmentsUpdate([...patient.assessments, fullAssessment]);
  }

  return (
    <div className="space-y-6 pt-6">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clinicalParameters.map(param => (
          <MetricCard
            key={param.id}
            parameter={param}
            assessments={patient.assessments}
            onSaveAssessment={handleSaveAssessment}
          />
        ))}
      </div>
    </div>
  );
}
