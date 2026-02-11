'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function ReviewHistoryCard({ patient }: { patient: Patient }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    <span>Review History</span>
                </CardTitle>
                <CardDescription>A log of past clinical reviews.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {patient.reviews.length > 0 ? (
                    patient.reviews.slice(0, 3).map(review => ( // show latest 3
                        <div key={review.id} className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex justify-between items-baseline">
                                <p className="font-semibold text-sm">Review on {new Date(review.review_date).toLocaleDateString()}</p>
                                <p className="text-xs text-muted-foreground">by {review.reviewed_by}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{review.plan}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4">No reviews yet.</p>
                )}
            </CardContent>
        </Card>
    )
}
