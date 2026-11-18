/** Preview id for FE-only Studio entry when no real WhatsApp Sales agent is deployed. */
export const WHATSAPP_SALES_PREVIEW_ID = "jm-whatsapp-sales-preview";

export function formatDisplayDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function interestBadgeClass(interest: string): string {
  switch (interest) {
    case "High":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
    case "Medium":
      return "bg-amber-500/15 text-amber-300 border-amber-500/25";
    case "Low":
      return "bg-slate-500/15 text-slate-300 border-slate-500/25";
    default:
      return "bg-white/5 text-slate-400 border-white/10";
  }
}

export function statusBadgeClass(status: string): string {
  if (status === "Human Handoff" || status === "Opted Out") {
    return "bg-red-500/15 text-red-300 border-red-500/25";
  }
  if (status === "High Intent" || status === "Qualified") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/25";
  }
  if (status === "Active Conversation") {
    return "bg-indigo-500/15 text-indigo-300 border-indigo-500/25";
  }
  return "bg-white/5 text-slate-300 border-white/10";
}
