import type { WhatsappSalesMetrics } from "../types";
import { MOCK_LEADS } from "./leads";
import { MOCK_WEBINARS } from "./webinars";

/** Derived from mock leads/webinars so Overview stays consistent with other screens. */
export function getMockMetrics(): WhatsappSalesMetrics {
  const contacted = MOCK_LEADS.filter((l) => l.lastContactedAt).length;
  const responded = MOCK_LEADS.filter((l) => l.lastResponseAt).length;
  const active = MOCK_LEADS.filter((l) => l.status === "Active Conversation").length;
  const highIntent = MOCK_LEADS.filter((l) => l.status === "High Intent" || l.interest === "High").length;
  const handoffs = MOCK_LEADS.filter((l) => l.handoff || l.status === "Human Handoff").length;
  const newLeads = MOCK_LEADS.filter((l) => l.status === "New" || l.status === "Not Contacted").length;
  const responseRatePct = contacted ? Math.round((responded / contacted) * 100) : 0;
  const noResponsePct = contacted ? Math.round(((contacted - responded) / contacted) * 100) : 0;
  const webinarRelevant = new Set(MOCK_WEBINARS.flatMap((w) => w.relevantLeadIds)).size;

  return {
    totalLeads: MOCK_LEADS.length,
    newLeads,
    contactedLeads: contacted,
    activeConversations: active,
    responseRatePct,
    noResponsePct,
    highIntentLeads: highIntent,
    humanHandoffs: handoffs,
    consultationsBooked: 1,
    upcomingWebinars: MOCK_WEBINARS.length,
    webinarRelevantLeads: webinarRelevant,
    interaktConnected: true,
  };
}
