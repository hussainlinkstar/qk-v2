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
      return "border-transparent bg-success-soft text-success";
    case "Medium":
      return "border-transparent bg-warning-soft text-warning";
    case "Low":
      return "border-line bg-well text-muted";
    default:
      return "border-line bg-well text-muted";
  }
}

export function statusBadgeClass(status: string): string {
  if (status === "Human Handoff" || status === "Opted Out") {
    return "border-transparent bg-danger-soft text-danger";
  }
  if (status === "High Intent" || status === "Qualified") {
    return "border-transparent bg-success-soft text-success";
  }
  if (status === "Active Conversation") {
    return "border-transparent bg-brand-soft text-brand-ink";
  }
  return "border-line bg-well text-muted";
}

/** Explainable webinar match reason from structured lead attributes (PRD §17–18). */
export function webinarMatchReason(
  lead: { marketInterest: string; locationInterest: string },
  webinar: { investmentMarket: string; relevantLocations: string[] },
): string {
  const reasons: string[] = [];
  if (lead.marketInterest && lead.marketInterest.toUpperCase() === webinar.investmentMarket.toUpperCase()) {
    reasons.push(`Market ${lead.marketInterest}`);
  }
  const loc = webinar.relevantLocations.find((l) =>
    lead.locationInterest.toLowerCase().includes(l.toLowerCase()),
  );
  if (loc) reasons.push(`Location ${lead.locationInterest}`);
  return reasons.join(" · ") || "Structured profile match";
}
