"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Legacy full-page add route — redirect to webinars list with new=1 modal. */
export default function WhatsappSalesNewWebinarRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/webinars?new=1");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center bg-[#05070d] text-sm text-slate-500">
      Opening add webinar…
    </div>
  );
}
