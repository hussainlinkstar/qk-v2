"use client";

import {
  Activity, AlertTriangle, BarChart3, CalendarDays, MessageSquare, PieChart as PieChartIcon, Sparkles, Users,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { ChartSlice, InsightCard, StatusBar, TrendPoint } from "./mocks/charts";

const CARD_BG = { background: "oklch(0.16 0.02 250)" } as const;
const TOOLTIP_STYLE = {
  background: "#0f1220",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 8,
  fontSize: 12,
  color: "#e2e8f0",
} as const;
const AXIS_TICK = { fill: "#64748b", fontSize: 11 } as const;

export function ChartCard({
  title, icon, iconColor, children, className,
}: {
  title: string;
  icon: React.ReactNode;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-white/[0.06] p-5", className)} style={CARD_BG}>
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/88">
        <span className={cn("shrink-0", iconColor)}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

export function KpiGrid({
  items, onOpen,
}: {
  items: { key: string; label: string; value: string; hint?: string; color: string; icon: React.ElementType }[];
  onOpen?: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onOpen?.(item.key)}
            className="rounded-xl border border-white/[0.06] p-3.5 text-left transition-all hover:border-indigo-400/35 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/45"
            style={CARD_BG}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/55">{item.label}</span>
              <Icon className="size-3.5 shrink-0" style={{ color: item.color }} />
            </div>
            <p className="mt-2 text-lg font-bold text-white/90 sm:text-xl">{item.value}</p>
            {item.hint && <p className="mt-1 text-[11px] text-white/45">{item.hint}</p>}
          </button>
        );
      })}
    </div>
  );
}

export function IntentDonut({ data }: { data: ChartSlice[] }) {
  return (
    <ChartCard title="Interest mix" icon={<PieChartIcon className="size-4" />} iconColor="text-emerald-400">
      <div className="flex h-[220px] items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="transparent"
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${Number(v)} leads`, String(n)]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {data.map((d) => (
          <span key={d.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-[11px] text-white/68">{d.name} ({d.value})</span>
          </span>
        ))}
      </div>
    </ChartCard>
  );
}

export function StatusPipelineChart({ data }: { data: StatusBar[] }) {
  return (
    <ChartCard title="Lead pipeline by status" icon={<BarChart3 className="size-4" />} iconColor="text-indigo-400">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" tick={AXIS_TICK} angle={-28} textAnchor="end" height={56} interval={0} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" name="Leads" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function EngagementTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartCard title="Weekly WhatsApp engagement" icon={<Activity className="size-4" />} iconColor="text-cyan-400">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="wsContacted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="wsResponses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="week" tick={AXIS_TICK} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Area type="monotone" dataKey="contacted" name="Contacted" stroke="#818cf8" fill="url(#wsContacted)" strokeWidth={2} />
          <Area type="monotone" dataKey="responses" name="Responses" stroke="#34d399" fill="url(#wsResponses)" strokeWidth={2} />
          <Area type="monotone" dataKey="highIntent" name="High intent" stroke="#fbbf24" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function WebinarBars({ data }: { data: { name: string; relevant: number; contacted: number; responses: number }[] }) {
  return (
    <ChartCard title="Webinar relevance & outreach" icon={<CalendarDays className="size-4" />} iconColor="text-amber-400">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis dataKey="name" tick={AXIS_TICK} angle={-20} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} width={28} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="relevant" name="Relevant" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="contacted" name="Contacted" fill="#22d3ee" radius={[4, 4, 0, 0]} />
          <Bar dataKey="responses" name="Responses" fill="#34d399" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MarketBars({ data }: { data: StatusBar[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <ChartCard title="Market interest" icon={<Users className="size-4" />} iconColor="text-purple-400">
      <div className="space-y-3">
        {data.map((row) => (
          <div key={row.name}>
            <div className="mb-1 flex items-center justify-between text-[12px]">
              <span className="text-white/75">{row.name}</span>
              <span className="font-semibold text-white/90">{row.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                style={{ width: `${Math.round((row.count / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function InsightRail({ insights }: { insights: InsightCard[] }) {
  const toneBorder: Record<InsightCard["tone"], string> = {
    emerald: "border-emerald-500/20",
    amber: "border-amber-500/20",
    indigo: "border-indigo-500/20",
    red: "border-red-500/20",
  };
  const toneAccent: Record<InsightCard["tone"], string> = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    indigo: "bg-indigo-400",
    red: "bg-red-400",
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/[0.06]" style={CARD_BG}>
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.06] px-4">
        <Sparkles className="size-3.5 text-indigo-300" />
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-200/90">Trends</p>
      </div>
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className={cn("relative rounded-lg border bg-white/[0.03] px-3 py-2.5 pl-4", toneBorder[insight.tone])}
          >
            <span className={cn("absolute left-0 top-0 h-full w-1 rounded-l-lg", toneAccent[insight.tone])} />
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">{insight.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/82">{insight.text}</p>
          </div>
        ))}
        <div className="flex items-start gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-white/45">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400/80" />
          Preview charts use mock lead activity. Live Interakt metrics arrive with the backend branch.
        </div>
      </div>
    </div>
  );
}

export function ConnectionChip({ connected }: { connected: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] px-4 py-3 text-[13px]" style={CARD_BG}>
      <MessageSquare className="size-3.5 text-slate-500" />
      <span className={`size-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
      <span className="text-slate-300">Interakt {connected ? "connected" : "not connected"}</span>
      <span className="text-slate-600">·</span>
      <span className="text-slate-500">Mock status for UI preview</span>
    </div>
  );
}
