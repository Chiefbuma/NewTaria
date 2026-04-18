'use client';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Shield, Activity, Target, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck } from 'lucide-react';
import { calculateAgeFromDob } from '@/lib/age';

const StatusBadge = ({ status }: { status: Patient['status'] }) => {
  const statusConfig = {
    'Active': {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-300 dark:border-green-700',
      icon: <CheckCircle className="w-3 h-3" />
    },
    'Pending': {
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-700',
      icon: <Info className="w-3 h-3" />
    },
    'Critical': {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-300 dark:border-red-700',
      icon: <AlertTriangle className="w-3 h-3" />
    },
    'In Review': {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-700',
      icon: <Activity className="w-3 h-3" />
    },
    'Discharged': {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-300 dark:border-gray-600',
      icon: <Shield className="w-3 h-3" />
    },
  };

  const config = statusConfig[status] || statusConfig['Pending'];

  return (
    <motion.span
      className={cn('inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full border', config.bg, config.text, config.border)}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {config.icon}
      {status}
    </motion.span>
  );
};

export default function PatientCard({ patient, index }: { patient: Patient, index: number }) {
    const stats = patient.stats;
    if (!stats) return null;

    const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');
    const calculatedAge = calculateAgeFromDob(patient.dob);
    
    const completionRate = stats.totalGoals > 0 ? Math.round((stats.activeGoals / stats.totalGoals) * 100) : 0;
    const name = `${patient.first_name} ${patient.surname || ''}`
    const fallback = `${patient.first_name?.[0] || 'P'}${patient.surname ? patient.surname[0] : ''}`
  
    return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="w-full"
    >
      <Link href={`/dashboard/patient/${patient.id}`} className="block">
        <motion.div
            className="w-full bg-white dark:bg-card border border-gray-200 dark:border-card-foreground/20 rounded-xl shadow-sm hover:shadow-lg hover:border-primary/50 cursor-pointer transition-all duration-300 relative overflow-hidden"
            whileHover={{ y: -4, borderColor: 'hsl(var(--primary))' }}
        >
        <div className="flex items-start p-5 gap-5">
            <Avatar className="h-16 w-16 sm:flex rounded-lg shadow-lg">
                {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={name} />}
                <AvatarFallback className="rounded-lg">{fallback}</AvatarFallback>
            </Avatar>

            <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-foreground capitalize hover:underline">
                            {patient.first_name} {patient.surname}
                        </h3>
                        {stats.needsAttention && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <motion.div
                                            className="w-3 h-3 bg-red-500 rounded-full"
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                        />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Patient requires attention</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {calculatedAge ?? patient.age ?? 'N/A'} years old &middot; {patient.gender || 'N/A'}
                        </p>
                    </div>
                    <Badge variant="outline">{patient.status}</Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><Target className="w-4 h-4"/>Goals</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Total:</span> <span className="font-bold">{stats.totalGoals}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Active:</span> <span className="font-bold text-green-600 dark:text-green-400">{stats.activeGoals}</span></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                         <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"><ClipboardCheck className="w-4 h-4"/>Assessments</h4>
                         <div className="space-y-1 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Total:</span> <span className="font-bold">{stats.totalAssessments}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Coverage:</span> <span className={cn("font-bold", stats.assessmentCoverage >= 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400')}>{stats.assessmentCoverage}%</span></div>
                        </div>
                    </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2.5 dark:bg-muted/50 mt-auto">
                    <motion.div
                        className={cn("h-2.5 rounded-full", patient.status === 'Critical' ? 'bg-red-500' : 'bg-primary')}
                        style={{ width: `${completionRate}%` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    ></motion.div>
                </div>

            </div>
        </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};
