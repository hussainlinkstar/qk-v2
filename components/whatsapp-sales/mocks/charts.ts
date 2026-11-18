import { MOCK_LEADS } from "./leads";
import { MOCK_WEBINARS } from "./webinars";
import { getMockMetrics } from "./metrics";

export type ChartSlice = { key: string; name: string; value: number; color: string };
export type StatusBar = { name: string; count: number };
export type MarketBar = StatusBar & { color: string; sharePct: number };
export type TrendPoint = { week: string; contacted: number; responses: number; highIntent: number };
export type InsightCard = { title: string; text: string; tone: "emerald" | "amber" | "indigo" | "red" };

const INTENT_COLORS: Record<string, string> = {
  High: "#34d399",
  Medium: "#fbbf24",
  Low: "#94a3b8",
  Unknown: "#6366f1",
};

const STATUS_ORDER = [
  "Not Contacted", "Contacted", "Active Conversation", "Qualified",
  "High Intent", "Nurture", "Human Handoff", "No Response", "Opted Out",
];

export function intentDonut(): ChartSlice[] {
  const counts = new Map<string, number>();
  for (const l of MOCK_LEADS) counts.set(l.interest, (counts.get(l.interest) ?? 0) + 1);
  return Array.from(counts.entries()).map(([name, value]) => ({
    key: name,
    name,
    value,
    color: INTENT_COLORS[name] ?? "#64748b",
  }));
}

/**
 * Illustrative pipeline mix for the Overview chart — not 1:1 with the 8 profile fixtures
 * (those would all render as count 1). Counts are varied so bars read clearly in the UI preview.
 */
export function statusBars(): StatusBar[] {
  const illustrative: Record<string, number> = {
    "Not Contacted": 18,
    Contacted: 14,
    "Active Conversation": 22,
    Qualified: 9,
    "High Intent": 11,
    Nurture: 16,
    "Human Handoff": 5,
    "No Response": 13,
    "Opted Out": 4,
    New: 7,
    Closed: 3,
  };
  // Prefer statuses that exist in fixtures, then fill remaining illustrative bars.
  const seen = new Set<string>(MOCK_LEADS.map((l) => l.status));
  const order = [
    "New",
    ...STATUS_ORDER,
    "Closed",
  ].filter((s, i, arr) => arr.indexOf(s) === i);
  return order
    .filter((s) => seen.has(s) || illustrative[s])
    .map((name) => ({
      name: name.replace("Active Conversation", "Active"),
      count: illustrative[name] ?? 1,
    }));
}

/**
 * Illustrative UK/UAE mix for Overview — fixture leads are mostly UK, so we
 * use preview counts that read clearly as a market composition chart.
 */
export function marketBars(): MarketBar[] {
  const rows = [
    { name: "UK", count: 42, color: "#6366f1" },
    { name: "UAE", count: 28, color: "#22d3ee" },
    { name: "UK + UAE", count: 11, color: "#34d399" },
    { name: "Undecided", count: 7, color: "#94a3b8" },
  ];
  const total = rows.reduce((sum, r) => sum + r.count, 0) || 1;
  return rows.map((r) => ({
    ...r,
    sharePct: Math.round((r.count / total) * 100),
  }));
}

/** Illustrative weekly engagement for the preview dashboard. */
export function weeklyEngagement(): TrendPoint[] {
  return [
    { week: "W1", contacted: 12, responses: 7, highIntent: 2 },
    { week: "W2", contacted: 18, responses: 11, highIntent: 4 },
    { week: "W3", contacted: 15, responses: 9, highIntent: 3 },
    { week: "W4", contacted: 22, responses: 14, highIntent: 6 },
    { week: "W5", contacted: 19, responses: 12, highIntent: 5 },
    { week: "W6", contacted: 24, responses: 16, highIntent: 7 },
  ];
}

export function webinarEngagementBars(): { name: string; relevant: number; contacted: number; responses: number }[] {
  return MOCK_WEBINARS.map((w) => ({
    name: w.title.length > 22 ? `${w.title.slice(0, 20)}…` : w.title,
    relevant: w.relevantLeadIds.length,
    contacted: w.contactedCount,
    responses: w.responseCount,
  }));
}

export function overviewInsights(): InsightCard[] {
  const m = getMockMetrics();
  const handoffs = MOCK_LEADS.filter((l) => l.handoff).length;
  const high = MOCK_LEADS.filter((l) => l.interest === "High").length;
  return [
    {
      title: "High intent cluster",
      text: `${high} leads show High interest — prioritise advisor booking links for Near Term / Immediate readiness.`,
      tone: "emerald",
    },
    {
      title: "Human handoffs",
      text: `${handoffs} conversation${handoffs === 1 ? "" : "s"} paused for human follow-up. Automation stays off until resume.`,
      tone: "amber",
    },
    {
      title: "Response rate",
      text: `${m.responseRatePct}% of contacted leads replied. ${m.noResponsePct}% still need a compliant re-engagement template.`,
      tone: "indigo",
    },
    {
      title: "Webinar match",
      text: `${m.webinarRelevantLeads} unique leads match upcoming webinar markets/locations — review eligibility before outreach.`,
      tone: "emerald",
    },
  ];
}
