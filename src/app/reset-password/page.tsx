import { Suspense } from 'react';
import ResetPasswordPageClient from '@/app/reset-password/page-client';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/40" />}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
