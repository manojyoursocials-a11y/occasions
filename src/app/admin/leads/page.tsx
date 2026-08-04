import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { formatDate } from "@/lib/utils";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Enquiries</h1>
          <p className="mt-1 text-sm text-ink/50">Turn enquiries into bookings, fast</p>
        </div>
        <Link href="/admin/leads/new">
          <Button>+ New Enquiry</Button>
        </Link>
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
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {leads.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-6 text-center text-ink/50">No enquiries captured yet.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-5 py-3 font-medium text-ink">{lead.fullName}</td>
                <td className="px-5 py-3 text-ink/60">
                  {lead.eventType || "—"}{lead.eventDate ? ` · ${formatDate(lead.eventDate.toISOString())}` : ""}
                </td>
                <td className="px-5 py-3 text-ink/60">{lead.source}</td>
                <td className="px-5 py-3"><LeadStatusSelect leadId={lead.id} status={lead.status} /></td>
                <td className="px-5 py-3 text-ink/40">{formatDate(lead.createdAt.toISOString())}</td>
                <td className="px-5 py-3">
                  {(lead.status === "quoted" || lead.status === "won") && (
                    <Link
                      href={`/admin/clients/new?leadId=${lead.id}&fullName=${encodeURIComponent(lead.fullName)}&email=${encodeURIComponent(lead.email || "")}&eventType=${encodeURIComponent(lead.eventType || "Wedding")}&eventDate=${lead.eventDate ? lead.eventDate.toISOString().slice(0, 10) : ""}`}
                      className="text-xs font-medium text-brand-700 hover:underline"
                    >
                      Convert to Project →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
