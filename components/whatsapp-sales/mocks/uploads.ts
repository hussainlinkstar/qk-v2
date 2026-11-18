import type { LeadUploadHistoryRow, SimulatedImportSummary } from "../types";

export const MOCK_UPLOAD_HISTORY: LeadUploadHistoryRow[] = [
  {
    id: "up-1",
    date: "2026-09-03",
    fileName: "JM_Leads_Sept.xlsx",
    rows: 1250,
    newLeads: 104,
    duplicates: 1128,
    invalid: 18,
  },
  {
    id: "up-2",
    date: "2026-08-12",
    fileName: "JM_Leads_Aug.csv",
    rows: 840,
    newLeads: 62,
    duplicates: 761,
    invalid: 17,
  },
];

/** Visual-only simulation — file is never uploaded to a server. */
export function simulateLeadImport(fileName: string): SimulatedImportSummary {
  const lower = fileName.toLowerCase();
  const invalidType = !(lower.endsWith(".xlsx") || lower.endsWith(".csv"));
  if (invalidType) {
    return {
      fileName,
      rowsProcessed: 0,
      newLeads: 0,
      duplicatesSkipped: 0,
      invalidRows: 0,
      validationErrors: [],
    };
  }
  const seed = fileName.length * 17;
  const rowsProcessed = 200 + (seed % 400);
  const invalidRows = Math.max(2, seed % 12);
  const duplicatesSkipped = Math.floor(rowsProcessed * 0.7);
  const newLeads = Math.max(0, rowsProcessed - duplicatesSkipped - invalidRows);
  const validationErrors = [
    { row: 12, field: "phone", message: "Missing or invalid phone number" },
    { row: 47, field: "email", message: "Invalid email format" },
    { row: 88, field: "consent", message: "WhatsApp consent not provided" },
  ].slice(0, Math.min(3, invalidRows));
  return { fileName, rowsProcessed, newLeads, duplicatesSkipped, invalidRows, validationErrors };
}
