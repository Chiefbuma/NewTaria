import type React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AuthShellProps = {
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerBadge?: React.ReactNode;
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
  cardClassName,
  headerClassName,
  contentClassName,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-3 py-6 sm:p-4">
      <div className="relative z-10 w-full max-w-md">
        <Card className={cn('overflow-hidden border-border/60 bg-card shadow-[0_30px_70px_-24px_rgba(15,23,42,0.18)]', cardClassName)}>
          <CardHeader className={cn('form-header-bar text-center', headerClassName)}>
            {headerBadge ? <div className="mx-auto mb-2">{headerBadge}</div> : null}
            <CardTitle className="text-2xl text-foreground">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          </CardHeader>
          <CardContent className={cn('bg-card p-5 sm:p-6', contentClassName)}>
            {children}
            {footer ? <div className="mt-4 text-center text-sm">{footer}</div> : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
