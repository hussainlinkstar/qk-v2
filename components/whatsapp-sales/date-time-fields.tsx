"use client";

import { useRef } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTROL =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] text-[13px] text-slate-200 " +
  "placeholder:text-slate-500 transition-colors " +
  "focus-visible:border-indigo-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

/** Hide native indicator but keep it stretched so the whole field opens the picker. */
const NATIVE_PICKER_HIT =
  "[color-scheme:dark] cursor-pointer " +
  "[&::-webkit-calendar-picker-indicator]:absolute " +
  "[&::-webkit-calendar-picker-indicator]:inset-0 " +
  "[&::-webkit-calendar-picker-indicator]:h-full " +
  "[&::-webkit-calendar-picker-indicator]:w-full " +
  "[&::-webkit-calendar-picker-indicator]:cursor-pointer " +
  "[&::-webkit-calendar-picker-indicator]:opacity-0";

export function parseEventTime(raw: string): string {
  const m = raw.trim().match(/^(\d{1,2}:\d{2})/);
  if (!m) return "";
  const [h, min] = m[1]!.split(":");
  return `${h!.padStart(2, "0")}:${min}`;
}

export function formatEventTime(hhmm: string, tz = "GMT+1"): string {
  const t = parseEventTime(hhmm);
  return t ? `${t} ${tz}` : "";
}

function openPicker(input: HTMLInputElement | null) {
  if (!input) return;
  try {
    input.showPicker();
  } catch {
    input.focus();
    input.click();
  }
}

export function DatePickerField({
  label,
  value,
  onChange,
  className,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  required?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className={cn("block text-[11px] text-slate-400", className)}>
      {label}
      <div className="relative mt-1">
        <input
          ref={ref}
          type="date"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => openPicker(ref.current)}
          className={cn(CONTROL, NATIVE_PICKER_HIT, "relative h-9 px-3 py-1.5 pr-9")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open date picker"
          onClick={() => openPicker(ref.current)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-white"
        >
          <Calendar className="size-3.5" />
        </button>
      </div>
    </label>
  );
}

export function TimePickerField({
  label,
  value,
  onChange,
  className,
  timezone = "GMT+1",
  compact,
}: {
  label: string;
  /** HH:mm value for the native time input */
  value: string;
  onChange: (hhmm: string) => void;
  className?: string;
  timezone?: string;
  /** Hide the timezone hint (use in dense modals). */
  compact?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className={cn("block text-[11px] text-slate-400", className)}>
      {label}{compact ? ` · ${timezone}` : ""}
      <div className="relative mt-1">
        <input
          ref={ref}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => openPicker(ref.current)}
          className={cn(CONTROL, NATIVE_PICKER_HIT, "relative h-9 px-3 py-1.5 pr-9")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open time picker"
          onClick={() => openPicker(ref.current)}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-white"
        >
          <Clock className="size-3.5" />
        </button>
      </div>
      {!compact && (
        <span className="mt-0.5 block text-[10px] text-slate-600">Stored as local time · {timezone}</span>
      )}
    </label>
  );
}
