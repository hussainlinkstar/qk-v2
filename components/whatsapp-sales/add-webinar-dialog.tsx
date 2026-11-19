"use client";

import { useMemo, useState } from "react";
import { CalendarDays, MapPin, MessageSquare } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/cockpit/controls";
import {
  DatePickerField, TimePickerField, formatEventTime,
} from "@/components/whatsapp-sales/date-time-fields";
import { MOCK_LEADS } from "@/components/whatsapp-sales/mocks";
import { upsertWebinar } from "@/components/whatsapp-sales/webinar-store";
import type { OutreachMode, WhatsappSalesWebinar } from "@/components/whatsapp-sales/types";
import { cn } from "@/lib/utils";

const TEMPLATES = [
  "Webinar Registration / Invitation",
  "Webinar Reminder",
  "Webinar Follow-up",
];

export function AddWebinarDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (webinar: WhatsappSalesWebinar) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [investmentMarket, setInvestmentMarket] = useState("UK");
  const [locations, setLocations] = useState("Birmingham, Leeds");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("18:00");
  const [webinarLink, setWebinarLink] = useState("");
  const [approvedTemplate, setApprovedTemplate] = useState(TEMPLATES[0]!);
  const [outreachMode, setOutreachMode] = useState<OutreachMode>("Manual");
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(false);
  const [autoTriggerTiming, setAutoTriggerTiming] = useState("2 days before event");
  const [error, setError] = useState("");

  const matchPreview = useMemo(() => {
    const relevantLocations = locations.split(",").map((s) => s.trim()).filter(Boolean);
    const market = investmentMarket.trim().toUpperCase();
    const matched = MOCK_LEADS.filter((l) => {
      if (market && l.marketInterest.toUpperCase() === market) return true;
      return relevantLocations.some((loc) =>
        l.locationInterest.toLowerCase().includes(loc.toLowerCase()),
      );
    });
    const eligible = matched.filter((l) => l.whatsappEligible && !l.optedOut).length;
    return { matched: matched.length, eligible };
  }, [investmentMarket, locations]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setInvestmentMarket("UK");
    setLocations("Birmingham, Leeds");
    setEventDate("");
    setEventTime("18:00");
    setWebinarLink("");
    setApprovedTemplate(TEMPLATES[0]!);
    setOutreachMode("Manual");
    setAutoTriggerEnabled(false);
    setAutoTriggerTiming("2 days before event");
    setError("");
  };

  const save = () => {
    if (!title.trim() || !eventDate.trim()) {
      setError("Title and event date are required.");
      return;
    }
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

    const created = upsertWebinar({
      title: title.trim(),
      description: description.trim(),
      investmentMarket: investmentMarket.trim() || "UK",
      relevantLocations,
      eventDate,
      eventTime: formatEventTime(eventTime) || "TBC",
      webinarLink: webinarLink.trim(),
      approvedTemplate: approvedTemplate.trim(),
      outreachMode,
      autoTriggerEnabled: outreachMode === "Automatic" ? autoTriggerEnabled : false,
      autoTriggerTiming: outreachMode === "Automatic" ? autoTriggerTiming.trim() : "",
      relevantLeadIds,
    });
    reset();
    onOpenChange(false);
    onCreated(created);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="gap-0 overflow-hidden border-line bg-surface p-0 text-ink sm:max-w-xl">
        <DialogHeader className="space-y-1 border-b border-line px-5 py-4 pr-12 text-left">
          <DialogTitle className="text-[17px] font-semibold tracking-tight text-ink">
            Add webinar
          </DialogTitle>
          <DialogDescription className="text-[13px] text-muted">
            Store event context so Joe can match relevant leads and handle outreach replies.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,640px)] space-y-5 overflow-y-auto px-5 py-5">
          {/* Basics */}
          <section className="space-y-3.5">
            <SectionLabel>Basics</SectionLabel>
            <FieldLabel label="Title" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to Invest in UK Property"
              />
            </FieldLabel>
            <FieldLabel label="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short context Joe can use when leads reply…"
                className="min-h-[88px]"
              />
            </FieldLabel>
          </section>

          {/* Targeting */}
          <section className="space-y-3.5">
            <SectionLabel>Matching</SectionLabel>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <FieldLabel label="Investment market">
                <Input
                  value={investmentMarket}
                  onChange={(e) => setInvestmentMarket(e.target.value)}
                  placeholder="UK"
                />
              </FieldLabel>
              <FieldLabel label="Relevant locations" hint="Comma-separated">
                <Input
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  placeholder="Birmingham, Leeds"
                />
              </FieldLabel>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-muted px-3.5 py-2.5 text-[12.5px] text-muted">
              <MapPin className="size-3.5 shrink-0 text-brand" />
              <span>
                <strong className="font-semibold text-ink">{matchPreview.matched}</strong> relevant ·{" "}
                <strong className="font-semibold text-success">{matchPreview.eligible}</strong> WhatsApp eligible
              </span>
            </div>
          </section>

          {/* Schedule */}
          <section className="space-y-3.5">
            <SectionLabel>Schedule & delivery</SectionLabel>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <DatePickerField label="Event date *" value={eventDate} onChange={setEventDate} required />
              <TimePickerField label="Event time" value={eventTime} onChange={setEventTime} />
            </div>
            <FieldLabel label="Webinar link">
              <Input
                value={webinarLink}
                onChange={(e) => setWebinarLink(e.target.value)}
                placeholder="https://"
              />
            </FieldLabel>
            <FieldLabel label="Approved WhatsApp template">
              <select
                value={approvedTemplate}
                onChange={(e) => setApprovedTemplate(e.target.value)}
                className="w-full rounded-[10px] border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
              >
                {TEMPLATES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FieldLabel>
          </section>

          {/* Outreach */}
          <section className="space-y-3">
            <SectionLabel>Outreach</SectionLabel>
            <div className="rounded-xl border border-line bg-surface-muted p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[13px] text-ink-2">
                  <MessageSquare className="size-3.5 text-brand" />
                  How should outreach start?
                </div>
                <div className="flex rounded-lg border border-line bg-surface p-0.5">
                  {(["Manual", "Automatic"] as OutreachMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setOutreachMode(mode)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                        outreachMode === mode
                          ? "bg-brand text-white shadow-sm"
                          : "text-muted hover:text-ink",
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2.5 text-[12px] leading-relaxed text-subtle">
                {outreachMode === "Manual"
                  ? "You’ll review eligible leads on the webinar detail page, then Send / Initiate."
                  : "Qiko can auto-trigger using the timing below once enabled."}
              </p>
              {outreachMode === "Automatic" && (
                <div className="mt-3 space-y-2.5 border-t border-line pt-3">
                  <label className="flex items-center gap-2 text-[13px] text-ink-2">
                    <input
                      type="checkbox"
                      checked={autoTriggerEnabled}
                      onChange={(e) => setAutoTriggerEnabled(e.target.checked)}
                      className="size-3.5 rounded border-line"
                    />
                    Enable automatic trigger
                  </label>
                  <FieldLabel label="Trigger timing">
                    <Input
                      value={autoTriggerTiming}
                      onChange={(e) => setAutoTriggerTiming(e.target.value)}
                      placeholder="e.g. 2 days before event"
                    />
                  </FieldLabel>
                </div>
              )}
            </div>
          </section>

          {error && (
            <p className="rounded-lg bg-danger-soft px-3 py-2 text-[13px] text-danger" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-muted/60 px-5 py-3.5">
          <p className="inline-flex items-center gap-1.5 text-[12px] text-subtle">
            <CalendarDays className="size-3.5" />
            Required: title + date
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="rounded-[10px] px-3.5 py-2 text-[13px] font-medium text-muted hover:bg-well hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-[10px] bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-strong"
            >
              Save webinar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
      {children}
    </p>
  );
}

function FieldLabel({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
        {label}
        {required && <span className="text-danger">*</span>}
        {hint && <span className="font-normal text-subtle">· {hint}</span>}
      </span>
      {children}
    </label>
  );
}
