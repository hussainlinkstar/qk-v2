"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/cockpit/controls";
import { OutcomesStrip } from "@/components/cockpit/outcomes-strip";
import { WhatsappSalesCockpitShell } from "@/components/whatsapp-sales/cockpit-shell";
import {
  DatePickerField, TimePickerField, formatEventTime, parseEventTime,
} from "@/components/whatsapp-sales/date-time-fields";
import { MOCK_LEADS } from "@/components/whatsapp-sales/mocks";
import { useWhatsappSalesWorkerName } from "@/components/whatsapp-sales/use-worker-name";
import { getWebinar, listWebinars, subscribeWebinars, upsertWebinar } from "@/components/whatsapp-sales/webinar-store";
import type { OutreachMode } from "@/components/whatsapp-sales/types";
import { interestBadgeClass, statusBadgeClass } from "@/components/whatsapp-sales/utils";

export default function WhatsappSalesWebinarDetailPage() {
  const { webinarId } = useParams<{ webinarId: string }>();
  const { agentId, workerName } = useWhatsappSalesWorkerName();
  const router = useRouter();
  useSyncExternalStore(subscribeWebinars, listWebinars, listWebinars);
  const webinar = getWebinar(webinarId);
  const [editing, setEditing] = useState(false);
  const [manualStep, setManualStep] = useState<"idle" | "review" | "done">("idle");
  const [confirmNote, setConfirmNote] = useState("");

  const relevantLeads = useMemo(() => {
    if (!webinar) return [];
    return MOCK_LEADS.filter((l) => webinar.relevantLeadIds.includes(l.id));
  }, [webinar]);

  const eligible = relevantLeads.filter((l) => l.whatsappEligible && !l.optedOut);
  const noConsent = relevantLeads.filter((l) => !l.whatsappEligible && !l.optedOut);
  const optedOut = relevantLeads.filter((l) => l.optedOut);

  if (!webinar) {
    return (
      <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="webinars">
        <div className="space-y-4">
          <button type="button" onClick={() => router.push(`/webinars`)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="size-4" /> Back to webinars
          </button>
          <div className="rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center text-sm text-slate-500">
            Webinar not found.
          </div>
        </div>
      </WhatsappSalesCockpitShell>
    );
  }

  const responseRate = webinar.contactedCount
    ? Math.round((webinar.responseCount / webinar.contactedCount) * 100)
    : 0;
  const noResponsePct = webinar.contactedCount
    ? Math.round(((webinar.contactedCount - webinar.responseCount) / webinar.contactedCount) * 100)
    : 0;

  return (
    <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="webinars">
      <div className="space-y-6">
        <button type="button" onClick={() => router.push(`/webinars`)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="size-4" /> Back to webinars
        </button>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-white">{webinar.title}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {webinar.investmentMarket} · {webinar.eventDate} · {webinar.eventTime}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-300">
                {webinar.outreachMode}
              </span>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/[0.04]"
              >
                {editing ? "Close editor" : "Edit"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-6 text-slate-300">{webinar.description}</p>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-[13px] sm:grid-cols-2">
            <div><dt className="text-slate-500">Locations</dt><dd className="text-slate-200">{webinar.relevantLocations.join(", ") || "—"}</dd></div>
            <div><dt className="text-slate-500">Link</dt><dd className="truncate text-slate-200">{webinar.webinarLink || "—"}</dd></div>
            <div><dt className="text-slate-500">Template</dt><dd className="text-slate-200">{webinar.approvedTemplate}</dd></div>
            <div>
              <dt className="text-slate-500">Auto trigger</dt>
              <dd className="text-slate-200">
                {webinar.outreachMode === "Automatic"
                  ? (webinar.autoTriggerEnabled ? webinar.autoTriggerTiming || "Enabled" : "Disabled")
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>

        {editing && (
          <EditWebinarForm webinar={webinar} onSaved={() => setEditing(false)} />
        )}

        <OutcomesStrip
          title="SUMMARY"
          tiles={[
            { value: String(MOCK_LEADS.length), label: "Total pool", trend: "neutral" },
            { value: String(relevantLeads.length), label: "Relevant", trend: "neutral" },
            { value: String(eligible.length), label: "WhatsApp Eligible", trend: "up" },
            { value: String(noConsent.length), label: "Excluded – No Consent", trend: "down" },
            { value: String(optedOut.length), label: "Excluded – Opted Out", trend: "down" },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Outreach status</h3>
            <dl className="mt-3 space-y-2 text-[13px]">
              <Row label="Mode" value={webinar.outreachMode} />
              <Row
                label="Trigger status"
                value={
                  webinar.outreachMode === "Automatic"
                    ? (webinar.autoTriggerEnabled ? `Scheduled · ${webinar.autoTriggerTiming}` : "Off")
                    : manualStep === "done"
                      ? "Initiated (preview)"
                      : "Awaiting Send / Initiate"
                }
              />
              <Row label="Contacted leads" value={String(webinar.contactedCount)} />
            </dl>
            {webinar.outreachMode === "Manual" && (
              <div className="mt-4 space-y-2">
                {manualStep === "idle" && (
                  <button
                    type="button"
                    onClick={() => setManualStep("review")}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
                  >
                    <Send className="size-3.5" /> Send / Initiate
                  </button>
                )}
                {manualStep === "review" && (
                  <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] p-3">
                    <p className="text-[13px] text-slate-200">
                      Review {eligible.length} WhatsApp-eligible relevant leads, then confirm.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setManualStep("idle")}
                        className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualStep("done");
                          setConfirmNote(`Preview outreach queued for ${eligible.length} leads.`);
                        }}
                        className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-400"
                      >
                        Confirm send
                      </button>
                    </div>
                  </div>
                )}
                {manualStep === "done" && (
                  <p className="text-[12px] text-emerald-300">{confirmNote}</p>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Engagement</h3>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
              <Row label="Relevant" value={String(relevantLeads.length)} />
              <Row label="Contacted" value={String(webinar.contactedCount)} />
              <Row label="Delivered" value={String(webinar.deliveredCount)} />
              <Row label="Failed" value={String(webinar.failedCount)} />
              <Row label="Responses" value={String(webinar.responseCount)} />
              <Row label="Response rate" value={`${responseRate}%`} />
              <Row label="No response %" value={`${noResponsePct}%`} />
              <Row label="High-intent generated" value={String(webinar.highIntentGenerated)} />
              <Row label="Handoffs" value={String(webinar.humanHandoffs)} />
              <Row label="Meetings / bookings" value={String(webinar.meetingsBooked)} />
            </dl>
          </section>
        </div>

        <section className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <h3 className="text-[13px] font-semibold text-white">Relevant leads</h3>
            <p className="text-[12px] text-slate-500">
              Match reason, WhatsApp eligibility, and exclusion reason.
            </p>
          </div>
          {relevantLeads.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">No matching leads in mock data.</p>
          ) : (
            <ul className="divide-y divide-white/[0.05]">
              {relevantLeads.map((l) => {
                const why = [
                  l.marketInterest === webinar.investmentMarket ? `Market ${l.marketInterest}` : null,
                  webinar.relevantLocations.find((loc) =>
                    l.locationInterest.toLowerCase().includes(loc.toLowerCase()),
                  )
                    ? `Location ${l.locationInterest}`
                    : null,
                ].filter(Boolean).join(" · ") || "Profile match";
                const excluded = l.optedOut ? "Opted out" : !l.whatsappEligible ? "No consent" : null;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => router.push(`/leads/${l.id}`)}
                      className="flex w-full flex-col gap-2 px-4 py-3 text-left hover:bg-white/[0.02] sm:flex-row sm:items-center"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-white">{l.firstName} {l.lastName}</span>
                        <span className="block text-[12px] text-slate-500">
                          {why} · {l.budget || "Budget TBC"} · {l.investmentExperience || "Experience unknown"}
                        </span>
                      </span>
                      <span className="flex flex-wrap gap-1.5">
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", interestBadgeClass(l.interest))}>{l.interest}</span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", statusBadgeClass(l.status))}>{l.status}</span>
                        {excluded ? (
                          <span className="rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">{excluded}</span>
                        ) : (
                          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">Eligible</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </WhatsappSalesCockpitShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium text-slate-200">{value}</dd>
    </div>
  );
}

function EditWebinarForm({
  webinar,
  onSaved,
}: {
  webinar: NonNullable<ReturnType<typeof getWebinar>>;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(webinar.title);
  const [description, setDescription] = useState(webinar.description);
  const [investmentMarket, setInvestmentMarket] = useState(webinar.investmentMarket);
  const [locations, setLocations] = useState(webinar.relevantLocations.join(", "));
  const [eventDate, setEventDate] = useState(webinar.eventDate);
  const [eventTime, setEventTime] = useState(parseEventTime(webinar.eventTime) || "18:00");
  const [webinarLink, setWebinarLink] = useState(webinar.webinarLink);
  const [approvedTemplate, setApprovedTemplate] = useState(webinar.approvedTemplate);
  const [outreachMode, setOutreachMode] = useState<OutreachMode>(webinar.outreachMode);
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(webinar.autoTriggerEnabled);
  const [autoTriggerTiming, setAutoTriggerTiming] = useState(webinar.autoTriggerTiming || "2 days before event");

  return (
    <div className="space-y-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-5">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-indigo-300">Edit webinar</p>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <Textarea className="min-h-20" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input value={investmentMarket} onChange={(e) => setInvestmentMarket(e.target.value)} placeholder="Market" />
        <Input value={locations} onChange={(e) => setLocations(e.target.value)} placeholder="Locations" />
        <DatePickerField label="Event date" value={eventDate} onChange={setEventDate} />
        <TimePickerField label="Event time" value={eventTime} onChange={setEventTime} />
      </div>
      <Input value={webinarLink} onChange={(e) => setWebinarLink(e.target.value)} placeholder="Link" />
      <Input value={approvedTemplate} onChange={(e) => setApprovedTemplate(e.target.value)} placeholder="Template" />
      <div className="flex gap-2">
        {(["Manual", "Automatic"] as OutreachMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setOutreachMode(mode)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium",
              outreachMode === mode
                ? "border-indigo-500/50 bg-indigo-500/20 text-white"
                : "border-white/10 text-slate-400",
            )}
          >
            {mode}
          </button>
        ))}
      </div>
      {outreachMode === "Automatic" && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[12px] text-slate-300">
            <input
              type="checkbox"
              checked={autoTriggerEnabled}
              onChange={(e) => setAutoTriggerEnabled(e.target.checked)}
              className="size-3.5"
            />
            Enable automatic trigger
          </label>
          <Input value={autoTriggerTiming} onChange={(e) => setAutoTriggerTiming(e.target.value)} placeholder="Trigger timing" />
        </div>
      )}
      <button
        type="button"
        className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-400"
        onClick={() => {
          const relevantLocations = locations.split(",").map((s) => s.trim()).filter(Boolean);
          const market = investmentMarket.trim().toUpperCase();
          const relevantLeadIds = MOCK_LEADS
            .filter((l) => {
              if (l.marketInterest.toUpperCase() === market) return true;
              return relevantLocations.some((loc) =>
                l.locationInterest.toLowerCase().includes(loc.toLowerCase()),
              );
            })
            .map((l) => l.id);
          upsertWebinar({
            id: webinar.id,
            title: title.trim(),
            description: description.trim(),
            investmentMarket: investmentMarket.trim(),
            relevantLocations,
            eventDate,
            eventTime: formatEventTime(eventTime) || webinar.eventTime,
            webinarLink,
            approvedTemplate,
            outreachMode,
            autoTriggerEnabled: outreachMode === "Automatic" ? autoTriggerEnabled : false,
            autoTriggerTiming: outreachMode === "Automatic" ? autoTriggerTiming : "",
            relevantLeadIds,
          });
          onSaved();
        }}
      >
        Save changes
      </button>
    </div>
  );
}
