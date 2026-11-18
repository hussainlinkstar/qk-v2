"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CalendarDays, Check, Mail, MessageSquare, Phone, UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsappSalesCockpitShell } from "@/components/whatsapp-sales/cockpit-shell";
import { getMockLead } from "@/components/whatsapp-sales/mocks";
import { useWhatsappSalesWorkerName } from "@/components/whatsapp-sales/use-worker-name";
import {
  formatDisplayDate, interestBadgeClass, statusBadgeClass,
} from "@/components/whatsapp-sales/utils";

const CARD = "rounded-2xl border border-white/[0.07] bg-[#0c1018]";

export default function WhatsappSalesLeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const { agentId, workerName } = useWhatsappSalesWorkerName();
  const router = useRouter();
  const lead = getMockLead(leadId);
  const [handoffActive, setHandoffActive] = useState(lead?.handoff ?? false);
  const [resumeNote, setResumeNote] = useState("");

  return (
    <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="leads">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5">
        <button
          type="button"
          onClick={() => router.push(`/leads`)}
          className="inline-flex w-fit items-center gap-1.5 text-[13px] text-slate-400 underline-offset-4 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
        >
          <ArrowLeft className="size-3.5" /> Back to leads
        </button>

        {!lead ? (
          <div className={cn(CARD, "border-dashed px-6 py-16 text-center text-sm text-slate-500")}>
            Lead not found in mock data.
          </div>
        ) : (
          <>
            {/* Hero */}
            <header className={cn(CARD, "p-5 sm:p-6")}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3.5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full border border-indigo-400/25 bg-indigo-500/20 text-[14px] font-bold uppercase tracking-wide text-indigo-100">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </span>
                  <div className="min-w-0">
                    <h1 className="text-[24px] font-bold tracking-[-0.03em] text-white sm:text-[28px]">
                      {lead.firstName} {lead.lastName}
                    </h1>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5 text-slate-500" />
                        {lead.email}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5 text-slate-500" />
                        {lead.phone}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge className={interestBadgeClass(lead.interest)}>{lead.interest} interest</Badge>
                      <Badge className={statusBadgeClass(lead.status)}>{lead.status}</Badge>
                      {handoffActive && (
                        <Badge className="border-red-500/25 bg-red-500/10 text-red-300">Handoff paused</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                  <span className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-[10px] font-bold uppercase text-slate-200">
                    {nameInitials(lead.assignedRep)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Assigned rep</p>
                    <p className="truncate text-[13px] font-medium text-white">{lead.assignedRep}</p>
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-[70ch] text-[13.5px] leading-relaxed text-slate-300">{lead.summary}</p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-slate-500">Qualification</span>
                  <span className="font-semibold text-slate-300">{lead.qualificationProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${lead.qualificationProgress}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-slate-500">{lead.conversationStage}</p>
              </div>
            </header>

            {/* Compact strip */}
            <div className={cn(CARD, "flex flex-wrap items-stretch divide-x divide-white/[0.06]")}>
              <StripStat label="Market" value={lead.marketInterest || "—"} />
              <StripStat label="Budget" value={lead.budget || "TBC"} />
              <StripStat label="Readiness" value={lead.readiness} />
              <StripStat label="Outreach" value={lead.outreachStatus} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div className="flex flex-col gap-4">
                <section className={cn(CARD, "p-5")}>
                  <SectionTitle icon={UserRound} title="Lead & investor" />
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Fact label="Country" value={lead.country} />
                    <Fact label="Lead source" value={lead.leadSource} />
                    <Fact label="Experience" value={lead.investmentExperience || "—"} />
                    <Fact label="Location interest" value={lead.locationInterest || "—"} />
                    <Fact label="Funding" value={lead.fundingMethod || "—"} />
                    <Fact label="Timeframe" value={lead.timeframe || "—"} />
                  </div>
                </section>

                <section className={cn(CARD, "p-5")}>
                  <SectionTitle icon={MessageSquare} title="Agent assessment" />
                  <p className="mt-3 text-[13px] leading-relaxed text-slate-300">{lead.conversationSummary}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Fact label="Interest" value={lead.interest} />
                    <Fact label="Readiness" value={lead.readiness} />
                    <Fact label="Stage" value={lead.conversationStage} />
                    <Fact label="Webinar engagement" value={lead.webinarEngagement} />
                    <Fact
                      label="Source / webinar"
                      value={lead.sourceWebinar || lead.leadSource}
                      className="sm:col-span-2"
                    />
                  </div>
                </section>

                <section className={cn(CARD, "overflow-hidden")}>
                  <div className="border-b border-white/[0.06] px-5 py-3.5">
                    <SectionTitle icon={MessageSquare} title="Conversation context" />
                    <p className="mt-1 text-[12px] text-slate-500">
                      Recent WhatsApp messages — preview context, not the live Interakt inbox.
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    {lead.messages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p>
                    ) : (
                      <ul className="space-y-2.5">
                        {lead.messages.map((m) => (
                          <li
                            key={m.id}
                            className={cn(
                              "flex",
                              m.direction === "outbound" ? "justify-end" : "justify-start",
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                                m.direction === "outbound"
                                  ? "rounded-br-md bg-indigo-500/25 text-indigo-100"
                                  : "rounded-bl-md border border-white/[0.06] bg-white/[0.03] text-slate-200",
                              )}
                            >
                              <p>{m.text}</p>
                              <p className="mt-1 text-[10px] text-slate-500">{formatDisplayDate(m.at)}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </section>
              </div>

              <div className="flex flex-col gap-4">
                <section className={cn(CARD, "p-5")}>
                  <SectionTitle icon={CalendarDays} title="Outreach & nurture" />
                  <dl className="mt-4 space-y-0 divide-y divide-white/[0.05]">
                    <Row label="Outreach status" value={lead.outreachStatus} />
                    <Row label="Last contacted" value={formatDisplayDate(lead.lastContactedAt)} />
                    <Row label="Last response" value={formatDisplayDate(lead.lastResponseAt)} />
                    <Row label="Follow-up" value={formatDisplayDate(lead.followUpAt)} />
                    <Row label="Nurture" value={lead.nurtureState} />
                    <Row label="WhatsApp eligible" value={lead.whatsappEligible ? "Yes" : "No"} />
                    <Row label="Opted out" value={lead.optedOut ? "Yes" : "No"} />
                  </dl>
                </section>

                <section className={cn(CARD, "p-5")}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
                    Handoff controls
                  </p>
                  {handoffActive || lead.handoff ? (
                    <div className="mt-3 space-y-3">
                      <p className="text-[14px] font-semibold text-white">
                        {handoffActive ? "Paused for human follow-up" : "Automation resumed"}
                      </p>
                      <p className="text-[13px] leading-relaxed text-slate-400">
                        {lead.handoffReason || "Lead asked to speak with a Joseph Mews advisor."}
                      </p>
                      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        <span className="grid size-8 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-[10px] font-bold uppercase text-slate-200">
                          {nameInitials(lead.assignedRep)}
                        </span>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-500">Owner</p>
                          <p className="text-[13px] font-medium text-white">{lead.assignedRep}</p>
                        </div>
                      </div>
                      {handoffActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            setHandoffActive(false);
                            setResumeNote("Automation resumed (preview only — not persisted).");
                          }}
                          className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-[13px] font-semibold text-white hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                        >
                          <Check className="size-3.5" /> Resume automation
                        </button>
                      ) : (
                        <p className="text-[12px] text-emerald-300">
                          {resumeNote || "Automation is active again."}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-3 text-[13px] text-slate-500">
                      No active handoff. Joe can keep nurturing this lead.
                    </p>
                  )}
                </section>

                <p className="px-1 text-[11px] text-slate-600">{workerName} · preview profile</p>
              </div>
            </div>
          </>
        )}
      </div>
    </WhatsappSalesCockpitShell>
  );
}

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
        <Icon className="size-3.5" />
      </span>
      <h2 className="text-[14px] font-semibold text-white">{title}</h2>
    </div>
  );
}

function StripStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-[7.5rem] flex-1 flex-col justify-center px-4 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 truncate text-[15px] font-semibold tracking-[-0.02em] text-white">{value}</p>
    </div>
  );
}

function Fact({
  label, value, className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5", className)}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-[13px] font-medium text-slate-200">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 text-[13px]">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-200">{value}</dd>
    </div>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", className)}>
      {children}
    </span>
  );
}
