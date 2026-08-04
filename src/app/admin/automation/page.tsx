import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Zap } from "lucide-react";
import { TriggerAutomationButton } from "@/components/admin/TriggerAutomationButton";

export default async function AutomationPage() {
  const events = await prisma.automationEvent.findMany({
    include: { project: true },
    orderBy: { sentAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink">Automation</h1>
      <p className="mt-1 text-sm text-ink/50">Automated follow-ups, at every step</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-ink">Quote Follow-up</p>
          <p className="mt-1 text-xs text-ink/40">WhatsApp + Email, 24h after quote sent</p>
          <Badge tone="green" className="mt-3">Active</Badge>
          <TriggerAutomationButton template="quote_followup" channel="whatsapp" />
        </Card>
        <Card>
          <p className="text-sm font-medium text-ink">Payment Reminder</p>
          <p className="mt-1 text-xs text-ink/40">Email, 3 days before installment due</p>
          <Badge tone="green" className="mt-3">Active</Badge>
          <TriggerAutomationButton template="payment_reminder" channel="email" />
        </Card>
        <Card>
          <p className="text-sm font-medium text-ink">Contract Nudge</p>
          <p className="mt-1 text-xs text-ink/40">WhatsApp, 48h after contract sent</p>
          <Badge tone="green" className="mt-3">Active</Badge>
          <TriggerAutomationButton template="contract_nudge" channel="whatsapp" />
        </Card>
      </div>

      <Card className="mt-6 p-0">
        <div className="flex items-center gap-2 border-b border-black/5 px-5 py-4">
          <Zap className="h-4 w-4 text-brand-600" />
          <p className="text-sm font-semibold text-ink">Recent Activity</p>
        </div>
        <div className="divide-y divide-black/5">
          {events.length === 0 && <p className="px-5 py-4 text-sm text-ink/50">No automation runs yet.</p>}
          {events.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <span className="text-ink/70">
                {e.template.replace("_", " ")} · {e.channel}
                {e.project ? ` · ${e.project.title}` : ""}
              </span>
              <span className="text-ink/40">{formatDate(e.sentAt.toISOString())}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
