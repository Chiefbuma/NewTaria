'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, type TooltipProps } from 'recharts';

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-surface]:overflow-visible',
        className
      )}
      {...props}
    />
  )
);
ChartContainer.displayName = 'ChartContainer';

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipProps<any, any> & {
    hideLabel?: boolean;
  }
>(({ active, payload, className, hideLabel }, ref) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const a = payload[0];

  return (
    <div
      ref={ref}
      className={cn('grid gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs shadow-lg', className)}
    >
      {!hideLabel && <div className="font-medium">{a.name}</div>}
      <div className="flex items-center gap-1.5">
        <div
          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
          style={{
            backgroundColor: a.payload.fill,
          }}
        />
        <div className="flex flex-1 justify-between">
          <div className="text-muted-foreground">{a.name}</div>
          <div className="font-medium">
            {a.value} ({Math.round(a.payload.percent * 100)}%)
          </div>
        </div>
      </div>
    </div>
  );
});
ChartTooltipContent.displayName = 'ChartTooltipContent';

export type ClassificationRow = {
  label: string;
  total: number;
  male: number;
  female: number;
  meta?: string | null;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

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
  const chartData = rows.map((row, index) => ({
    name: row.label,
    value: row.total,
    fill: COLORS[index % COLORS.length],
    percent: total > 0 ? row.total / total : 0,
  }));

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
          <div className="flex flex-col md:flex-row md:gap-6 md:items-center">
            <div className="flex items-center justify-center">
              <ChartContainer config={{}} className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="95%"
                      paddingAngle={5}
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="flex-1 overflow-x-auto mt-6 md:mt-0">
              <Table className="min-w-full table-auto">
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
      </div>
    </section>
  );
}
