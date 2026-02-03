import type { Patient } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


export default function PatientHeader({ patient }: { patient: Patient }) {
    const status = patient.status;
    const variant = status === 'Active' ? 'default' : status === 'Critical' ? 'destructive' : 'secondary';
    
    return (
        <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" size="icon">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Dashboard</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">{`${patient.first_name} ${patient.surname || ''}`}</h1>
                    <p className="text-muted-foreground">
                        {patient.status === 'Pending' ? 'Complete the onboarding process for this patient.' : 'Patient Assessment and Details'}
                    </p>
                </div>
            </div>
             <Badge 
                variant={variant} 
                className={cn(
                    'text-base ml-4', 
                    status === 'Active' && 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30', 
                    status === 'Critical' && 'bg-red-500/20 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-500/30'
                )}
             >
                {status}
            </Badge>
        </div>
    )
}
