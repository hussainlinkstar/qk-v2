"use client";

import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  HandHelping,
  MessageSquare,
  Percent,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type OutcomeTone = "brand" | "success" | "warning" | "danger" | "neutral";

export type OutcomeTile = {
  value: string;
  label: string;
  caption?: string;
  badge?: string;
  trend?: "up" | "down" | "neutral";
  icon?: LucideIcon;
  tone?: OutcomeTone;
  /** Tiny spark bars, 0–100 */
  spark?: number[];
  onClick?: () => void;
};

const TONE: Record<OutcomeTone, { icon: string; bar: string }> = {
  brand: { icon: "bg-brand-soft text-brand", bar: "bg-brand" },
  success: { icon: "bg-success-soft text-success", bar: "bg-success" },
  warning: { icon: "bg-warning-soft text-warning", bar: "bg-warning" },
  danger: { icon: "bg-danger-soft text-danger", bar: "bg-danger" },
  neutral: { icon: "bg-well text-muted", bar: "bg-subtle" },
};

const DEFAULT_ICONS: LucideIcon[] = [
  Users, UserPlus, MessageSquare, MessageSquare, Percent,
  Percent, Sparkles, HandHelping, CheckCircle2, CalendarDays,
];

function SparkBars({ values, barClass, compact }: { values: number[]; barClass: string; compact?: boolean }) {
  return (
    <div className={cn("flex items-end gap-0.5", compact ? "h-6" : "h-8")} aria-hidden>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn("rounded-sm opacity-80", compact ? "w-1" : "w-1.5", barClass)}
          style={{ height: `${Math.max(18, Math.min(100, v))}%` }}
        />
      ))}
    </div>
  );
}

export function OutcomesStrip({
  title,
  tiles,
  variant = "default",
}: {
  title: string;
  tiles: OutcomeTile[];
  /** Compact = page-top strip (4 cards, less height, less clutter) */
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";

  return (
    <section aria-label={title} className="space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
        Insights · {title}
      </p>
      <div
        className={cn(
          "grid gap-3",
          compact
            ? "grid-cols-2 lg:grid-cols-4"
            : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
        )}
      >
        {tiles.map((t, index) => {
          const tone = t.tone ?? (t.trend === "up" ? "success" : t.trend === "down" ? "danger" : "brand");
          const styles = TONE[tone];
          const Icon = t.icon ?? DEFAULT_ICONS[index % DEFAULT_ICONS.length]!;
          const spark = t.spark ?? [
            35 + ((index * 17) % 40),
            45 + ((index * 11) % 35),
            30 + ((index * 23) % 45),
            55 + ((index * 7) % 30),
            40 + ((index * 13) % 50),
          ];

          const className = cn(
            "group relative flex w-full flex-col rounded-[14px] border border-line bg-surface text-left shadow-[var(--shadow-sm)]",
            "transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-ring hover:shadow-[var(--shadow-md)]",
            compact ? "min-h-[96px] p-3" : "min-h-[118px] p-3.5",
          );

          const body = (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-medium leading-snug text-muted">{t.label}</p>
                <span className={cn("grid shrink-0 place-items-center rounded-lg", compact ? "size-7" : "size-8", styles.icon)}>
                  <Icon className={compact ? "size-3" : "size-3.5"} />
                </span>
              </div>

              <div className="mt-auto flex items-end justify-between gap-2 pt-2.5">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "font-bold tracking-[-0.03em] text-ink leading-none",
                      compact ? "text-[1.35rem]" : "text-[1.55rem]",
                    )}
                  >
                    {t.value}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {t.caption && (
                      <p
                        className={cn(
                          "flex items-center gap-0.5 text-[11px] font-medium",
                          t.trend === "down" ? "text-danger" : t.trend === "up" ? "text-success" : "text-subtle",
                        )}
                      >
                        {t.trend === "up" && <ArrowUp className="size-3" />}
                        {t.trend === "down" && <ArrowDown className="size-3" />}
                        {t.caption}
                      </p>
                    )}
                    {t.badge && (
                      <span className="rounded-full border border-line bg-well px-1.5 py-px text-[10px] font-medium text-subtle">
                        {t.badge}
                      </span>
                    )}
                  </div>
                </div>
                <SparkBars values={spark} barClass={styles.bar} compact={compact} />
              </div>
            </>
          );

          if (t.onClick) {
            return (
              <button key={t.label} type="button" onClick={t.onClick} className={className}>
                {body}
              </button>
            );
          }

          return (
            <article key={t.label} className={className}>
              {body}
            </article>
          );
        })}
      </div>
    </section>
  );
}
