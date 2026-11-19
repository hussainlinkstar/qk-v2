"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle, CheckCircle2, Copy, Download, FileSpreadsheet, Upload, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OutcomesStrip } from "@/components/cockpit/outcomes-strip";
import { WhatsappSalesCockpitShell } from "@/components/whatsapp-sales/cockpit-shell";
import { MOCK_UPLOAD_HISTORY, simulateLeadImport } from "@/components/whatsapp-sales/mocks";
import type { LeadUploadHistoryRow, SimulatedImportSummary } from "@/components/whatsapp-sales/types";
import { useWhatsappSalesWorkerName } from "@/components/whatsapp-sales/use-worker-name";

const CARD = "card-surface";

export default function WhatsappSalesDataPage() {
  const { agentId, workerName } = useWhatsappSalesWorkerName();
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<LeadUploadHistoryRow[]>(MOCK_UPLOAD_HISTORY);
  const [summary, setSummary] = useState<SimulatedImportSummary | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const totals = useMemo(() => ({
    uploads: history.length,
    newLeads: history.reduce((s, r) => s + r.newLeads, 0),
    duplicates: history.reduce((s, r) => s + r.duplicates, 0),
    invalid: history.reduce((s, r) => s + r.invalid, 0),
  }), [history]);

  const processFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setSummary(null);
    setProgress(0);
    const lower = file.name.toLowerCase();
    if (!(lower.endsWith(".xlsx") || lower.endsWith(".csv"))) {
      setError("Unsupported file type. MVP supports XLSX and CSV only. Nothing was imported.");
      return;
    }
    setBusy(true);
    for (const pct of [18, 42, 67, 88, 100]) {
      await new Promise((r) => setTimeout(r, 120));
      setProgress(pct);
    }
    const result = simulateLeadImport(file.name);
    setSummary(result);
    setHistory((prev) => [
      {
        id: `up-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        fileName: result.fileName,
        rows: result.rowsProcessed,
        newLeads: result.newLeads,
        duplicates: result.duplicatesSkipped,
        invalid: result.invalidRows,
      },
      ...prev,
    ]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="data">
      <div className="flex w-full flex-col gap-5">
        <header className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-[-0.03em] text-ink">Data</h1>
              <p className="mt-1 max-w-[56ch] text-[14px] text-muted">
                Upload lead sheets, review validation, and track import history. Bad rows never leave a half-import.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[12.5px] text-subtle">{workerName}</p>
              <a
                href="/examples/jm-leads-example.csv"
                download="JM_Leads_Example.csv"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-well px-3.5 py-2 text-[13px] font-semibold text-ink-2 hover:bg-well focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
              >
                <Download className="size-3.5" />
                Example CSV
              </a>
            </div>
          </div>

          <OutcomesStrip
            variant="compact"
            title="Import health"
            tiles={[
              {
                value: String(totals.uploads),
                label: "Uploads",
                tone: "brand",
                icon: Upload,
                caption: "History rows",
                spark: [25, 35, 42, 50, 58],
              },
              {
                value: totals.newLeads.toLocaleString(),
                label: "New leads",
                tone: "success",
                trend: "up",
                icon: UserPlus,
                caption: "Added to pool",
                spark: [30, 40, 48, 55, 65],
              },
              {
                value: totals.duplicates.toLocaleString(),
                label: "Duplicates skipped",
                tone: "neutral",
                icon: Copy,
                caption: "Phone match",
                spark: [55, 52, 50, 48, 45],
              },
              {
                value: totals.invalid.toLocaleString(),
                label: "Invalid rows",
                tone: "warning",
                trend: "down",
                icon: AlertTriangle,
                caption: "Needs fix",
                spark: [40, 35, 32, 28, 22],
              },
            ]}
          />
        </header>

        {/* Upload zone */}
        <section className={cn(CARD, "p-5 sm:p-6")}>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">Upload lead sheet</h2>
              <p className="mt-1 text-[13px] text-muted">
                Supported: <span className="text-ink-2">CSV</span>, <span className="text-ink-2">XLSX</span>.
                Dedup by normalised phone. This preview simulates the import — the file is not uploaded.
              </p>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={() => !busy && inputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !busy) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void processFile(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
              dragging
                ? "border-brand/50 bg-brand-soft"
                : "border-line bg-surface-muted hover:border-indigo-500/35 hover:bg-well",
              busy && "pointer-events-none opacity-70",
            )}
          >
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
              <Upload className="size-5" />
            </span>
            <p className="mt-4 text-[15px] font-semibold text-ink">
              {busy ? "Processing…" : "Drop a file here, or click to browse"}
            </p>
            <p className="mt-1 text-[12.5px] text-subtle">CSV or XLSX · max preview simulation</p>
            {!busy && (
              <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-white">
                <Upload className="size-3.5" /> Upload Lead Sheet
              </span>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="hidden"
            onChange={(e) => void processFile(e.target.files?.[0])}
          />

          {busy && (
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-[11px] text-subtle">
                <span>Upload progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-well">
                <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {summary && (
            <div className="mt-5 space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
                  <CheckCircle2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-emerald-200">Import complete</p>
                  <p className="mt-0.5 truncate text-[12px] text-muted">{summary.fileName}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <SummaryStat label="Rows processed" value={summary.rowsProcessed} />
                <SummaryStat label="New leads" value={summary.newLeads} tone="emerald" />
                <SummaryStat label="Duplicates skipped" value={summary.duplicatesSkipped} />
                <SummaryStat label="Invalid rows" value={summary.invalidRows} tone="amber" />
              </dl>
              {summary.validationErrors.length > 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3">
                  <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-200">
                    <AlertTriangle className="size-3.5" /> Validation errors (failed rows)
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {summary.validationErrors.map((err) => (
                      <li key={`${err.row}-${err.field}`} className="text-[12px] text-amber-100/90">
                        Row {err.row} · <span className="font-medium">{err.field}</span> — {err.message}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11px] text-subtle">
                    Invalid rows were skipped. Valid rows were processed; nothing was left half-imported.
                  </p>
                </div>
              )}
              <p className="text-[11px] text-subtle">
                Simulated result for UI review. A later backend branch will persist imports and enforce opt-out / eligibility rules.
              </p>
            </div>
          )}
        </section>

        {/* History */}
        <section className={cn(CARD, "overflow-hidden")}>
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-3.5">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">Upload history</h3>
              <p className="mt-0.5 text-[12.5px] text-subtle">Date · File · Rows · New · Duplicates · Invalid</p>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-well text-subtle">
                <FileSpreadsheet className="size-5" />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">No uploads yet</p>
              <p className="mt-1 text-[13px] text-subtle">Upload a lead sheet to see history here.</p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full text-left text-[13px]">
                  <thead className="border-b border-line bg-surface-muted text-[11px] uppercase tracking-wider text-subtle">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Date</th>
                      <th className="px-5 py-3.5 font-semibold">File</th>
                      <th className="px-5 py-3.5 font-semibold">Rows</th>
                      <th className="px-5 py-3.5 font-semibold">New leads</th>
                      <th className="px-5 py-3.5 font-semibold">Duplicates</th>
                      <th className="px-5 py-3.5 font-semibold">Invalid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {history.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-muted">
                        <td className="px-5 py-3.5 text-ink-3">{row.date}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-2.5">
                            <span className="grid size-8 place-items-center rounded-lg bg-well text-muted">
                              <FileSpreadsheet className="size-3.5" />
                            </span>
                            <span className="font-medium text-ink">{row.fileName}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-ink-3">{row.rows.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-medium text-success">{row.newLeads.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-muted">{row.duplicates.toLocaleString()}</td>
                        <td className="px-5 py-3.5 font-medium text-warning">{row.invalid.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <ul className="divide-y divide-line md:hidden">
                {history.map((row) => (
                  <li key={row.id} className="px-4 py-4">
                    <div className="flex items-start gap-3">
                      <span className="grid size-9 place-items-center rounded-lg bg-well text-muted">
                        <FileSpreadsheet className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">{row.fileName}</p>
                        <p className="mt-0.5 text-[12px] text-subtle">{row.date}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-[12px]">
                          <span className="text-muted">{row.rows.toLocaleString()} rows</span>
                          <span className="text-success">{row.newLeads.toLocaleString()} new</span>
                          <span className="text-subtle">{row.duplicates.toLocaleString()} dupes</span>
                          <span className="text-warning">{row.invalid.toLocaleString()} invalid</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </WhatsappSalesCockpitShell>
  );
}

function SummaryStat({
  label, value, tone,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "amber";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-muted px-3 py-2.5">
      <dt className="text-[10px] uppercase tracking-wider text-subtle">{label}</dt>
      <dd className={cn(
        "mt-1 text-lg font-semibold",
        tone === "emerald" ? "text-success" : tone === "amber" ? "text-warning" : "text-white",
      )}>
        {value.toLocaleString()}
      </dd>
    </div>
  );
}
