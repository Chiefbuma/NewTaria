import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerBadge?: React.ReactNode;
  headerTone?: 'neutral' | 'primary';
  cardClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
  headerBadge,
  headerTone = 'neutral',
  cardClassName,
  headerClassName,
  contentClassName,
}: AuthShellProps) {
  const isPrimaryHeader = headerTone === 'primary';
  return (
    <div className="mesh-bg relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-6 sm:p-4">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.5),transparent_42%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_36%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-white/60 dark:bg-white/10" />
      <div className="relative z-10 w-full max-w-md">
        <Card className={cn('overflow-hidden border-white/45 bg-background/80 shadow-[0_36px_90px_-36px_rgba(15,23,42,0.28)] backdrop-blur-2xl dark:border-white/10 dark:bg-background/70', cardClassName)}>
          <CardHeader
            className={cn(
              'text-center',
              isPrimaryHeader ? 'bg-primary text-primary-foreground' : 'form-header-bar',
              headerClassName
            )}
          >
            {headerBadge ? <div className="mx-auto mb-2">{headerBadge}</div> : null}
            <CardTitle className={cn('text-2xl', isPrimaryHeader ? 'text-primary-foreground' : 'text-foreground')}>
              {title}
            </CardTitle>
            <CardDescription className={cn(isPrimaryHeader ? 'text-primary-foreground/90' : 'text-muted-foreground')}>
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className={cn('bg-background/60 p-5 sm:p-6', contentClassName)}>
            {children}
            {footer ? <div className="mt-4 text-center text-sm">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}