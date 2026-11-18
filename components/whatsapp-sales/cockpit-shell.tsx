"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays, LayoutGrid, LogOut, MessageSquare, Upload, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setMockAuthenticated } from "@/lib/mock-auth";
import { WhatsappSalesChatPanel } from "@/components/whatsapp-sales/chat-panel";

export type WhatsappSalesSection = "overview" | "leads" | "webinars" | "data";

const NAV_ITEMS: {
  section: WhatsappSalesSection;
  label: string;
  sub: string;
  icon: typeof LayoutGrid;
  group: "OVERVIEW" | "OPERATIONS";
}[] = [
  { section: "overview", label: "Overview", sub: "DASHBOARD", icon: LayoutGrid, group: "OVERVIEW" },
  { section: "leads", label: "Leads", sub: "POOL", icon: Users, group: "OPERATIONS" },
  { section: "webinars", label: "Webinars", sub: "EVENTS", icon: CalendarDays, group: "OPERATIONS" },
  { section: "data", label: "Data", sub: "UPLOADS", icon: Upload, group: "OPERATIONS" },
];

function sectionHref(section: WhatsappSalesSection): string {
  if (section === "overview") return "/";
  return `/${section}`;
}

export function WhatsappSalesCockpitShell({
  agentId,
  workerName,
  active,
  children,
}: {
  agentId: string;
  workerName: string;
  active: WhatsappSalesSection;
  children: React.ReactNode;
}) {
  const router = useRouter();
  // Pulse-style: cockpit stays visible; Chat opens a floating right panel with expand/restore/close.
  // Keep the panel mounted after first open so the in-memory transcript is not wiped.
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);

  function openChat() {
    setChatMounted(true);
    setChatOpen(true);
  }

  function closeChat() {
    setChatOpen(false);
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#05070d] text-slate-200">
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.06] px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
            <MessageSquare className="size-3.5" />
          </span>
          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-sm font-semibold leading-tight text-white">{workerName}</h1>
            <p className="flex items-center gap-1 text-[10px] leading-tight text-slate-500">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Joseph Mews · WhatsApp Sales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-white/[0.06] p-0.5">
            <TabButton
              active={!chatOpen}
              onClick={closeChat}
              icon={LayoutGrid}
              label="Cockpit"
            />
            <TabButton
              active={chatOpen}
              onClick={openChat}
              icon={MessageSquare}
              label="Chat"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setMockAuthenticated(false);
              router.replace("/login");
            }}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <nav
          aria-label="Cockpit sections"
          className="hidden w-[210px] shrink-0 flex-col gap-5 overflow-y-auto border-r border-white/[0.06] px-4 py-5 lg:flex"
        >
          {(["OVERVIEW", "OPERATIONS"] as const).map((group) => (
            <div key={group}>
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{group}</p>
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                  const isActive = item.section === active;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.section}
                      type="button"
                      onClick={() => router.push(sectionHref(item.section))}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                        isActive
                          ? "border border-indigo-500/30 bg-indigo-500/10 text-white"
                          : "text-slate-400 hover:bg-white/[0.03] hover:text-white",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium">{item.label}</span>
                        <span className="block text-[10px] uppercase tracking-wider text-slate-500">{item.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col">
          <nav aria-label="Sections" className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/[0.06] px-3 py-2 lg:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive = item.section === active;
              const Icon = item.icon;
              return (
                <button
                  key={item.section}
                  type="button"
                  onClick={() => router.push(sectionHref(item.section))}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60",
                    isActive
                      ? "border border-indigo-500/30 bg-indigo-500/10 text-white"
                      : "text-slate-400 hover:bg-white/[0.03] hover:text-white",
                  )}
                >
                  <Icon className={cn("size-3.5 shrink-0", isActive ? "text-indigo-400" : "text-slate-500")} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>

      {chatMounted && (
        <div className={cn(!chatOpen && "hidden")}>
          <WhatsappSalesChatPanel
            agentId={agentId}
            workerName={workerName}
            onClose={closeChat}
          />
        </div>
      )}
    </div>
  );
}

function TabButton({
  active, onClick, icon: Icon, label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50",
        active ? "bg-white/[0.12] text-white" : "text-white/50 hover:text-white/75",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
