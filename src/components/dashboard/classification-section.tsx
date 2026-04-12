import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type ClassificationRow = {
  label: string;
  total: number;
  meta?: string | null;
};

export default function ClassificationSection({
  index,
  title,
  description,
  rows,
  measuredLabel,
  total,
  className,
}: {
  index: number;
  title: string;
  description: string;
  rows: ClassificationRow[];
  measuredLabel: string;
  total: number;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-[24px] border border-border/70 bg-muted/10 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.18)] transition-colors dark:bg-muted/10',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-foreground">
          {index}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 space-y-1">
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
                {title}
              </h3>
              <p className="text-[12px] leading-5 text-muted-foreground">{description}</p>
            </div>

            <div className="text-[11px] font-semibold text-muted-foreground">
              {measuredLabel}:{' '}
              <span className="font-semibold text-foreground">{total}</span>
            </div>
          </div>

          <Table className="min-w-0 table-fixed">
            <TableHeader className="bg-transparent">
              <TableRow className="border-border/60">
                <TableHead className="w-[60%]">Category</TableHead>
                <TableHead className="w-[90px] text-right">Total</TableHead>
                <TableHead className="w-[70px] text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length ? (
                rows.map((row) => {
                  const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
                  return (
                    <TableRow key={row.label} className="border-border/50">
                      <TableCell className="py-2 font-medium text-foreground">
                        <div className="min-w-0">
                          <div className="truncate">{row.label}</div>
                          {row.meta ? (
                            <div className="truncate text-[11px] font-normal text-muted-foreground">{row.meta}</div>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right font-semibold text-foreground">{row.total}</TableCell>
                      <TableCell className="py-2 text-right text-muted-foreground">{pct}%</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-[12px] italic text-muted-foreground">
                    No records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

