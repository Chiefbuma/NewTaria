'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, CalendarPlus, SlidersHorizontal } from 'lucide-react';

export function QuickActionsPanel({
    onEditPatient,
    onScheduleFollowUp,
    onManageParams
}: {
    onEditPatient: () => void;
    onScheduleFollowUp: () => void;
    onManageParams: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="text-amber-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start" onClick={onEditPatient}>
          <Edit className="mr-2 h-4 w-4" /> Edit Patient Info
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={onScheduleFollowUp}>
          <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Follow-up
        </Button>
        <Button variant="outline" className="w-full justify-start" onClick={onManageParams}>
          <SlidersHorizontal className="mr-2 h-4 w-4" /> Edit Clinical Parameters
        </Button>
      </CardContent>
    </Card>
  );
}
