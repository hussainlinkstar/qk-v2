"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONTROL_BASE } from "@/lib/ui";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL_BASE, "px-3 py-2.5", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL_BASE, "resize-y px-3 py-2.5 leading-relaxed", className)} {...props} />;
}

export function Select({
  className, wrapperClassName, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        className={cn(
          CONTROL_BASE,
          "appearance-none px-3 py-2.5 pr-9 [&>option]:bg-surface [&>option]:text-ink",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
    </div>
  );
}

export function Switch({
  checked, onCheckedChange, label, className, disabled, ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "aria-label" | "aria-checked" | "type"> & {
  checked: boolean;
  onCheckedChange?: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onCheckedChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border p-0 transition-colors " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas " +
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "border-brand bg-brand" : "border-line-strong bg-well",
        className,
      )}
      {...props}
    >
      <span className={cn(
        "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-1 ring-black/10 transition-transform duration-200",
        checked ? "translate-x-[18px]" : "translate-x-0.5",
      )} />
    </button>
  );
}
