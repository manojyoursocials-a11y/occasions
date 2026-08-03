import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const TONE = { new: "brand", contacted: "amber", quoted: "gray", won: "green", lost: "red" } as const;

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Leads</h1>
          <p className="mt-1 text-sm text-ink/50">Turn enquiries into bookings, fast</p>
        </div>
        <Button>+ New Lead</Button>
      </div>

      <Card className="mt-6 p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Received</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {leads.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-ink/50">No leads captured yet.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-5 py-3 font-medium text-ink">{lead.fullName}</td>
                <td className="px-5 py-3 text-ink/60">
                  {lead.eventType || "—"}{lead.eventDate ? ` · ${formatDate(lead.eventDate.toISOString())}` : ""}
                </td>
                <td className="px-5 py-3 text-ink/60">{lead.source}</td>
                <td className="px-5 py-3"><Badge tone={TONE[lead.status]}>{lead.status}</Badge></td>
                <td className="px-5 py-3 text-ink/40">{formatDate(lead.createdAt.toISOString())}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
