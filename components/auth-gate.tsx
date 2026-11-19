"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isMockAuthenticated } from "@/lib/mock-auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const isLogin = pathname === "/login";

  useEffect(() => {
    const authed = isMockAuthenticated();
    if (!authed && !isLogin) {
      router.replace("/login");
      return;
    }
    if (authed && isLogin) {
      router.replace("/");
      return;
    }
    setReady(true);
  }, [isLogin, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-muted">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
