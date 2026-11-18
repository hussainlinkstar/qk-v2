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
import {
  formatDisplayDate, interestBadgeClass, statusBadgeClass,
} from "@/components/whatsapp-sales/utils";
const CARD = "rounded-2xl border border-white/[0.07] bg-[#0c1018]";
const TOOLTIP = {
  background: "#0f1220",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  fontSize: 12,
  color: "#e2e8f0",
} as const;
const TICK = { fill: "#64748b", fontSize: 11 } as const;

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

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-white">Overview</h1>
          <p className="mt-1 max-w-[56ch] text-[14px] text-slate-400">
            Lead pool, Joe engagement, webinar relevance, and handoffs — insight to next move.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12px] text-slate-300">
            <span className={cn("size-1.5 rounded-full", m.interaktConnected ? "bg-emerald-400" : "bg-amber-400")} />
            Interakt {m.interaktConnected ? "connected" : "offline"}
          </span>
          <span className="text-[12.5px] text-slate-500">
            {m.totalLeads} leads · {m.upcomingWebinars} webinars · {workerName}
          </span>
        </div>
      </header>

      {/* Decisions waiting + best next move */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <section className={cn(CARD, "p-5 sm:p-6")} aria-label="Decisions waiting">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Decisions waiting on you
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="text-[36px] font-extrabold tracking-[-0.04em] text-white sm:text-[40px]">
              {needsAttention.length}
            </p>
            <p className="mb-2 text-[14px] text-slate-400">leads need a human decision</p>
          </div>
          <p className="text-[13px] text-slate-500">
            High intent and handoffs first — accept a move or open the lead profile.
          </p>

          <div className="mt-5 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex flex-wrap items-stretch divide-x divide-white/[0.06]">
              <button
                type="button"
                onClick={() => go("/leads")}
                className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
                  <Sparkles className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-emerald-300">
                    {m.highIntentLeads}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">High intent</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => go("/leads")}
                className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-red-500/15 text-red-300">
                  <HandHelping className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-red-300">
                    {m.humanHandoffs}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Handoffs</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => go("/leads")}
                className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03]"
              >
                <span className="grid size-8 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                  <MessageSquare className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-white">
                    {m.activeConversations}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Active chats</p>
                </div>
              </button>
              <div className="flex min-w-[7rem] flex-1 items-center gap-2.5 px-3.5 py-3">
                <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05] text-slate-400">
                  <Percent className="size-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-bold leading-none tracking-[-0.02em] text-white">
                    {m.responseRatePct}%
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">Response rate</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 border-t border-white/[0.06] pt-4 text-[12px] text-slate-500">
            <span><strong className="text-slate-300">{m.totalLeads}</strong> total leads</span>
            <span><strong className="text-slate-300">{m.newLeads}</strong> new</span>
            <span><strong className="text-slate-300">{m.contactedLeads}</strong> contacted</span>
            <span><strong className="text-slate-300">{m.noResponsePct}%</strong> no response</span>
            <span><strong className="text-slate-300">{m.consultationsBooked}</strong> bookings</span>
            <span><strong className="text-slate-300">{m.webinarRelevantLeads}</strong> webinar-relevant</span>
          </div>
        </section>

        <section className={cn(CARD, "flex flex-col p-5 sm:p-6")} aria-label="Best next move">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
            Today&apos;s best next move
          </p>
          {dismissedBest || !bestMove ? (
            <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
              <Sparkles className="size-6 text-indigo-400/60" />
              <p className="mt-2 text-sm font-semibold text-white">You&apos;re clear for now</p>
              <p className="mt-1 text-[12px] text-slate-500">No urgent handoff or high-intent move queued.</p>
            </div>
          ) : (
            <div className="mt-3 flex flex-1 flex-col">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                  <Sparkles className="size-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold leading-snug text-white">
                    {bestMove.firstName} {bestMove.lastName}
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-400">
                    {bestMove.conversationSummary}
                  </p>
                  <p className="mt-2 text-[12px] text-slate-500">
                    {bestMove.assignedRep} · {bestMove.status} · {bestMove.interest} interest
                  </p>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <button
                  type="button"
                  onClick={() => go(`/leads/${bestMove.id}`)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-[13px] font-semibold text-white hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                >
                  Accept
                  <ArrowRight className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDismissedBest(true)}
                  className="inline-flex min-h-10 items-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[13px] font-semibold text-slate-300 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
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
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-white leading-none">
                {m.responseRatePct}%
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Response rate · {m.contactedLeads} contacted
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-indigo-400" /> Contacted
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
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-white leading-none">
                {pipelineTotal}
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                In pipeline · top stage {pipelineTop.name} ({pipelineTop.count})
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" /> Intent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-indigo-400" /> Active
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
            <div className="flex gap-1 rounded-lg bg-white/[0.04] p-0.5">
              {(["7d", "14d", "30d"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium",
                    range === r ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white",
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
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-white leading-none">
                {activityResponses}
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Responses · {activityHighIntent} high intent · {range}
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-teal-400" /> High intent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-indigo-400" /> Responses
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
                className="grid size-7 place-items-center rounded-full border border-white/10 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
                aria-label="What the market numbers mean"
              >
                <Info className="size-3.5" />
              </button>
              <span
                role="tooltip"
                className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-[240px] rounded-xl border border-white/10 bg-[#0f1220] px-3 py-2.5 text-left text-[12px] leading-relaxed text-slate-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              >
                Left badge = <strong className="text-white">share %</strong> of the pool
                (e.g. UAE 32%). Right number = <strong className="text-white">lead count</strong>
                (e.g. 28 leads). 28 ÷ 88 ≈ 32%.
              </span>
            </span>
          }
        >
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[28px] font-extrabold tracking-[-0.04em] text-white leading-none">
                {marketTop.sharePct}%
              </p>
              <p className="mt-1 text-[12px] text-slate-500">
                Lean {marketTop.name} · {marketTotal} leads
              </p>
            </div>
            <p className="text-[11px] text-slate-500">
              <span className="text-slate-400">% share</span>
              <span className="mx-1.5 text-slate-600">·</span>
              <span className="text-slate-400">lead count</span>
            </p>
          </div>

          <div className="flex h-[180px] flex-col justify-center gap-4">
            <div className="flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-white/[0.04] p-0.5">
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
                      <span className="text-[13px] font-medium text-slate-200">{row.name}</span>
                      <span className="tabular-nums text-[12px] text-slate-400">
                        <strong className="font-semibold text-white">{row.count}</strong>
                        <span className="ml-1.5 text-slate-500">leads</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
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
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-5 py-3.5">
            <div>
              <h2 className="text-[15px] font-semibold text-white">Upcoming relevant webinars</h2>
              <p className="text-[12.5px] text-slate-500">
                {webinars.length > 10
                  ? `Showing 10 of ${webinars.length} · ${m.webinarRelevantLeads} relevant leads`
                  : `${m.upcomingWebinars} events · ${m.webinarRelevantLeads} relevant leads`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => go("/webinars")}
              className="group inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-300 underline-offset-4 hover:text-indigo-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
            >
              Open webinars
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {overviewWebinars.length === 0 ? (
              <p className="col-span-full px-2 py-10 text-center text-sm text-slate-500">No webinars yet.</p>
            ) : (
              overviewWebinars.map((w, i) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => go(`/webinars/${w.id}`)}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-colors hover:border-indigo-500/35 hover:bg-white/[0.04]"
                >
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-30 blur-2xl"
                    style={{ background: i % 2 === 0 ? "#6366f1" : "#22d3ee" }}
                  />
                  <div className="relative flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
                      <CalendarDays className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-semibold text-white group-hover:text-indigo-100">
                        {w.title}
                      </span>
                      <span className="mt-1 block text-[12px] text-slate-500">
                        {w.investmentMarket} · {w.eventDate} · {w.eventTime}
                      </span>
                      <span className="mt-2 inline-flex gap-2 text-[11px] text-slate-400">
                        <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5">{w.relevantLeadIds.length} relevant</span>
                        <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5">{w.outreachMode}</span>
                      </span>
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        <section className={cn(CARD, "overflow-hidden")} aria-label="Recent lead activity">
          <div className="border-b border-white/[0.06] px-5 py-3.5">
            <h2 className="text-[15px] font-semibold text-white">Recently captured</h2>
            <p className="mt-0.5 text-[12.5px] text-slate-500">Live activity from Joe conversations</p>
          </div>
          <ul className="divide-y divide-white/[0.05]">
            {recentActivity.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => go(`/leads/${l.id}`)}
                  className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400/50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-[10px] font-bold text-slate-300">
                    {l.firstName[0]}{l.lastName[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-white">
                      {l.firstName} {l.lastName}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block text-[12px] text-slate-500">
                      {l.conversationSummary}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] font-medium text-slate-500">
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
            <h2 className="text-[18px] font-bold tracking-[-0.02em] text-white">Leads that need attention</h2>
            <p className="mt-0.5 text-[13px] text-slate-500">
              Human handoff and high intent — status, rep, and conversation summary.
            </p>
          </div>
          <button
            type="button"
            onClick={() => go("/leads")}
            className="group inline-flex items-center gap-1 text-[12px] font-semibold text-indigo-300 underline-offset-4 hover:text-indigo-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
          >
            Open leads
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {needsAttention.length === 0 ? (
          <div className={cn(CARD, "px-6 py-16 text-center text-sm text-slate-500")}>
            Nothing needs attention right now.
          </div>
        ) : (
          <div className={cn(CARD, "grid overflow-hidden lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,1.2fr)_minmax(220px,0.85fr)]")}>
            <ul className="divide-y divide-white/[0.05] border-b border-white/[0.06] lg:border-b-0 lg:border-r">
              {needsAttention.map((l) => {
                const active = selected?.id === l.id;
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(l.id)}
                      className={cn(
                        "flex w-full flex-col gap-1 px-4 py-3.5 text-left transition-colors",
                        active ? "bg-indigo-500/10" : "hover:bg-white/[0.03]",
                      )}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[13.5px] font-semibold text-white">
                          {l.firstName} {l.lastName}
                        </span>
                        <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", statusBadgeClass(l.status))}>
                          {l.handoff ? "Handoff" : l.status}
                        </span>
                      </span>
                      <span className="line-clamp-1 text-[12px] text-slate-500">{l.conversationSummary}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {selected && (
              <>
                <div className="border-b border-white/[0.06] p-5 lg:border-b-0 lg:border-r">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Evidence</p>
                  <h3 className="mt-2 text-[16px] font-semibold text-white">
                    {selected.firstName} {selected.lastName}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{selected.summary}</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Evidence label="Interest" value={selected.interest} />
                    <Evidence label="Readiness" value={selected.readiness} />
                    <Evidence label="Assigned rep" value={selected.assignedRep} />
                    <Evidence label="Last response" value={formatDisplayDate(selected.lastResponseAt)} />
                    <Evidence label="Stage" value={selected.conversationStage} />
                    <Evidence label="Source" value={selected.sourceWebinar || selected.leadSource} />
                  </div>
                  <p className="mt-4 text-[12px] text-slate-500">
                    Qualification {selected.qualificationProgress}% · Outreach: {selected.outreachStatus}
                  </p>
                </div>

                <div className="flex flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Action recommended</p>
                  <p className="mt-2 text-[14px] font-semibold text-white">
                    {selected.handoff
                      ? "Review handoff and resume or keep with the rep"
                      : "Open profile and push toward consultation"}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-400">
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
                      className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-indigo-500 px-4 text-[13px] font-semibold text-white hover:bg-indigo-400"
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
                      className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-[13px] font-semibold text-slate-300 hover:bg-white/[0.06]"
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
              className={cn(CARD, "group flex items-start gap-3 p-4 text-left transition-colors hover:border-indigo-500/30")}
            >
              <span className="grid size-9 place-items-center rounded-lg bg-indigo-500/15 text-indigo-300">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-white">{item.title}</span>
                  <ArrowRight className="size-4 text-slate-600 transition-colors group-hover:text-indigo-300" />
                </span>
                <span className="mt-1 block text-[12px] text-slate-500">{item.body}</span>
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
          <h3 className="text-[15px] font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-[12px] text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {meta && <span className="text-[12px] font-semibold text-slate-400">{meta}</span>}
          {actions}
        </div>
      </div>
      {children}
    </section>
  );
}

function Evidence({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-[12px] font-medium text-slate-200">{value}</p>
    </div>
  );
}
