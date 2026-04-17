import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type ClassificationRow = {
  label: string;
  total: number;
  male: number;
  female: number;
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
  const mobileRows = rows.length ? rows : [];

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

          <div className="grid gap-3 sm:hidden">
            {mobileRows.length ? (
              mobileRows.map((row) => {
                const pct = total > 0 ? Math.round((row.total / total) * 100) : 0;
                return (
                  <div key={row.label} className="rounded-2xl border border-border/60 bg-background p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">{row.label}</div>
                        {row.meta ? (
                          <div className="mt-1 truncate text-[11px] text-muted-foreground">{row.meta}</div>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-sm font-semibold text-foreground">{row.total}</div>
                        <div className="text-[11px] text-muted-foreground">{pct}%</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                      <div className="rounded-xl border border-border/60 bg-muted/20 px-2 py-1 text-center">
                        <div className="font-semibold text-foreground">{row.male}</div>
                        M
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 px-2 py-1 text-center">
                        <div className="font-semibold text-foreground">{row.female}</div>
                        F
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/20 px-2 py-1 text-center">
                        <div className="font-semibold text-foreground">{pct}%</div>
                        Share
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-border/60 bg-background p-4 text-center text-[12px] italic text-muted-foreground">
                No records found.
              </div>
            )}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <Table className="min-w-full table-fixed">
              <TableHeader className="bg-transparent">
                <TableRow className="border-border/60">
                  <TableHead className="w-[40%]">Category</TableHead>
                  <TableHead className="w-[15%] text-right">Total</TableHead>
                  <TableHead className="w-[15%] text-right">M</TableHead>
                  <TableHead className="w-[15%] text-right">F</TableHead>
                  <TableHead className="w-[15%] text-right">Share</TableHead>
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
                        <TableCell className="py-2 text-right text-muted-foreground">{row.male}</TableCell>
                        <TableCell className="py-2 text-right text-muted-foreground">{row.female}</TableCell>
                        <TableCell className="py-2 text-right text-muted-foreground">{pct}%</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-[12px] italic text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </section>
  );
}
