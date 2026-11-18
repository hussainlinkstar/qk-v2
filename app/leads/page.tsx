"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, ChevronDown, Search, SlidersHorizontal, Sparkles, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsappSalesCockpitShell } from "@/components/whatsapp-sales/cockpit-shell";
import { FilterSelect } from "@/components/whatsapp-sales/filter-select";
import { MOCK_LEADS } from "@/components/whatsapp-sales/mocks";
import { useWhatsappSalesWorkerName } from "@/components/whatsapp-sales/use-worker-name";
import {
  formatDisplayDate, interestBadgeClass, statusBadgeClass,
} from "@/components/whatsapp-sales/utils";

const CARD = "rounded-2xl border border-white/[0.07] bg-[#0c1018]";

const ALL_STATUSES = [
  "New", "Not Contacted", "Contacted", "Active Conversation", "Qualified",
  "Nurture", "High Intent", "Human Handoff", "No Response", "Closed", "Opted Out",
];

type Filters = {
  q: string;
  market: string;
  location: string;
  experience: string;
  intent: string;
  readiness: string;
  status: string;
  rep: string;
  source: string;
  webinar: string;
};

const EMPTY: Filters = {
  q: "",
  market: "all",
  location: "all",
  experience: "all",
  intent: "all",
  readiness: "all",
  status: "all",
  rep: "all",
  source: "all",
  webinar: "all",
};

export default function WhatsappSalesLeadsPage() {
  const { agentId, workerName } = useWhatsappSalesWorkerName();
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [moreOpen, setMoreOpen] = useState(false);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const markets = useMemo(() => uniq(MOCK_LEADS.map((l) => l.marketInterest)), []);
  const locations = useMemo(() => uniq(MOCK_LEADS.map((l) => l.locationInterest)), []);
  const experiences = useMemo(() => uniq(MOCK_LEADS.map((l) => l.investmentExperience)), []);
  const reps = useMemo(() => uniq(MOCK_LEADS.map((l) => l.assignedRep)), []);
  const sources = useMemo(() => uniq(MOCK_LEADS.map((l) => l.leadSource)), []);
  const webinars = useMemo(() => uniq(MOCK_LEADS.map((l) => l.sourceWebinar ?? "")), []);

  const highInterest = MOCK_LEADS.filter((l) => l.interest === "High").length;
  const needHuman = MOCK_LEADS.filter((l) => l.handoff).length;
  const active = MOCK_LEADS.filter((l) => l.status === "Active Conversation").length;

  const filtered = useMemo(() => {
    const needle = filters.q.trim().toLowerCase();
    return MOCK_LEADS.filter((l) => {
      if (filters.market !== "all" && l.marketInterest !== filters.market) return false;
      if (filters.location !== "all" && l.locationInterest !== filters.location) return false;
      if (filters.experience !== "all" && l.investmentExperience !== filters.experience) return false;
      if (filters.intent !== "all" && l.interest !== filters.intent) return false;
      if (filters.readiness !== "all" && l.readiness !== filters.readiness) return false;
      if (filters.status !== "all" && l.status !== filters.status) return false;
      if (filters.rep !== "all" && l.assignedRep !== filters.rep) return false;
      if (filters.source !== "all" && l.leadSource !== filters.source) return false;
      if (filters.webinar !== "all" && (l.sourceWebinar || "") !== filters.webinar) return false;
      if (!needle) return true;
      const hay = `${l.firstName} ${l.lastName} ${l.email} ${l.phone} ${l.assignedRep} ${l.leadSource} ${l.sourceWebinar ?? ""}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [filters]);

  const activeChips = useMemo(() => {
    const chips: { key: keyof Filters; label: string }[] = [];
    if (filters.q.trim()) chips.push({ key: "q", label: `Search: ${filters.q.trim()}` });
    if (filters.market !== "all") chips.push({ key: "market", label: filters.market });
    if (filters.location !== "all") chips.push({ key: "location", label: filters.location });
    if (filters.experience !== "all") chips.push({ key: "experience", label: filters.experience });
    if (filters.intent !== "all") chips.push({ key: "intent", label: `Intent: ${filters.intent}` });
    if (filters.readiness !== "all") chips.push({ key: "readiness", label: filters.readiness });
    if (filters.status !== "all") chips.push({ key: "status", label: filters.status });
    if (filters.rep !== "all") chips.push({ key: "rep", label: filters.rep });
    if (filters.source !== "all") chips.push({ key: "source", label: filters.source });
    if (filters.webinar !== "all") chips.push({ key: "webinar", label: filters.webinar });
    return chips;
  }, [filters]);

  const clearChip = (key: keyof Filters) => {
    set(key, key === "q" ? "" : "all");
  };

  const openLead = (id: string) => router.push(`/leads/${id}`);

  return (
    <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="leads">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
        {/* Header + compact stats (no empty metric boxes) */}
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-white">Leads</h1>
              <p className="mt-1 max-w-[56ch] text-[14px] text-slate-400">
                Search and filter the pool, then open a profile for qualification and handoff context.
              </p>
            </div>
            <p className="text-[12.5px] text-slate-500">{workerName}</p>
          </div>

          <div className={cn(CARD, "flex flex-wrap items-stretch divide-x divide-white/[0.06]")}>
            <div className="flex min-w-[7.5rem] flex-1 items-center gap-2.5 px-4 py-3">
              <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400">
                <Users className="size-3.5" />
              </span>
              <div>
                <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-white">
                  {MOCK_LEADS.length}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">In pool</p>
              </div>
            </div>
            <div className="flex min-w-[7.5rem] flex-1 items-center gap-2.5 px-4 py-3">
              <div>
                <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-white">
                  {filtered.length}
                  <span className="ml-1.5 text-[11px] font-medium text-slate-500">
                    {activeChips.length ? "filtered" : "all"}
                  </span>
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Showing</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => set("intent", filters.intent === "High" ? "all" : "High")}
              className={cn(
                "flex min-w-[7.5rem] flex-1 items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
                filters.intent === "High" && "bg-emerald-500/10",
              )}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                <Sparkles className="size-3.5" />
              </span>
              <div>
                <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-emerald-300">
                  {highInterest}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">High interest</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => set("status", filters.status === "Human Handoff" ? "all" : "Human Handoff")}
              className={cn(
                "flex min-w-[7.5rem] flex-1 items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
                filters.status === "Human Handoff" && "bg-red-500/10",
              )}
            >
              <span className="grid size-8 place-items-center rounded-lg bg-red-500/15 text-red-300">
                <AlertTriangle className="size-3.5" />
              </span>
              <div>
                <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-red-300">
                  {needHuman}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Need human</p>
              </div>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "All", value: "all" },
              { label: "High intent", value: "High Intent" },
              { label: "Active", value: "Active Conversation" },
              { label: "Handoff", value: "Human Handoff" },
              { label: "No response", value: "No Response" },
              { label: "Not contacted", value: "Not Contacted" },
            ].map((pill) => {
              const on = filters.status === pill.value;
              return (
                <button
                  key={pill.value}
                  type="button"
                  onClick={() => set("status", pill.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50",
                    on
                      ? "bg-indigo-500 text-white"
                      : "border border-white/[0.08] bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white",
                  )}
                >
                  {pill.label}
                  {pill.value === "Active Conversation" && (
                    <span className="ml-1.5 opacity-70">{active}</span>
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* Filters */}
        <section className={cn(CARD, "p-4 sm:p-5")}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <label className="relative min-w-0 flex-1">
              <span className="mb-1.5 block text-[11px] text-slate-500">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={filters.q}
                  onChange={(e) => set("q", e.target.value)}
                  placeholder="Name, phone, email, source…"
                  className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                />
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[min(520px,48%)]">
              <FilterSelect value={filters.intent} onChange={(v) => set("intent", v)} label="Interest" options={["all", "High", "Medium", "Low", "Unknown"]} />
              <FilterSelect value={filters.market} onChange={(v) => set("market", v)} label="Market" options={["all", ...markets]} />
              <FilterSelect value={filters.rep} onChange={(v) => set("rep", v)} label="Assigned rep" options={["all", ...reps]} />
            </div>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              aria-expanded={moreOpen}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-[12px] font-semibold transition-colors",
                moreOpen
                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                  : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]",
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              More filters
              <ChevronDown className={cn("size-3.5 transition-transform", moreOpen && "rotate-180")} />
            </button>
          </div>

          {moreOpen && (
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3 md:grid-cols-3 xl:grid-cols-5">
              <FilterSelect value={filters.location} onChange={(v) => set("location", v)} label="Location" options={["all", ...locations]} />
              <FilterSelect value={filters.experience} onChange={(v) => set("experience", v)} label="Experience" options={["all", ...experiences]} />
              <FilterSelect value={filters.readiness} onChange={(v) => set("readiness", v)} label="Readiness" options={["all", "Immediate", "Near Term", "Future", "Unknown"]} />
              <FilterSelect value={filters.status} onChange={(v) => set("status", v)} label="Status" options={["all", ...ALL_STATUSES]} />
              <FilterSelect value={filters.source} onChange={(v) => set("source", v)} label="Lead source" options={["all", ...sources]} />
              <FilterSelect value={filters.webinar} onChange={(v) => set("webinar", v)} label="Webinar" options={["all", ...webinars]} />
            </div>
          )}

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/[0.06] pt-3">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => clearChip(chip.key)}
                  className="inline-flex items-center gap-1 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-200 hover:bg-indigo-500/20"
                >
                  {chip.label}
                  <X className="size-3 opacity-70" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilters(EMPTY)}
                className="ml-1 text-[11px] font-semibold text-slate-500 hover:text-white"
              >
                Clear all
              </button>
            </div>
          )}
        </section>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className={cn(CARD, "flex flex-col items-center px-6 py-16 text-center")}>
            <span className="grid size-12 place-items-center rounded-2xl bg-white/[0.04] text-slate-500">
              <Users className="size-5" />
            </span>
            <p className="mt-4 text-[15px] font-semibold text-white">No leads match</p>
            <p className="mt-1 max-w-[36ch] text-[13px] text-slate-500">
              Try clearing filters or searching by a different name, phone, or source.
            </p>
            <button
              type="button"
              onClick={() => setFilters(EMPTY)}
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2 text-[13px] font-semibold text-white hover:bg-indigo-400"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className={cn(CARD, "hidden overflow-hidden md:block")}>
              <div className="overflow-x-auto">
                <table className="min-w-[1080px] w-full text-left text-[13px]">
                  <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0e131c] text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Lead</th>
                      <th className="px-4 py-3.5 font-semibold">Market</th>
                      <th className="px-4 py-3.5 font-semibold">Budget</th>
                      <th className="px-4 py-3.5 font-semibold">Intent</th>
                      <th className="px-4 py-3.5 font-semibold">Status</th>
                      <th className="px-4 py-3.5 font-semibold">Last interaction</th>
                      <th className="px-4 py-3.5 font-semibold">Source / webinar</th>
                      <th className="px-4 py-3.5 font-semibold">Rep</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filtered.map((l) => (
                      <tr
                        key={l.id}
                        tabIndex={0}
                        role="link"
                        onClick={() => openLead(l.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openLead(l.id);
                          }
                        }}
                        className="cursor-pointer transition-colors hover:bg-white/[0.03] focus-visible:bg-indigo-500/10 focus-visible:outline-none"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <CircleAvatar
                              label={`${l.firstName} ${l.lastName}`}
                              initials={`${l.firstName[0] ?? ""}${l.lastName[0] ?? ""}`}
                              tone="indigo"
                            />
                            <span className="min-w-0">
                              <span className="block font-semibold text-white">
                                {l.firstName} {l.lastName}
                              </span>
                              <span className="block truncate text-[12px] text-slate-500">{l.phone}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">{l.marketInterest || "—"}</td>
                        <td className="px-4 py-3.5 text-slate-300">{l.budget || "—"}</td>
                        <td className="px-4 py-3.5">
                          <Badge className={interestBadgeClass(l.interest)}>{l.interest}</Badge>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge className={statusBadgeClass(l.status)}>{l.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {formatDisplayDate(l.lastResponseAt || l.lastContactedAt)}
                        </td>
                        <td className="max-w-[180px] truncate px-4 py-3.5 text-slate-400">
                          {l.sourceWebinar || l.leadSource}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <CircleAvatar
                              label={l.assignedRep}
                              initials={nameInitials(l.assignedRep)}
                              tone="slate"
                              size="sm"
                            />
                            <span className="truncate text-slate-300">{l.assignedRep}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ul className="space-y-2 md:hidden">
              {filtered.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => openLead(l.id)}
                    className={cn(CARD, "flex w-full flex-col gap-3 p-4 text-left transition-colors hover:border-indigo-500/30")}
                  >
                    <div className="flex items-start gap-3">
                      <CircleAvatar
                        label={`${l.firstName} ${l.lastName}`}
                        initials={`${l.firstName[0] ?? ""}${l.lastName[0] ?? ""}`}
                        tone="indigo"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[14px] font-semibold text-white">
                          {l.firstName} {l.lastName}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-slate-500">{l.phone}</span>
                      </span>
                      <Badge className={interestBadgeClass(l.interest)}>{l.interest}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge className={statusBadgeClass(l.status)}>{l.status}</Badge>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-slate-400">
                        {l.marketInterest || "—"} · {l.budget || "Budget TBC"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[12px] text-slate-500">{l.conversationSummary}</p>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500">
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <CircleAvatar
                          label={l.assignedRep}
                          initials={nameInitials(l.assignedRep)}
                          tone="slate"
                          size="sm"
                        />
                        <span className="truncate">{l.assignedRep}</span>
                      </span>
                      <span className="shrink-0">{formatDisplayDate(l.lastResponseAt || l.lastContactedAt)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </WhatsappSalesCockpitShell>
  );
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function nameInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function CircleAvatar({
  label,
  initials,
  tone = "indigo",
  size = "md",
}: {
  label: string;
  initials: string;
  tone?: "indigo" | "slate";
  size?: "sm" | "md";
}) {
  return (
    <span
      title={label}
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border font-bold uppercase tracking-wide",
        size === "sm" ? "size-7 text-[10px]" : "size-9 text-[11px]",
        tone === "indigo"
          ? "border-indigo-400/25 bg-indigo-500/20 text-indigo-100"
          : "border-white/10 bg-white/[0.08] text-slate-200",
      )}
    >
      {initials}
    </span>
  );
}

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium", className)}>
      {children}
    </span>
  );
}
