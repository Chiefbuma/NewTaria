'use client';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

export default function UpcomingAppointmentsSection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const appointments = patient.appointments;

    return (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
                           <CalendarCheck className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Next Appointment</CardTitle>
                            <CardDescription>Upcoming scheduled visit</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {appointments.length > 0 ? (
                        <div>
                            <p className="font-semibold">{appointments[0].title}</p>
                            <p>Date: {new Date(appointments[0].appointment_date).toLocaleString()}</p>
                            <p>With: {appointments[0].clinician?.name}</p>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No upcoming appointments.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
