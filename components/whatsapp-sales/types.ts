/** Types shaped for a future WhatsApp Sales API — screens use mocks today. */

export type InterestLevel = "High" | "Medium" | "Low" | "Unknown";
export type Readiness = "Immediate" | "Near Term" | "Future" | "Unknown";
export type LeadStatus =
  | "New"
  | "Not Contacted"
  | "Contacted"
  | "Active Conversation"
  | "Qualified"
  | "Nurture"
  | "High Intent"
  | "Human Handoff"
  | "No Response"
  | "Closed"
  | "Opted Out";

export type OutreachStatus =
  | "Not contacted"
  | "Contacted"
  | "Responded"
  | "Entered qualification"
  | "Message failed";

export type NurtureState = "None" | "Active" | "Paused" | "Completed";
export type OutreachMode = "Manual" | "Automatic";
export type WebinarEngagement = "None" | "Registered" | "Invited" | "Attended" | "No-show";

export type WhatsappMessage = {
  id: string;
  direction: "inbound" | "outbound";
  text: string;
  at: string;
};

export type WhatsappSalesLead = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  country: string;
  leadSource: string;
  assignedRep: string;
  investmentExperience: string;
  marketInterest: string;
  locationInterest: string;
  budget: string;
  fundingMethod: string;
  timeframe: string;
  interest: InterestLevel;
  readiness: Readiness;
  status: LeadStatus;
  summary: string;
  conversationSummary: string;
  conversationStage: string;
  qualificationProgress: number;
  sourceWebinar: string | null;
  webinarEngagement: WebinarEngagement;
  lastContactedAt: string | null;
  lastResponseAt: string | null;
  followUpAt: string | null;
  outreachStatus: OutreachStatus;
  nurtureState: NurtureState;
  handoff: boolean;
  handoffReason: string | null;
  whatsappEligible: boolean;
  optedOut: boolean;
  messages: WhatsappMessage[];
};

export type WhatsappSalesMetrics = {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  activeConversations: number;
  responseRatePct: number;
  noResponsePct: number;
  highIntentLeads: number;
  humanHandoffs: number;
  consultationsBooked: number;
  upcomingWebinars: number;
  webinarRelevantLeads: number;
  interaktConnected: boolean;
};

export type WhatsappSalesWebinar = {
  id: string;
  title: string;
  description: string;
  investmentMarket: string;
  relevantLocations: string[];
  eventDate: string;
  eventTime: string;
  webinarLink: string;
  approvedTemplate: string;
  outreachMode: OutreachMode;
  autoTriggerEnabled: boolean;
  autoTriggerTiming: string;
  relevantLeadIds: string[];
  contactedCount: number;
  deliveredCount: number;
  failedCount: number;
  responseCount: number;
  highIntentGenerated: number;
  humanHandoffs: number;
  meetingsBooked: number;
};

export type LeadUploadHistoryRow = {
  id: string;
  date: string;
  fileName: string;
  rows: number;
  newLeads: number;
  duplicates: number;
  invalid: number;
};

export type ImportValidationError = {
  row: number;
  field: string;
  message: string;
};

export type SimulatedImportSummary = {
  fileName: string;
  rowsProcessed: number;
  newLeads: number;
  duplicatesSkipped: number;
  invalidRows: number;
  validationErrors: ImportValidationError[];
};
