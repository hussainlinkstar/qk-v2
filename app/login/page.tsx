"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { Input } from "@/components/cockpit/controls";
import { QikoMark } from "@/components/brand/qiko-mark";
import { ThemeToggle } from "@/components/theme-toggle";
import { setMockAuthenticated, validateMockLogin } from "@/lib/mock-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    if (!validateMockLogin(email, password)) {
      setError("Invalid email or password.");
      setSubmitting(false);
      return;
    }
    setMockAuthenticated(true);
    router.replace("/");
  }

  return (
    <div className="relative flex min-h-dvh bg-canvas text-ink">
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      {/* Left brand panel — CRM / Pulse style */}
      <aside className="relative hidden w-[48%] overflow-hidden border-r border-line lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
        <div
          className="login-orb pointer-events-none absolute -left-16 -top-20 size-[320px] rounded-full opacity-70 blur-3xl"
          style={{ background: "color-mix(in srgb, var(--brand-blue) 35%, transparent)" }}
        />
        <div
          className="login-orb-alt pointer-events-none absolute -bottom-24 -right-10 size-[280px] rounded-full opacity-60 blur-3xl"
          style={{ background: "color-mix(in srgb, var(--brand-violet) 30%, transparent)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(165deg, color-mix(in srgb, var(--brand-soft) 70%, var(--canvas)) 0%, var(--canvas) 58%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in srgb, var(--brand) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in srgb, var(--brand) 8%, transparent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10">
          <QikoMark withWordmark wordmark="Qiko · Joe" size={32} />
          <span className="login-pill-shimmer mt-6 inline-flex items-center gap-1.5 rounded-full border border-brand-ring px-3 py-1 text-[12px] font-medium text-brand-ink shadow-sm backdrop-blur">
            <Sparkles className="login-sparkle size-3.5 text-brand" />
            AI-powered WhatsApp sales cockpit
          </span>
          <h1 className="mt-6 max-w-[18ch] text-[2.35rem] font-semibold leading-[1.15] tracking-[-0.03em] text-ink xl:text-[2.75rem]">
            Every lead signal,{" "}
            <span className="login-gradient-text">
              turned into your next move.
            </span>
          </h1>
          <p className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-muted">
            Webinar interest, replies and handoffs flow into one workspace — Joe tells you who deserves attention today.
          </p>
        </div>

        <div className="relative z-10 mt-10 rounded-2xl border border-line bg-surface/90 p-5 shadow-[var(--shadow-md)] backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">Your top priorities</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-medium text-success">
              <span className="login-live-dot size-1.5 rounded-full bg-success" />
              Live
            </span>
          </div>
          <ul className="space-y-2.5 text-[13px] text-ink-2">
            <li className="login-priority-row flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5">
              <span>Review high-intent WhatsApp replies</span>
              <span className="shrink-0 rounded-md bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-danger">High</span>
            </li>
            <li className="login-priority-row flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5">
              <span>Accept handoffs waiting on the team</span>
              <span className="shrink-0 rounded-md bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-danger">High</span>
            </li>
            <li className="login-priority-row flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5">
              <span>Check upcoming relevant webinars</span>
              <span className="shrink-0 rounded-md bg-warning-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase text-warning">Med</span>
            </li>
          </ul>
          <p className="login-ask-glow mt-4 flex items-center gap-2 rounded-xl border border-brand-ring/60 bg-brand-soft px-3 py-2 text-[12.5px] text-brand-ink">
            <Sparkles className="login-sparkle size-3.5 shrink-0 text-brand" />
            Ask Joe: “Which leads should I follow up with first?”
          </p>
        </div>
      </aside>

      {/* Right form */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <QikoMark withWordmark wordmark="Qiko · Joe" size={30} />
        </div>

        <div className="w-full max-w-[400px] rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-md)] sm:p-7">
          <h2 className="text-[1.35rem] font-semibold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-1 text-[13.5px] text-muted">Sign in to your Joe WhatsApp Sales workspace.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink-3">Work email</span>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink-3">Password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
                <Input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </label>

            {error && (
              <p className="text-[13px] text-danger" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-brand-gradient px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign in"}
              {!submitting && <ArrowRight className="size-4" />}
            </button>
          </form>

          <p className="mt-5 text-center text-[12px] text-subtle">
            Preview login · demo@qiko.ai
          </p>
        </div>

        <p className="mt-8 text-[12px] text-subtle">
          © Qiko · Joseph Mews WhatsApp Sales preview
        </p>
      </main>
    </div>
  );
}
