import { Suspense } from 'react';
import LoginPageClient from '@/app/page-client';

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageClient />
    </Suspense>
  );
}

function LoginPageFallback() {
  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-3 py-6 sm:p-4">
      <div className="w-full max-w-md rounded-[1.5rem] border border-white/45 bg-background/80 p-6 shadow-[0_36px_90px_-36px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-background/70">
        <div className="space-y-3 rounded-2xl border border-border/70 bg-background/70 p-5 backdrop-blur-xl">
          <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-5 space-y-3">
          <div className="h-10 animate-pulse rounded-xl bg-muted/80" />
          <div className="h-10 animate-pulse rounded-xl bg-muted/80" />
          <div className="h-11 animate-pulse rounded-xl bg-muted/80" />
        </div>
      </div>
    </div>
  );
}
