'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Partner } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export default function PartnerGlobalFilter({
  partners,
  selectedPartnerId,
  locked = false,
  lockedLabel,
  labelPrefix,
}: {
  partners: Partner[];
  selectedPartnerId: number | null;
  locked?: boolean;
  lockedLabel?: string;
  labelPrefix?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const options = useMemo(() => {
    return partners
      .filter((p) => !p.deleted_at)
      .slice()
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [partners]);

  const value = locked
    ? String(selectedPartnerId ?? '')
    : selectedPartnerId
      ? String(selectedPartnerId)
      : 'all';

  const onChange = (next: string) => {
    if (locked) return;
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') {
      params.delete('partnerId');
    } else {
      params.set('partnerId', next);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  if (locked) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-xs font-semibold text-muted-foreground">
          {labelPrefix ? `${labelPrefix} • ` : ''}Partner
        </div>
        <div className={cn('rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm font-medium')}>
          {lockedLabel || 'Partner'}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="text-xs font-semibold text-muted-foreground">
        {labelPrefix ? `${labelPrefix} • ` : ''}Partner filter
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-full rounded-xl sm:w-[260px]">
          <SelectValue placeholder="All partners" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All partners</SelectItem>
          {options.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

