"use client";

import { Suspense, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, MessageSquare, Percent, Plus, Search, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { OutcomesStrip } from "@/components/cockpit/outcomes-strip";
import { AddWebinarDialog } from "@/components/whatsapp-sales/add-webinar-dialog";
import { WhatsappSalesCockpitShell } from "@/components/whatsapp-sales/cockpit-shell";
import { FilterSelect } from "@/components/whatsapp-sales/filter-select";
import { MOCK_LEADS } from "@/components/whatsapp-sales/mocks";
import { useWhatsappSalesWorkerName } from "@/components/whatsapp-sales/use-worker-name";
import { listWebinars, subscribeWebinars } from "@/components/whatsapp-sales/webinar-store";
import type { OutreachMode } from "@/components/whatsapp-sales/types";

const CARD = "card-surface";
const PAGE_SIZE = 10;

export default function WhatsappSalesWebinarsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-subtle">
          Loading webinars…
        </div>
      }
    >
      <WhatsappSalesWebinarsPageInner />
    </Suspense>
  );
}

function WhatsappSalesWebinarsPageInner() {
  const { agentId, workerName } = useWhatsappSalesWorkerName();
  const router = useRouter();
  const searchParams = useSearchParams();
  const webinars = useSyncExternalStore(subscribeWebinars, listWebinars, listWebinars);
  const [addOpen, setAddOpen] = useState(false);
  const [q, setQ] = useState("");
  const [market, setMarket] = useState("all");
  const [location, setLocation] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [mode, setMode] = useState<"all" | OutreachMode>("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (searchParams.get("new") === "1") setAddOpen(true);
  }, [searchParams]);

  useEffect(() => {
    setPage(0);
  }, [q, market, location, dateFilter, mode]);

  const markets = useMemo(
    () => Array.from(new Set(webinars.map((w) => w.investmentMarket).filter(Boolean))).sort(),
    [webinars],
  );
  const locations = useMemo(
    () => Array.from(new Set(webinars.flatMap((w) => w.relevantLocations))).sort(),
    [webinars],
  );
  const dates = useMemo(
    () => Array.from(new Set(webinars.map((w) => w.eventDate))).sort(),
    [webinars],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return webinars.filter((w) => {
      if (market !== "all" && w.investmentMarket !== market) return false;
      if (location !== "all" && !w.relevantLocations.includes(location)) return false;
      if (dateFilter !== "all" && w.eventDate !== dateFilter) return false;
      if (mode !== "all" && w.outreachMode !== mode) return false;
      if (!needle) return true;
      const hay = `${w.title} ${w.description} ${w.investmentMarket} ${w.relevantLocations.join(" ")}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [webinars, market, location, dateFilter, mode, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rangeStart = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min(filtered.length, (safePage + 1) * PAGE_SIZE);
  const pageItems = useMemo(
    () => filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [filtered, safePage],
  );

  const totalRelevant = new Set(webinars.flatMap((w) => w.relevantLeadIds)).size;
  const eligible = MOCK_LEADS.filter((l) => l.whatsappEligible && !l.optedOut).length;
  const manualCount = webinars.filter((w) => w.outreachMode === "Manual").length;
  const autoCount = webinars.filter((w) => w.outreachMode === "Automatic").length;
  const avgResponse = webinars.length
    ? Math.round(
      webinars.reduce((s, w) => s + (w.contactedCount ? (w.responseCount / w.contactedCount) * 100 : 0), 0)
        / webinars.length,
    )
    : 0;

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (q.trim()) list.push({ key: "q", label: `Search: ${q.trim()}`, clear: () => setQ("") });
    if (market !== "all") list.push({ key: "market", label: market, clear: () => setMarket("all") });
    if (location !== "all") list.push({ key: "location", label: location, clear: () => setLocation("all") });
    if (dateFilter !== "all") list.push({ key: "date", label: dateFilter, clear: () => setDateFilter("all") });
    if (mode !== "all") list.push({ key: "mode", label: mode, clear: () => setMode("all") });
    return list;
  }, [q, market, location, dateFilter, mode]);

  const clearAll = () => {
    setQ("");
    setMarket("all");
    setLocation("all");
    setDateFilter("all");
    setMode("all");
  };

  const openWebinar = (id: string) => router.push(`/webinars/${id}`);

  return (
    <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="webinars">
      <div className="flex w-full flex-col gap-5">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-ink">Webinars</h1>
              <p className="mt-1 max-w-[56ch] text-[14px] text-muted">
                Upcoming events, relevance matching, and Manual / Automatic outreach.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[12.5px] text-subtle">
                {filtered.length === 0
                  ? `0 showing · ${workerName}`
                  : `${rangeStart}–${rangeEnd} of ${filtered.length} · ${workerName}`}
              </p>
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Plus className="size-3.5" /> Add webinar
              </button>
            </div>
          </div>

          <OutcomesStrip
            variant="compact"
            title="Webinar outreach"
            tiles={[
              {
                value: String(webinars.length),
                label: "Upcoming",
                tone: "brand",
                icon: CalendarDays,
                caption: "Events in scope",
                spark: [35, 42, 48, 55, 62],
              },
              {
                value: String(totalRelevant),
                label: "Relevant leads",
                tone: "brand",
                icon: Users,
                caption: "Matched attributes",
                spark: [40, 45, 50, 58, 65],
              },
              {
                value: String(eligible),
                label: "WhatsApp eligible",
                tone: "success",
                trend: "up",
                icon: MessageSquare,
                caption: "Pool-wide",
                spark: [45, 50, 55, 60, 68],
              },
              {
                value: `${avgResponse}%`,
                label: "Avg response",
                tone: "success",
                icon: Percent,
                caption: "Across webinars",
                spark: [30, 38, 45, 52, 58],
              },
            ]}
          />

          <div className="flex flex-wrap gap-1.5">
            {([
              { label: "All", value: "all" as const },
              { label: `Manual (${manualCount})`, value: "Manual" as const },
              { label: `Automatic (${autoCount})`, value: "Automatic" as const },
            ]).map((pill) => {
              const on = mode === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => setMode(pill.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                    on
                      ? "bg-brand text-white"
                      : "border border-line bg-well text-muted hover:bg-well hover:text-ink",
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </header>

        <section className={cn(CARD, "p-4 sm:p-5")}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="relative min-w-0 flex-1">
              <span className="mb-1.5 block text-[11px] text-subtle">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Title, market, location…"
                  className="h-10 w-full rounded-xl border border-line bg-well pl-10 pr-3 text-sm text-ink-2 placeholder:text-subtle outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/30"
                />
              </span>
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[min(560px,55%)]">
              <FilterSelect value={market} onChange={setMarket} label="Market" options={["all", ...markets]} />
              <FilterSelect value={location} onChange={setLocation} label="Location" options={["all", ...locations]} />
              <FilterSelect value={dateFilter} onChange={setDateFilter} label="Date" options={["all", ...dates]} />
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-1 rounded-full border border-brand/25 bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand-ink hover:bg-brand-soft"
                >
                  {chip.label}
                  <X className="size-3 opacity-70" />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="ml-1 text-[11px] font-semibold text-subtle hover:text-ink">
                Clear all
              </button>
            </div>
          )}
        </section>

        {filtered.length === 0 ? (
          <div className={cn(CARD, "flex flex-col items-center px-6 py-16 text-center")}>
            <span className="grid size-12 place-items-center rounded-2xl bg-well text-subtle">
              <CalendarDays className="size-5" />
            </span>
            <p className="mt-4 text-[15px] font-semibold text-ink">
              {webinars.length === 0 ? "No webinars yet" : "No webinars match"}
            </p>
            <p className="mt-1 max-w-[36ch] text-[13px] text-subtle">
              {webinars.length === 0
                ? "Add upcoming webinar context for relevance matching and outreach."
                : "Try clearing filters or searching a different title, market, or date."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {webinars.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded-xl border border-line bg-well px-4 py-2 text-[13px] font-semibold text-ink-3 hover:bg-well"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className="rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-strong"
              >
                Add webinar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={cn(CARD, "hidden overflow-hidden md:block")}>
              <div className="overflow-x-auto">
                <table className="min-w-[960px] w-full text-left text-[13px]">
                  <thead className="sticky top-0 z-10 border-b border-line bg-surface-muted text-[11px] uppercase tracking-wider text-subtle">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Title</th>
                      <th className="px-4 py-3.5 font-semibold">Market / locations</th>
                      <th className="px-4 py-3.5 font-semibold">Date / time</th>
                      <th className="px-4 py-3.5 font-semibold">Relevant</th>
                      <th className="px-4 py-3.5 font-semibold">Contacted</th>
                      <th className="px-4 py-3.5 font-semibold">Response rate</th>
                      <th className="px-4 py-3.5 font-semibold">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {pageItems.map((w) => {
                      const rate = w.contactedCount
                        ? Math.round((w.responseCount / w.contactedCount) * 100)
                        : 0;
                      return (
                        <tr
                          key={w.id}
                          tabIndex={0}
                          role="link"
                          onClick={() => openWebinar(w.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openWebinar(w.id);
                            }
                          }}
                          className="cursor-pointer transition-colors hover:bg-well focus-visible:bg-brand-soft focus-visible:outline-none"
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                                <CalendarDays className="size-3.5" />
                              </span>
                              <span className="min-w-0">
                                <span className="block font-semibold text-ink">{w.title}</span>
                                <span className="block truncate text-[12px] text-subtle line-clamp-1">
                                  {w.description}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-ink-3">
                            {w.investmentMarket}
                            <span className="block text-[12px] text-subtle">
                              {w.relevantLocations.join(", ") || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-ink-3">
                            {w.eventDate}
                            <span className="block text-[12px] text-subtle">{w.eventTime}</span>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-ink">{w.relevantLeadIds.length}</td>
                          <td className="px-4 py-3.5 text-ink-3">{w.contactedCount}</td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              "font-medium",
                              rate >= 50 ? "text-success" : rate > 0 ? "text-warning" : "text-muted",
                            )}>
                              {rate}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              w.outreachMode === "Automatic"
                                ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                                : "border-line bg-well text-muted",
                            )}>
                              {w.outreachMode}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <ul className="space-y-2 md:hidden">
              {pageItems.map((w) => {
                const rate = w.contactedCount
                  ? Math.round((w.responseCount / w.contactedCount) * 100)
                  : 0;
                return (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => openWebinar(w.id)}
                      className={cn(CARD, "flex w-full flex-col gap-3 p-4 text-left transition-colors hover:border-brand/30")}
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                          <CalendarDays className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-semibold text-ink">{w.title}</span>
                          <span className="mt-0.5 block text-[12px] text-subtle">
                            {w.investmentMarket} · {w.eventDate} · {w.eventTime}
                          </span>
                        </span>
                        <span className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          w.outreachMode === "Automatic"
                            ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                            : "border-line bg-well text-muted",
                        )}>
                          {w.outreachMode}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-[12px] text-subtle">{w.description}</p>
                      <div className="flex flex-wrap gap-3 text-[12px] text-muted">
                        <span><strong className="text-ink">{w.relevantLeadIds.length}</strong> relevant</span>
                        <span><strong className="text-ink">{w.contactedCount}</strong> contacted</span>
                        <span><strong className="text-ink">{rate}%</strong> response</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {filtered.length > 0 && (
              <div className={cn(CARD, "flex flex-wrap items-center justify-between gap-3 px-4 py-3")}>
                <p className="text-[12px] text-subtle" aria-live="polite">
                  Showing {rangeStart}–{rangeEnd} of {filtered.length}
                </p>
                {pageCount > 1 ? (
                  <nav className="flex items-center gap-1" aria-label="Webinar pages">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={safePage === 0}
                      aria-label="Previous page"
                      className="grid size-8 place-items-center rounded-lg border border-line bg-well text-ink-3 hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => {
                      const active = i === safePage;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setPage(i)}
                          aria-label={`Page ${i + 1}`}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "grid size-8 place-items-center rounded-lg text-[12px] font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                            active
                              ? "bg-brand text-white"
                              : "border border-line bg-well text-ink-3 hover:bg-well",
                          )}
                        >
                          {i + 1}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                      disabled={safePage >= pageCount - 1}
                      aria-label="Next page"
                      className="grid size-8 place-items-center rounded-lg border border-line bg-well text-ink-3 hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-40"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                  </nav>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>

      <AddWebinarDialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open && searchParams.get("new") === "1") {
            router.replace(`/webinars`);
          }
        }}
        onCreated={(w) => router.push(`/webinars/${w.id}`)}
      />
    </WhatsappSalesCockpitShell>
  );
}
