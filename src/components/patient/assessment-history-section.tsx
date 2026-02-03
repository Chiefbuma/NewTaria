'use client';
import type { Patient, Review } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

export function AssessmentHistorySection({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                <Stethoscope className="text-white text-sm"/>
            </div>
            <div>
                <CardTitle>Clinical Review History</CardTitle>
                <CardDescription>Past clinical evaluations</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {patient.reviews && patient.reviews.length > 0 ? (
          patient.reviews.map(review => (
            <div key={review.id} className="p-4 rounded-xl border bg-muted/50">
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold">Treatment Plan</h4>
                  <p className="text-sm text-muted-foreground">{review.plan}</p>
                </div>
                 <div>
                  <h4 className="text-sm font-semibold">Recommendations</h4>
                  <p className="text-sm text-muted-foreground">{review.recommendations}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                    <span>Reviewed by: {review.user_id}</span>
                    <span>{formatDate(review.review_date)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">No review history.</p>
        )}
      </CardContent>
    </Card>
  );
}
