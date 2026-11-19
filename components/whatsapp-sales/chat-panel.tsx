"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUp, CalendarDays, Handshake, Maximize2, MessageSquare, Minimize2,
  Sparkles, Users, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnswerMarkdown, TypingIndicator } from "@/components/chat-message";
import { getMockMetrics } from "@/components/whatsapp-sales/mocks";

const SUGGESTED = [
  {
    icon: Handshake,
    title: "High-intent leads",
    prompt: "Which leads are high interest and WhatsApp-eligible?",
  },
  {
    icon: CalendarDays,
    title: "Webinar relevance",
    prompt: "Summarise upcoming webinars and relevant lead counts.",
  },
  {
    icon: MessageSquare,
    title: "Handoffs",
    prompt: "Who needs a human handoff right now?",
  },
  {
    icon: Users,
    title: "Market intent",
    prompt: "What markets show the strongest intent this week?",
  },
] as const;

const CATEGORIES = [
  { label: "Leads", prompt: "Give me a quick read on the lead pool." },
  { label: "Webinars", prompt: "Summarise upcoming webinars and relevant lead counts." },
  { label: "Handoffs", prompt: "Who needs a human handoff right now?" },
] as const;

type Msg = { role: "user" | "assistant"; text: string };

export function WhatsappSalesChatPanel({
  workerName,
  onClose,
}: {
  agentId: string;
  workerName: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const m = getMockMetrics();

  const previewReply =
    "Here's a **preview** answer from mock data:\n\n" +
    `- **High intent:** ${m.highIntentLeads} leads in the pool\n` +
    `- **Handoff:** ${m.humanHandoffs} conversation${m.humanHandoffs === 1 ? "" : "s"} waiting\n` +
    `- **Webinars:** ${m.upcomingWebinars} upcoming · ${m.webinarRelevantLeads} relevant leads\n` +
    `- **Response rate:** ${m.responseRatePct}%\n\n` +
    "_Live WhatsApp chat against Interakt arrives with the backend branch._";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(value: string) {
    const q = value.trim();
    if (!q || pending) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setText("");
    setPending(true);
    await new Promise((r) => setTimeout(r, 550));
    setMessages((prev) => [...prev, { role: "assistant", text: previewReply }]);
    setPending(false);
    inputRef.current?.focus();
  }

  const empty = messages.length === 0 && !pending;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 top-14 z-30 bg-black/50 lg:hidden"
        aria-hidden
      />
      <aside
        className={cn(
          "fixed bottom-0 right-0 top-14 z-40 flex min-h-0 flex-col border-l border-line bg-canvas shadow-2xl shadow-black/50 transition-[width,left] duration-200",
          expanded
            ? "left-0 w-full max-w-none sm:left-3 sm:right-3 sm:top-[3.75rem] sm:bottom-3 sm:w-auto sm:rounded-2xl sm:border"
            : "w-[min(420px,100vw)] max-w-[100vw]",
        )}
        aria-label={`Chat with ${workerName}`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-ink">
              <MessageSquare className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">
                Chat with {workerName}
              </p>
              <p className="flex items-center gap-1 text-[11px] text-subtle">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Available · lead & webinar context
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Restore chat size" : "Expand chat"}
              title={expanded ? "Restore" : "Expand"}
              className="grid size-8 place-items-center rounded-md text-subtle hover:bg-well hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              title="Close"
              className="grid size-8 place-items-center rounded-md text-subtle hover:bg-well hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {empty ? (
            <div className="flex h-full flex-col items-center justify-center px-2 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-ink">
                <Sparkles className="size-6" />
              </span>
              <p className="mt-4 text-[15px] font-semibold text-ink">
                Ask about a lead, webinar, or handoff
              </p>
              <p className="mt-1.5 max-w-[280px] text-[12px] leading-relaxed text-subtle">
                Preview answers use mock pool data. Live Interakt chat arrives with the backend branch.
              </p>
              <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s.prompt}
                    type="button"
                    onClick={() => submit(s.prompt)}
                    className="rounded-full border border-white/[0.1] bg-well px-2.5 py-1 text-[11px] text-ink-3 transition-colors hover:border-indigo-500/35 hover:bg-well hover:text-ink"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col gap-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                      msg.role === "user"
                        ? "rounded-br-md bg-brand text-white"
                        : "rounded-bl-md border border-line bg-well text-ink-2",
                    )}
                  >
                    {msg.role === "user" ? (
                      <span className="whitespace-pre-wrap">{msg.text}</span>
                    ) : (
                      <AnswerMarkdown text={msg.text} />
                    )}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-line bg-well px-4 py-3">
                    <TypingIndicator variant="gradient" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
          className="shrink-0 border-t border-line p-3"
        >
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-well px-3 py-2 transition-colors focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-brand/25">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask Joe about leads, webinars, or handoffs…"
              aria-label="Chat message"
              disabled={pending}
              className="min-w-0 flex-1 bg-transparent py-1 text-[13px] text-ink placeholder:text-subtle focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={pending || !text.trim()}
              aria-label="Send message"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white transition-colors hover:bg-brand-strong disabled:cursor-not-allowed disabled:bg-well disabled:text-subtle"
            >
              <ArrowUp className="size-3.5" />
            </button>
          </div>
          <p className="mt-2 px-1 text-[10px] text-slate-600">
            Preview · Enter to send · does not message leads
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => submit(c.prompt)}
                disabled={pending}
                className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-brand/30 hover:text-ink-2 disabled:opacity-40"
              >
                {c.label}
              </button>
            ))}
          </div>
        </form>
      </aside>
    </>
  );
}
