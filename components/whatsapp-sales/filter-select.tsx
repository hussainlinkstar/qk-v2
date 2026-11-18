"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dark-theme dropdown (not native select) for Windows Chrome readability. */
export function FilterSelect({
  value, onChange, label, options, className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const display = value === "all" ? `All ${label.toLowerCase()}` : value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative flex min-w-[140px] flex-col gap-1 text-[11px] text-slate-500", className)}>
      <span>{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-left text-sm text-slate-200",
          "hover:bg-white/[0.05] focus-visible:border-indigo-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          open && "border-indigo-500/60 ring-2 ring-indigo-500",
        )}
      >
        <span className="truncate">{display}</span>
        <ChevronDown className={cn("size-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 max-h-56 overflow-auto rounded-lg border border-white/10 bg-[#0b0e16] py-1 shadow-xl shadow-black/50"
        >
          {options.map((o) => {
            const text = o === "all" ? `All ${label.toLowerCase()}` : o;
            const selected = o === value;
            return (
              <li key={o} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full px-3 py-2 text-left text-sm transition-colors",
                    selected ? "bg-indigo-500 text-white" : "text-slate-200 hover:bg-white/[0.06]",
                  )}
                >
                  {text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
