"use client"

import Link from "next/link"
import { ClipboardList, Calendar } from "lucide-react"

import type { Partner, Patient, RegistryInsights } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatAppointmentDateTime } from "@/lib/date-format"
import PatientRegistryCards from "@/components/dashboard/patient-registry-cards"
import PartnerGlobalFilter from "@/components/dashboard/partner-global-filter"

export default function RegistryDashboard({
  patients,
  insights,
  partners = [],
  selectedPartnerId = null,
  partnerLocked = false,
  lockedPartnerLabel,
}: {
  patients: Patient[]
  insights: RegistryInsights
  partners?: Partner[]
  selectedPartnerId?: number | null
  partnerLocked?: boolean
  lockedPartnerLabel?: string
}) {
  return (
    <div className="space-y-6">
      {partnerLocked ? (
        <div className="text-center text-sm font-bold tracking-[0.18em] text-foreground">
          {(lockedPartnerLabel || 'Partner').toUpperCase()}
        </div>
      ) : (
        <>
          <PartnerGlobalFilter
            partners={partners}
            selectedPartnerId={selectedPartnerId ?? null}
            locked={false}
            lockedLabel={lockedPartnerLabel}
            labelPrefix="Registry"
          />
          {selectedPartnerId ? (
            <div className="text-xs font-semibold text-muted-foreground">
              Filtered by partner:{' '}
              <span className="text-foreground">{partners.find((p) => p.id === selectedPartnerId)?.name || 'Partner'}</span>
            </div>
          ) : null}
        </>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-6">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader className="pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    Patients
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest">
                  {patients.length} shown
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <PatientRegistryCards
                patients={patients}
                linkToProgress={partnerLocked}
                toolbarActions={null}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[320px] pr-3">
              <div className="space-y-3">
                {insights.upcomingAppointments.length ? (
                  insights.upcomingAppointments.map((appt) => (
                    <Link
                      key={`${appt.patient_id}:${appt.appointment_date}`}
                      href={
                        partnerLocked
                          ? `/dashboard/patient/${appt.patient_id}/progress`
                          : `/dashboard/patient/${appt.patient_id}`
                      }
                      className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-background p-3 shadow-sm transition-colors hover:bg-muted/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{appt.patient_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {appt.partner_name || appt.clinic_name || "Unassigned"} •{" "}
                          {formatAppointmentDateTime(appt.appointment_date)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{appt.title}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px] font-bold uppercase tracking-widest">
                        {appt.status.replace("_", " ")}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                    No upcoming appointments.
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
