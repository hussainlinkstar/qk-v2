"use client";

import { WhatsappSalesCockpitShell } from "@/components/whatsapp-sales/cockpit-shell";
import { WhatsappSalesOverview } from "@/components/whatsapp-sales/overview";
import { useWhatsappSalesWorkerName } from "@/components/whatsapp-sales/use-worker-name";

export default function WhatsappSalesOverviewPage() {
  const { agentId, workerName } = useWhatsappSalesWorkerName();

  return (
    <WhatsappSalesCockpitShell agentId={agentId} workerName={workerName} active="overview">
      <WhatsappSalesOverview agentId={agentId} workerName={workerName} />
    </WhatsappSalesCockpitShell>
  );
}
