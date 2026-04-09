import { Suspense } from 'react';
import LoginPageClient from '@/app/page-client';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/40" />}>
      <LoginPageClient />
    </Suspense>
  );
}
