"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { Input } from "@/components/cockpit/controls";
import {
  MOCK_LOGIN,
  setMockAuthenticated,
  validateMockLogin,
} from "@/lib/mock-auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(MOCK_LOGIN.email);
  const [password, setPassword] = useState(MOCK_LOGIN.password);
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
    <div className="flex min-h-dvh items-center justify-center bg-[#05070d] px-4 text-slate-200">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-3 grid size-11 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <MessageSquare className="size-5" />
          </span>
          <h1 className="text-lg font-semibold text-white">Joe — WhatsApp Sales</h1>
          <p className="mt-1 text-[13px] text-slate-500">Joseph Mews · Preview login</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-white/[0.07] bg-[#0c1018] p-5 shadow-xl"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Email
            </span>
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Password
            </span>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error && (
            <p className="mb-3 text-[13px] text-red-400" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-500 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 disabled:opacity-60"
          >
            Sign in
          </button>

          <div className="mt-4 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-[12px] text-slate-400">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Demo credentials
            </p>
            <p>
              <span className="text-slate-500">Email</span>{" "}
              <span className="font-mono text-slate-200">{MOCK_LOGIN.email}</span>
            </p>
            <p>
              <span className="text-slate-500">Password</span>{" "}
              <span className="font-mono text-slate-200">{MOCK_LOGIN.password}</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
