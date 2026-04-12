"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { Patient } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { formatAppointmentDateTime } from "@/lib/date-format"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? "P"
  const second = parts[1]?.[0] ?? ""
  return `${first}${second}`.toUpperCase()
}

function getStatusBadge(status: Patient["status"]) {
  const base = "text-[10px] font-bold uppercase tracking-widest"
  if (status === "Active") {
    return (
      <Badge
        variant="outline"
        className={cn(base, "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300")}
      >
        Active
      </Badge>
    )
  }
  if (status === "Critical") {
    return (
      <Badge
        variant="outline"
        className={cn(base, "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300")}
      >
        Critical
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className={base}>
      {status}
    </Badge>
  )
}

export default function PatientRegistryCards({
  patients,
  linkToProgress = false,
  toolbarActions,
  toolbarFilters,
  emptyLabel = "No matching patients found.",
}: {
  patients: Patient[]
  linkToProgress?: boolean
  toolbarActions?: React.ReactNode
  toolbarFilters?: React.ReactNode
  emptyLabel?: string
}) {
  const [query, setQuery] = useState("")
  const pageSize = 5
  const [pageIndex, setPageIndex] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return patients.filter((p) => {
      const name = `${p.first_name || ""} ${p.surname || ""}`.trim().toLowerCase()
      const identifier = (p.patient_identifier || p.email || p.phone || "").toLowerCase()

      const matchesQuery = !q || name.includes(q) || identifier.includes(q)
      return matchesQuery
    })
  }, [patients, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePageIndex = Math.min(pageIndex, pageCount - 1)
  const start = safePageIndex * pageSize
  const paged = filtered.slice(start, start + pageSize)

  useEffect(() => {
    // Reset paging when the filter changes so results feel predictable.
    setPageIndex(0)
  }, [query])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-1 md:flex-row md:items-center md:gap-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients..."
            className="h-9 w-full rounded-xl border-border/70 bg-background/80 md:max-w-[280px]"
          />
          {toolbarFilters ? (
            <div className="w-full md:w-auto">
              {toolbarFilters}
            </div>
          ) : null}
        </div>
        {toolbarActions ? <div className="flex justify-stretch md:justify-end">{toolbarActions}</div> : null}
      </div>

      {filtered.length ? (
        <div className="space-y-3">
          {paged.map((patient) => {
            const name = `${patient.first_name || ""} ${patient.surname || ""}`.trim() || "Unnamed Patient"
            const initials = getInitials(name)
            const identifier = patient.patient_identifier || patient.email || patient.phone || ""
            const activeGoals = patient.active_goals ?? patient.stats?.activeGoals ?? 0
            const appt = patient.next_appointment_date ? formatAppointmentDateTime(patient.next_appointment_date) : ""

            return (
              <Link
                key={patient.id}
                href={linkToProgress ? `/dashboard/patient/${patient.id}/progress` : `/dashboard/patient/${patient.id}`}
                className="group block w-full rounded-2xl border border-border/70 bg-background p-4 shadow-sm transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="h-10 w-10 rounded-xl">
                      {/* @ts-expect-error - patient.avatar_url is not in the type definition but is expected from the API. */}
                      <AvatarImage src={patient.avatar_url} />
                      <AvatarFallback className="rounded-xl text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                      {identifier ? <p className="truncate text-xs text-muted-foreground">{identifier}</p> : null}
                      <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                        {patient.partner_name || "Self-Pay"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          {appt ? (
                            <>
                              Next: <span className="font-medium text-foreground">{appt}</span>
                            </>
                          ) : (
                            "No upcoming appointment"
                          )}
                        </span>
                        <span>
                          Goals: <span className="font-medium text-foreground">{activeGoals}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">{getStatusBadge(patient.status)}</div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-background p-6 text-center text-sm text-muted-foreground shadow-sm">
          {emptyLabel}
        </div>
      )}

      {filtered.length ? (
        <div className="flex flex-col gap-3 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{start + 1}</span>-
            <span className="font-semibold text-foreground">{Math.min(start + pageSize, filtered.length)}</span> of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-xs font-medium">
              Page <span className="font-semibold">{safePageIndex + 1}</span> of{" "}
              <span className="font-semibold">{pageCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="hidden h-7 w-7 rounded-lg p-0 lg:flex"
                onClick={() => setPageIndex(0)}
                disabled={safePageIndex === 0}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-7 w-7 rounded-lg p-0"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-7 w-7 rounded-lg p-0"
                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePageIndex >= pageCount - 1}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="hidden h-7 w-7 rounded-lg p-0 lg:flex"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={safePageIndex >= pageCount - 1}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
