"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setMockAuthenticated } from "@/lib/mock-auth";
import { WhatsappSalesChatPanel } from "@/components/whatsapp-sales/chat-panel";
import { QikoMark } from "@/components/brand/qiko-mark";
import { ThemeToggle } from "@/components/theme-toggle";

export type WhatsappSalesSection = "overview" | "leads" | "webinars" | "data";

const SIDEBAR_KEY = "qk-v2-sidebar-collapsed";

const NAV_ITEMS: {
  section: WhatsappSalesSection;
  label: string;
  icon: typeof LayoutGrid;
  group: "WORKSPACE" | "OPERATIONS";
}[] = [
  { section: "overview", label: "Overview", icon: LayoutGrid, group: "WORKSPACE" },
  { section: "leads", label: "Leads", icon: Users, group: "OPERATIONS" },
  { section: "webinars", label: "Webinars", icon: CalendarDays, group: "OPERATIONS" },
  { section: "data", label: "Data", icon: Upload, group: "OPERATIONS" },
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
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMounted, setChatMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function openChat() {
    setChatMounted(true);
    setChatOpen(true);
  }

  function closeChat() {
    setChatOpen(false);
  }

  function signOut() {
    setMockAuthenticated(false);
    router.replace("/login");
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-canvas text-ink">
      {/* Desktop sidebar — CRM / Pulse layout */}
      <aside
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-[72px]" : "w-[248px]",
        )}
      >
        {/* Brand + collapse */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b border-line",
            collapsed ? "justify-center px-2" : "justify-between gap-2 px-3",
          )}
        >
          <div className={cn("flex min-w-0 items-center gap-2", collapsed && "justify-center")}>
            <QikoMark size={26} />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold tracking-tight text-ink">
                  Qiko <span className="font-medium text-muted">· Joe</span>
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-well text-muted transition-colors hover:bg-brand-soft hover:text-brand"
            >
              <ChevronLeft className="size-3.5" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center border-b border-line py-2">
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="inline-flex size-7 items-center justify-center rounded-full border border-line bg-well text-muted transition-colors hover:bg-brand-soft hover:text-brand"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        )}

        {/* Workspace card */}
        {!collapsed ? (
          <div className="mx-3 mt-3 rounded-xl border border-line bg-surface-muted px-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-[12px] font-bold text-brand">
                JM
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">Joseph Mews</p>
                <p className="truncate text-[11px] text-subtle">WhatsApp Sales · {workerName}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-3 grid size-9 place-items-center rounded-xl bg-brand-soft text-[11px] font-bold text-brand" title="Joseph Mews">
            JM
          </div>
        )}

        {/* Nav groups */}
        <nav aria-label="Cockpit sections" className="mt-4 flex-1 space-y-4 overflow-y-auto px-2.5 pb-3">
          {(["WORKSPACE", "OPERATIONS"] as const).map((group) => (
            <div key={group}>
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-subtle">
                  {group}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
                  const isActive = item.section === active;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.section}
                      type="button"
                      title={collapsed ? item.label : undefined}
                      onClick={() => router.push(sectionHref(item.section))}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center rounded-[10px] text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                        collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-2.5 py-2",
                        isActive
                          ? "bg-brand-soft text-brand-ink"
                          : "text-muted hover:bg-well hover:text-ink",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", isActive ? "text-brand" : "text-subtle")} />
                      {!collapsed && (
                        <span className="truncate text-[13px] font-medium">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Account / sign out */}
        <div className={cn("shrink-0 border-t border-line", collapsed ? "p-2" : "p-3")}>
          {!collapsed && (
            <div className="mb-2 flex items-center gap-2.5 rounded-[10px] px-1.5 py-1">
              <span className="grid size-8 place-items-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
                A
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-ink">Admin</p>
                <p className="truncate text-[10px] text-subtle">admin@qiko.ai</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            className={cn(
              "flex items-center rounded-[10px] text-[13px] font-medium text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
              collapsed ? "mx-auto size-9 justify-center" : "w-full gap-2 px-2.5 py-2",
            )}
          >
            <LogOut className="size-4" />
            {!collapsed && "Sign out"}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-line bg-surface/95 px-3 backdrop-blur-sm sm:px-4">
          <div className="min-w-0 lg:hidden">
            <div className="flex items-center gap-2">
              <QikoMark size={22} />
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-ink">{workerName}</p>
                <p className="truncate text-[10px] text-muted">Joseph Mews · WhatsApp Sales</p>
              </div>
            </div>
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-[13px] font-semibold text-ink">{workerName}</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="size-1.5 rounded-full bg-success" />
              Interakt connected
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-line bg-well/80 p-0.5 shadow-sm">
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
            <ThemeToggle />
            <button
              type="button"
              title="Signed in as Admin"
              aria-label="Account"
              className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-brand-soft text-brand shadow-sm transition-colors hover:border-brand-ring hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <UserRound className="size-4" />
            </button>
          </div>
        </header>

        <nav
          aria-label="Sections"
          className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden"
        >
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
                  "flex shrink-0 items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
                  isActive
                    ? "bg-brand-soft text-brand-ink"
                    : "text-muted hover:bg-well hover:text-ink",
                )}
              >
                <Icon className={cn("size-3.5 shrink-0", isActive ? "text-brand" : "text-subtle")} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={signOut}
            className="ml-auto flex shrink-0 items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[12px] font-medium text-muted hover:bg-danger-soft hover:text-danger"
            title="Sign out"
          >
            <LogOut className="size-3.5" />
          </button>
        </nav>

        <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 lg:px-4 lg:py-5">
          {children}
        </main>
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
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
        active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
