"use client";

import { MOCK_WEBINARS } from "./mocks/webinars";
import type { OutreachMode, WhatsappSalesWebinar } from "./types";

/** In-memory webinar list for the FE-only preview (resets on full page reload). */
let webinars: WhatsappSalesWebinar[] = MOCK_WEBINARS.map((w) => ({
  ...w,
  relevantLocations: [...w.relevantLocations],
  relevantLeadIds: [...w.relevantLeadIds],
}));
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function listWebinars(): WhatsappSalesWebinar[] {
  return webinars;
}

export function getWebinar(id: string): WhatsappSalesWebinar | undefined {
  return webinars.find((w) => w.id === id);
}

export type UpsertWebinarInput = {
  id?: string;
  title: string;
  description: string;
  investmentMarket: string;
  relevantLocations: string[];
  eventDate: string;
  eventTime: string;
  webinarLink: string;
  approvedTemplate: string;
  outreachMode?: OutreachMode;
  autoTriggerEnabled?: boolean;
  autoTriggerTiming?: string;
  relevantLeadIds?: string[];
};

export function upsertWebinar(input: UpsertWebinarInput): WhatsappSalesWebinar {
  if (input.id) {
    const idx = webinars.findIndex((w) => w.id === input.id);
    if (idx >= 0) {
      const prev = webinars[idx]!;
      const next: WhatsappSalesWebinar = {
        ...prev,
        ...input,
        id: prev.id,
        outreachMode: input.outreachMode ?? prev.outreachMode,
        autoTriggerEnabled: input.autoTriggerEnabled ?? prev.autoTriggerEnabled,
        autoTriggerTiming: input.autoTriggerTiming ?? prev.autoTriggerTiming,
        relevantLeadIds: input.relevantLeadIds ?? prev.relevantLeadIds,
        relevantLocations: [...input.relevantLocations],
      };
      webinars = [...webinars.slice(0, idx), next, ...webinars.slice(idx + 1)];
      notify();
      return next;
    }
  }
  const created: WhatsappSalesWebinar = {
    id: `web-${Date.now()}`,
    title: input.title,
    description: input.description,
    investmentMarket: input.investmentMarket,
    relevantLocations: [...input.relevantLocations],
    eventDate: input.eventDate,
    eventTime: input.eventTime,
    webinarLink: input.webinarLink,
    approvedTemplate: input.approvedTemplate,
    outreachMode: input.outreachMode ?? "Manual",
    autoTriggerEnabled: input.autoTriggerEnabled ?? false,
    autoTriggerTiming: input.autoTriggerTiming ?? "",
    relevantLeadIds: input.relevantLeadIds ?? [],
    contactedCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    responseCount: 0,
    highIntentGenerated: 0,
    humanHandoffs: 0,
    meetingsBooked: 0,
  };
  webinars = [created, ...webinars];
  notify();
  return created;
}

export function subscribeWebinars(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
