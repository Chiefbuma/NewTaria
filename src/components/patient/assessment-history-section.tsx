'use client';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { FileClock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

export default function AssessmentHistorySection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const reviews = patient.reviews;

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card>
                 <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                           <FileClock className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Clinical Review History</CardTitle>
                            <CardDescription>Past clinical evaluations</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                        {reviews.map(review => (
                            <div key={review.id} className="p-4 rounded-xl border bg-muted/50">
                                <p className="font-semibold">Review on {new Date(review.review_date).toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground">by {review.reviewed_by}</p>
                                <p className="text-sm mt-2">{review.plan}</p>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No reviews yet.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
