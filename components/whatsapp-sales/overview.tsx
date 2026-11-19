"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CalendarDays, Check, HandHelping, Info, MessageSquare, Percent, Sparkles, X,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, LabelList,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  getMockMetrics, marketBars, MOCK_LEADS, statusBars, weeklyEngagement,
} from "@/components/whatsapp-sales/mocks";
import { listWebinars } from "@/components/whatsapp-sales/webinar-store";
import { OutcomesStrip } from "@/components/cockpit/outcomes-strip";
import {
  formatDisplayDate, interestBadgeClass, statusBadgeClass,
} from "@/components/whatsapp-sales/utils";
const CARD = "card-surface";
const TOOLTIP = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--ink)",
  boxShadow: "var(--shadow-md)",
} as const;
const TICK = { fill: "var(--muted)", fontSize: 11 } as const;

function pipelineBarColor(name: string): string {
  if (name === "High Intent" || name === "Qualified") return "#34d399";
  if (name === "Human Handoff") return "#f87171";
  if (name === "Active" || name === "Contacted") return "#818cf8";
  if (name === "Nurture" || name === "New") return "#22d3ee";
  if (name === "No Response" || name === "Opted Out") return "#94a3b8";
  return "#6366f1";
}

export function WhatsappSalesOverview({
  agentId, workerName,
}: {
  agentId: string;
  workerName: string;
}) {
  const router = useRouter();
  const m = getMockMetrics();
  const webinars = listWebinars();
  const overviewWebinars = webinars.slice(0, 10);
  const [range, setRange] = useState<"7d" | "14d" | "30d">("14d");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dismissedBest, setDismissedBest] = useState(false);

  const go = (path: string) => router.push(`${path}`);

  const needsAttention = useMemo(
    () =>
      MOCK_LEADS.filter(
        (l) => l.handoff || l.status === "Human Handoff" || l.status === "High Intent" || l.interest === "High",
      ),
    [],
  );

  const selected = needsAttention.find((l) => l.id === selectedId) ?? needsAttention[0] ?? null;

  const recentActivity = useMemo(
    () =>
      [...MOCK_LEADS]
        .filter((l) => l.lastContactedAt || l.lastResponseAt)
        .sort((a, b) => {
          const ta = new Date(a.lastResponseAt || a.lastContactedAt || 0).getTime();
          const tb = new Date(b.lastResponseAt || b.lastContactedAt || 0).getTime();
          return tb - ta;
        })
        .slice(0, 6),
    [],
  );

  const bestMove = needsAttention.find((l) => l.handoff || l.status === "High Intent") ?? needsAttention[0] ?? null;

  const engagement = useMemo(() => {
    const all = weeklyEngagement();
    if (range === "7d") return all.slice(-2);
    if (range === "30d") return all;
    return all.slice(-4);
  }, [range]);

  const markets = marketBars();
  const marketTotal = markets.reduce((s, r) => s + r.count, 0);
  const marketTop = markets.reduce((best, row) => (row.count > best.count ? row : best), markets[0]!);
  const pipeline = statusBars();
  const pipelineTotal = pipeline.reduce((s, r) => s + r.count, 0);
  const pipelineTop = pipeline.reduce((best, row) => (row.count > best.count ? row : best), pipeline[0]!);
  const activityHighIntent = engagement.reduce((s, r) => s + r.highIntent, 0);
  const activityResponses = engagement.reduce((s, r) => s + r.responses, 0);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-medium text-subtle">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-ink sm:text-[32px]">
            {greeting}
          </h1>
          <p className="mt-1 max-w-[58ch] text-[14px] text-muted">
            {needsAttention.length} leads need attention · {m.highIntentLeads} high intent ·{" "}
            {m.humanHandoffs} handoffs · {m.upcomingWebinars} upcoming webinars.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] text-ink-3 shadow-sm">
            <span className={cn("size-1.5 rounded-full", m.interaktConnected ? "bg-success" : "bg-warning")} />
            Interakt {m.interaktConnected ? "connected" : "offline"}
          </span>
          <span className="text-[12.5px] text-subtle">
            {m.totalLeads} leads · {workerName}
          </span>
        </div>
      </header>

      {/* PRD §30 agent metrics — Pulse-style insight cards */}
      <OutcomesStrip
        title="Agent performance"
        tiles={[
          { value: String(m.totalLeads), label: "Total leads", tone: "brand", caption: "In lead pool", spark: [40, 48, 52, 60, 72] },
          { value: String(m.newLeads), label: "New leads", tone: "success", trend: "up", caption: "Awaiting outreach", spark: [20, 28, 35, 42, 55] },
          { value: String(m.contactedLeads), label: "Contacted", tone: "brand", caption: "Business-initiated", spark: [30, 45, 40, 58, 62] },
          { value: String(m.activeConversations), label: "Active conversations", tone: "brand", caption: "Live with Joe", spark: [25, 40, 55, 48, 70] },
          { value: `${m.responseRatePct}%`, label: "Response rate", tone: "success", trend: "up", caption: "Of contacted", spark: [50, 55, 62, 68, 71] },
          { value: `${m.noResponsePct}%`, label: "No response", tone: "warning", trend: "down", caption: "Of contacted", spark: [45, 40, 38, 32, 29] },
          { value: String(m.highIntentLeads), label: "High intent", tone: "success", trend: "up", caption: "Ready for rep", spark: [15, 22, 28, 35, 42] },
          { value: String(m.humanHandoffs), label: "Human handoffs", tone: "danger", trend: "down", caption: "Automation paused", spark: [20, 18, 25, 22, 16] },
          { value: String(m.consultationsBooked), label: "Bookings", tone: "success", trend: "up", caption: "Consultations", spark: [10, 18, 22, 30, 38] },
          { value: String(m.upcomingWebinars), label: "Upcoming webinars", tone: "brand", badge: `${m.webinarRelevantLeads} relevant`, caption: "Relevance matched", spark: [35, 42, 48, 55, 60] },
        ]}
      />

      {/* Decisions waiting + best next move */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <section className={cn(CARD, "p-5 sm:p-6")} aria-label="Decisions waiting">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            Decisions waiting on you
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="text-[36px] font-extrabold tracking-[-0.04em] text-ink sm:text-[40px]">
              {needsAttention.length}
            </p>
            <p className="mb-2 text-[14px] text-muted">leads need a human decision</p>
          </div>
          <p className="text-[13px] text-subtle">
            High intent and handoffs first — accept a move or open the lead profile.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-line bg-surface-muted">
            <div className="flex flex-wrap items-stretch divide-x divide-line">
              <button
                type="button"
                onClick={() => go("/leads")}
                className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-well"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-success-soft text-success">
                  <Sparkles className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-success">
                    {m.highIntentLeads}
                  </p>
                  <p className="mt-1 text-[11px] text-subtle">High intent</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => go("/leads")}
                className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-well"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-danger-soft text-danger">
                  <HandHelping className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-danger">
                    {m.humanHandoffs}
                  </p>
                  <p className="mt-1 text-[11px] text-subtle">Handoffs</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => go("/leads")}
                className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-well"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                  <MessageSquare className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-ink">
                    {m.activeConversations}
                  </p>
                  <p className="mt-1 text-[11px] text-subtle">Active chats</p>
                </div>
              </button>
              <div className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3">
                <span className="grid size-8 place-items-center rounded-lg bg-well text-muted">
                  <Percent className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-ink">
                    {m.responseRatePct}%
                  </p>
                  <p className="mt-1 text-[11px] text-subtle">Response rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-line pt-4 text-[12px] text-subtle">
            <span><strong className="text-ink-3">{m.totalLeads}</strong> total leads</span>
            <span><strong className="text-ink-3">{m.newLeads}</strong> new</span>
            <span><strong className="text-ink-3">{m.contactedLeads}</strong> contacted</span>
            <span><strong className="text-ink-3">{m.noResponsePct}%</strong> no response</span>
            <span><strong className="text-ink-3">{m.consultationsBooked}</strong> bookings</span>
            <span><strong className="text-ink-3">{m.webinarRelevantLeads}</strong> webinar-relevant</span>
          </div>
        </section>

        <section className={cn(CARD, "flex flex-col p-5 sm:p-6")} aria-label="Best next move">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            Today&apos;s best next move
          </p>
          {dismissedBest || !bestMove ? (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
              <Sparkles className="size-6 text-brand/60" />
              <p className="mt-2 text-sm font-semibold text-ink">You&apos;re clear for now</p>
              <p className="mt-1 text-[12px] text-subtle">No urgent handoff or high-intent move queued.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 flex-col">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold leading-snug text-ink">
                    {bestMove.firstName} {bestMove.lastName}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {bestMove.conversationSummary}
                  </p>
                  <p className="mt-2 text-[12px] text-subtle">
                    {bestMove.assignedRep} · {bestMove.status} · {bestMove.interest} interest
                  </p>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <button
                  type="button"
                  onClick={() => go(`/leads/${bestMove.id}`)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Accept
                  <ArrowRight className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedBest(true)}
                  className="inline-flex min-h-10 items-center rounded-xl border border-line bg-well px-4 text-[13px] font-semibold text-ink-3 hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartPanel title="Lead engagement" subtitle="Contacted vs responses over the last weeks">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-ink leading-none">
                {m.responseRatePct}%
              </p>
              <p className="mt-1 text-[12px] text-subtle">
                Response rate · {m.contactedLeads} contacted
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-blue" /> Contacted
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-teal-400" /> Responses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyEngagement()} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="jmContacted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="jmResponses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="week" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={TICK} width={28} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP}
                cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="contacted"
                name="Contacted"
                stroke="#818cf8"
                fill="url(#jmContacted)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#0c1018", stroke: "#818cf8", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#818cf8", stroke: "#fff", strokeWidth: 1.5 }}
              />
              <Area
                type="monotone"
                dataKey="responses"
                name="Responses"
                stroke="#2dd4bf"
                fill="url(#jmResponses)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#0c1018", stroke: "#2dd4bf", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#2dd4bf", stroke: "#fff", strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Pipeline by status" subtitle="Where leads sit today">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-ink leading-none">
                {pipelineTotal}
              </p>
              <p className="mt-1 text-[12px] text-subtle">
                In pipeline · top stage {pipelineTop.name} ({pipelineTop.count})
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" /> Intent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-blue" /> Active
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-400" /> Handoff
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pipeline} margin={{ top: 18, right: 8, left: 0, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={TICK}
                angle={-24}
                textAnchor="end"
                height={42}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={TICK} width={28} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" name="Leads" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {pipeline.map((row) => (
                  <Cell key={row.name} fill={pipelineBarColor(row.name)} fillOpacity={0.9} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  fill="#94a3b8"
                  fontSize={10}
                  offset={6}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="WhatsApp activity"
          subtitle="High intent and replies in the selected window"
          actions={
            <div className="flex gap-1 rounded-lg bg-well p-0.5">
              {(["7d", "14d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium",
                    range === r ? "bg-brand text-white" : "text-muted hover:text-ink",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          }
        >
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-ink leading-none">
                {activityResponses}
              </p>
              <p className="mt-1 text-[12px] text-subtle">
                Responses · {activityHighIntent} high intent · {range}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-teal-400" /> High intent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-brand-blue" /> Responses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={engagement} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="jmActivityIntent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="jmActivityResponses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="week" tick={TICK} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={TICK} width={28} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={TOOLTIP}
                cursor={{ stroke: "rgba(255,255,255,0.12)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="responses"
                name="Responses"
                stroke="#818cf8"
                fill="url(#jmActivityResponses)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#0c1018", stroke: "#818cf8", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#818cf8", stroke: "#fff", strokeWidth: 1.5 }}
              />
              <Area
                type="monotone"
                dataKey="highIntent"
                name="High intent"
                stroke="#2dd4bf"
                fill="url(#jmActivityIntent)"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: "#0c1018", stroke: "#2dd4bf", strokeWidth: 2 }}
                activeDot={{ r: 5, fill: "#2dd4bf", stroke: "#fff", strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Market interest"
          subtitle="Where leads lean across UK / UAE"
          actions={
            <span className="group relative inline-flex">
              <button
                type="button"
                className="grid size-7 place-items-center rounded-full border border-line text-muted hover:bg-well hover:text-ink-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
                aria-label="What the market numbers mean"
              >
                <Info className="size-3.5" />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[240px] rounded-xl border border-line bg-surface px-3 py-2.5 text-left text-[12px] leading-relaxed text-ink-3 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Left badge = <strong className="text-ink">share %</strong> of the pool
                (e.g. UAE 32%). Right number = <strong className="text-ink">lead count</strong>
                (e.g. 28 leads). 28 ÷ 88 ≈ 32%.
              </span>
            </span>
          }
        >
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-ink leading-none">
                {marketTop.sharePct}%
              </p>
              <p className="mt-1 text-[12px] text-subtle">
                Lean {marketTop.name} · {marketTotal} leads
              </p>
            </div>
            <p className="text-[11px] text-subtle">
              <span className="text-muted">% share</span>
              <span className="mx-1.5 text-subtle">·</span>
              <span className="text-muted">lead count</span>
            </p>
          </div>

          <div className="flex h-[180px] flex-col justify-center gap-4">
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-well p-0.5">
              {markets.map((row) => (
                <div
                  key={row.name}
                  className="h-full rounded-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${row.sharePct}%`, background: row.color }}
                  title={`${row.name}: ${row.count} leads (${row.sharePct}% share)`}
                />
              ))}
            </div>

            <ul className="space-y-2.5">
              {markets.map((row) => (
                <li key={row.name} className="flex items-center gap-3">
                  <span
                    className="grid h-8 min-w-8 shrink-0 place-items-center rounded-lg px-1.5 text-[11px] font-bold tabular-nums"
                    style={{ background: `${row.color}22`, color: row.color }}
                    title={`${row.sharePct}% of pool`}
                  >
                    {row.sharePct}%
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between gap-2">
                      <span className="text-[13px] font-medium text-ink-2">{row.name}</span>
                      <span className="tabular-nums text-[12px] text-muted">
                        <strong className="font-semibold text-ink">{row.count}</strong>
                        <span className="ml-1.5 text-subtle">leads</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-well">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.sharePct}%`, background: row.color }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ChartPanel>
      </div>

      {/* Webinar board + live feed */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <section className={cn(CARD, "overflow-hidden")} aria-label="Upcoming webinars">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Upcoming relevant webinars</h2>
              <p className="text-[12.5px] text-subtle">
                {webinars.length > 10
                  ? `Showing 10 of ${webinars.length} · ${m.webinarRelevantLeads} relevant leads`
                  : `${m.upcomingWebinars} events · ${m.webinarRelevantLeads} relevant leads`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => go("/webinars")}
              className="group inline-flex items-center gap-1 text-[12px] font-semibold text-brand-ink underline-offset-4 hover:text-brand-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              Open webinars
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {overviewWebinars.length === 0 ? (
              <p className="col-span-full px-2 py-10 text-center text-sm text-subtle">No webinars yet.</p>
            ) : (
              overviewWebinars.map((w, i) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => go(`/webinars/${w.id}`)}
                  className="group relative overflow-hidden rounded-xl border border-line bg-surface-muted p-4 text-left transition-colors hover:border-indigo-500/35 hover:bg-well"
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-30 blur-2xl"
                    style={{ background: i % 2 === 0 ? "#6366f1" : "#22d3ee" }}
                  />
                  <div className="relative flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand-ink">
                      <CalendarDays className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-ink group-hover:text-brand-ink">
                        {w.title}
                      </span>
                      <span className="mt-1 block text-[12px] text-subtle">
                        {w.investmentMarket} · {w.eventDate} · {w.eventTime}
                      </span>
                      <span className="mt-2 inline-flex gap-2 text-[11px] text-muted">
                        <span className="rounded-md bg-well px-1.5 py-0.5">{w.relevantLeadIds.length} relevant</span>
                        <span className="rounded-md bg-well px-1.5 py-0.5">{w.outreachMode}</span>
                      </span>
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className={cn(CARD, "overflow-hidden")} aria-label="Recent lead activity">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[15px] font-semibold text-ink">Recently captured</h2>
            <p className="mt-0.5 text-[12.5px] text-subtle">Live activity from Joe conversations</p>
          </div>
          <ul className="divide-y divide-line">
            {recentActivity.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => go(`/leads/${l.id}`)}
                  className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/40"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-well text-[10px] font-bold text-ink-3">
                    {l.firstName[0]}{l.lastName[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">
                      {l.firstName} {l.lastName}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-[12px] text-subtle">
                      {l.conversationSummary}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-subtle">
                    {formatDisplayDate(l.lastResponseAt || l.lastContactedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Insights master-detail */}
      <section aria-label="Leads that need attention" className="scroll-mt-4">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-ink">Leads that need attention</h2>
            <p className="mt-0.5 text-[13px] text-subtle">
              Human handoff and high intent — status, rep, and conversation summary.
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("/leads")}
            className="group inline-flex items-center gap-1 text-[12px] font-semibold text-brand-ink underline-offset-4 hover:text-brand-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            Open leads
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {needsAttention.length === 0 ? (
          <div className={cn(CARD, "px-6 py-16 text-center text-sm text-subtle")}>
            Nothing needs attention right now.
          </div>
        ) : (
          <div className={cn(CARD, "grid overflow-hidden lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.2fr)_minmax(220px,0.85fr)]")}>
            <ul className="divide-y divide-line border-b border-line lg:border-b-0 lg:border-r">
              {needsAttention.map((l) => {
                const active = selected?.id === l.id;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(l.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors",
                        active ? "bg-brand-soft" : "hover:bg-well",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13.5px] font-semibold text-ink">
                          {l.firstName} {l.lastName}
                        </span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", statusBadgeClass(l.status))}>
                          {l.handoff ? "Handoff" : l.status}
                        </span>
                      </span>
                      <span className="line-clamp-1 text-[12px] text-subtle">{l.conversationSummary}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {selected && (
              <>
                <div className="border-b border-line p-5 lg:border-b-0 lg:border-r">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Evidence</p>
                  <h3 className="mt-2 text-[16px] font-semibold text-ink">
                    {selected.firstName} {selected.lastName}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{selected.summary}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Evidence label="Interest" value={selected.interest} />
                    <Evidence label="Readiness" value={selected.readiness} />
                    <Evidence label="Assigned rep" value={selected.assignedRep} />
                    <Evidence label="Last response" value={formatDisplayDate(selected.lastResponseAt)} />
                    <Evidence label="Stage" value={selected.conversationStage} />
                    <Evidence label="Source" value={selected.sourceWebinar || selected.leadSource} />
                  </div>
                  <p className="mt-4 text-[12px] text-subtle">
                    Qualification {selected.qualificationProgress}% · Outreach: {selected.outreachStatus}
                  </p>
                </div>

                <div className="flex flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">Action recommended</p>
                  <p className="mt-2 text-[14px] font-semibold text-ink">
                    {selected.handoff
                      ? "Review handoff and resume or keep with the rep"
                      : "Open profile and push toward consultation"}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">
                    {selected.conversationSummary}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", interestBadgeClass(selected.interest))}>
                      {selected.interest}
                    </span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px]", statusBadgeClass(selected.status))}>
                      {selected.status}
                    </span>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    <button
                      type="button"
                      onClick={() => go(`/leads/${selected.id}`)}
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-strong"
                    >
                      <Check className="size-3.5" /> Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const idx = needsAttention.findIndex((l) => l.id === selected.id);
                        const next = needsAttention[idx + 1] ?? needsAttention[0];
                        setSelectedId(next?.id ?? null);
                      }}
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-line bg-well px-4 text-[13px] font-semibold text-ink-3 hover:bg-well"
                    >
                      <X className="size-3.5" /> Skip
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { title: "Leads", body: "Filter the pool and open profiles.", path: "/leads", icon: MessageSquare },
          { title: "Webinars", body: "Relevance, outreach mode, engagement.", path: "/webinars", icon: CalendarDays },
          { title: "Data", body: "Upload sheets and review validation.", path: "/data", icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={() => go(item.path)}
              className={cn(CARD, "group flex items-start gap-3 p-4 text-left transition-colors hover:border-brand/30")}
            >
              <span className="grid size-9 place-items-center rounded-lg bg-brand-soft text-brand-ink">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-ink">{item.title}</span>
                  <ArrowRight className="size-4 text-slate-600 transition-colors group-hover:text-brand-ink" />
                </span>
                <span className="mt-1 block text-[12px] text-subtle">{item.body}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChartPanel({
  title, subtitle, meta, actions, children,
}: {
  title: string;
  subtitle?: string;
  meta?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(CARD, "p-5")}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {subtitle && <p className="text-[12px] text-subtle">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {meta && <span className="text-[12px] font-semibold text-muted">{meta}</span>}
          {actions}
        </div>
      </div>
      {children}
    </section>
  );
}

function Evidence({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-muted px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-medium text-ink-2">{value}</p>
    </div>
  );
}
