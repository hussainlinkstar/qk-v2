"use client";

import { useRef } from "react";
import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTROL_BASE } from "@/lib/ui";

/** Hide native indicator but keep it stretched so the whole field opens the picker. */
const NATIVE_PICKER_HIT =
  "cursor-pointer " +
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
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-ink-3">{label}</span>
      <div className="relative">
        <input
          ref={ref}
          type="date"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => openPicker(ref.current)}
          className={cn(CONTROL_BASE, NATIVE_PICKER_HIT, "relative px-3 py-2.5 pr-9")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open date picker"
          onClick={() => openPicker(ref.current)}
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
        >
          <Calendar className="size-4" />
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
  value: string;
  onChange: (hhmm: string) => void;
  className?: string;
  timezone?: string;
  compact?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-ink-3">
        {label}
        {!compact && <span className="ml-1 font-normal text-subtle">· {timezone}</span>}
      </span>
      <div className="relative">
        <input
          ref={ref}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => openPicker(ref.current)}
          className={cn(CONTROL_BASE, NATIVE_PICKER_HIT, "relative px-3 py-2.5 pr-9")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label="Open time picker"
          onClick={() => openPicker(ref.current)}
          className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted hover:text-ink"
        >
          <Clock className="size-4" />
        </button>
      </div>
    </label>
  );
}
