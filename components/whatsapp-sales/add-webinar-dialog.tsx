"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/cockpit/controls";
import {
  DatePickerField, TimePickerField, formatEventTime,
} from "@/components/whatsapp-sales/date-time-fields";
import { MOCK_LEADS } from "@/components/whatsapp-sales/mocks";
import { upsertWebinar } from "@/components/whatsapp-sales/webinar-store";
import type { OutreachMode, WhatsappSalesWebinar } from "@/components/whatsapp-sales/types";
import { cn } from "@/lib/utils";

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
  const [approvedTemplate, setApprovedTemplate] = useState("Webinar Registration / Invitation");
  const [outreachMode, setOutreachMode] = useState<OutreachMode>("Manual");
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(false);
  const [autoTriggerTiming, setAutoTriggerTiming] = useState("2 days before event");
  const [error, setError] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setInvestmentMarket("UK");
    setLocations("Birmingham, Leeds");
    setEventDate("");
    setEventTime("18:00");
    setWebinarLink("");
    setApprovedTemplate("Webinar Registration / Invitation");
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
      <DialogContent
        className="gap-3 overflow-hidden border-white/[0.08] p-4 text-white sm:max-w-3xl"
        style={{ background: "#0c1018" }}
      >
        <DialogHeader className="gap-0.5 space-y-0 pr-6">
          <DialogTitle className="text-[15px] text-white">Add webinar</DialogTitle>
          <DialogDescription className="text-[11px] text-slate-500">
            Context for relevance matching · Manual or Automatic outreach
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-6">
          <Field label="Title *" value={title} onChange={setTitle} className="sm:col-span-3" />
          <Field label="Description" value={description} onChange={setDescription} className="sm:col-span-3" />

          <Field label="Market" value={investmentMarket} onChange={setInvestmentMarket} className="sm:col-span-2" />
          <Field
            label="Locations"
            value={locations}
            onChange={setLocations}
            hint="Comma-separated"
            className="sm:col-span-2"
          />
          <DatePickerField label="Event date *" value={eventDate} onChange={setEventDate} required className="sm:col-span-1" />
          <TimePickerField label="Time" value={eventTime} onChange={setEventTime} compact className="sm:col-span-1" />

          <Field label="Webinar link" value={webinarLink} onChange={setWebinarLink} className="sm:col-span-3" />
          <Field label="WhatsApp template" value={approvedTemplate} onChange={setApprovedTemplate} className="sm:col-span-3" />

          <div className="sm:col-span-6 flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">Outreach</span>
              <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
                {(["Manual", "Automatic"] as OutreachMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setOutreachMode(mode)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
                      outreachMode === mode
                        ? "bg-indigo-500 text-white"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {outreachMode === "Manual" ? (
                <span className="text-[11px] text-slate-500">Send/Initiate on detail page</span>
              ) : (
                <label className="flex items-center gap-1.5 text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoTriggerEnabled}
                    onChange={(e) => setAutoTriggerEnabled(e.target.checked)}
                    className="size-3 rounded border-white/20"
                  />
                  Auto trigger
                </label>
              )}
            </div>
            {outreachMode === "Automatic" && (
              <input
                value={autoTriggerTiming}
                onChange={(e) => setAutoTriggerTiming(e.target.value)}
                placeholder="Timing e.g. 2 days before"
                aria-label="Trigger timing"
                className="h-8 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-[12px] text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 sm:max-w-[240px]"
              />
            )}
          </div>
        </div>

        {error && <p className="text-[12px] text-red-300">{error}</p>}

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
          <p className="text-[11px] text-slate-600">* Required</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              className="rounded-xl px-3 py-2 text-[12px] font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              className="rounded-xl bg-indigo-500 px-4 py-2 text-[12px] font-semibold text-white hover:bg-indigo-400"
            >
              Save webinar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label, value, onChange, hint, className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block text-[11px] text-slate-400", className)}>
      {label}
      {hint ? <span className="ml-1 text-slate-600">({hint})</span> : null}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-8 rounded-lg py-1 text-[12.5px]"
      />
    </label>
  );
}
