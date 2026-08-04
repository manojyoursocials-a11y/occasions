import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LeadStatusSelect } from "@/components/admin/LeadStatusSelect";
import { formatDate } from "@/lib/utils";
import { Search } from "lucide-react";

// Underlying enum stays new/contacted/quoted/won/lost (stable, low-risk),
// but we display it with labels that match the studio's actual workflow.
const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Following Up",
  quoted: "Proposal Sent",
  won: "Booked",
  lost: "Lost",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const statusFilter = params.status || "";

  const allLeads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });

  const counts: Record<string, number> = {};
  for (const lead of allLeads) counts[lead.status] = (counts[lead.status] || 0) + 1;

  const leads = allLeads.filter((lead) => {
    const matchesStatus = !statusFilter || lead.status === statusFilter;
    const matchesQuery =
      !q ||
      lead.fullName.toLowerCase().includes(q.toLowerCase()) ||
      (lead.phone || "").includes(q) ||
      (lead.email || "").toLowerCase().includes(q.toLowerCase()) ||
      (lead.eventType || "").toLowerCase().includes(q.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Enquiries</h1>
          <p className="mt-1 text-sm text-ink/50">Turn enquiries into bookings, fast</p>
        </div>
        <Link href="/admin/leads/new">
          <Button>+ New Enquiry</Button>
        </Link>
      </div>

      {/* Status pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/leads"
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            !statusFilter ? "border-brand-600 bg-brand-50 text-brand-700" : "border-black/10 text-ink/60"
          }`}
        >
          All: {allLeads.length}
        </Link>
        {Object.entries(STATUS_LABELS).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/leads?status=${value}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              statusFilter === value ? "border-brand-600 bg-brand-50 text-brand-700" : "border-black/10 text-ink/60"
            }`}
          >
            {label}: {counts[value] || 0}
          </Link>
        ))}
      </div>

      {/* Search */}
      <form className="mt-4 flex items-center gap-2" action="/admin/leads">
        {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, contact, event…"
            className="focus-ring w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card className="mt-4 p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-5 py-3 font-medium">Received</th>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Event</th>
              <th className="px-5 py-3 font-medium">Budget</th>
              <th className="px-5 py-3 font-medium">Source</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {leads.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-6 text-center text-ink/50">No enquiries match.</td></tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-5 py-3 text-ink/60">{formatDate(lead.createdAt.toISOString())}</td>
                <td className="px-5 py-3 font-medium text-ink">{lead.fullName}</td>
                <td className="px-5 py-3 text-ink/60">{lead.phone || lead.email || "—"}</td>
                <td className="px-5 py-3 text-ink/60">
                  {lead.eventType || "—"}{lead.eventDate ? ` · ${formatDate(lead.eventDate.toISOString())}` : ""}
                </td>
                <td className="px-5 py-3 text-ink/60">{lead.budgetRange || (lead.quoteAmount ? `₹${lead.quoteAmount}` : "—")}</td>
                <td className="px-5 py-3 text-ink/60">{lead.source}</td>
                <td className="px-5 py-3"><LeadStatusSelect leadId={lead.id} status={lead.status} /></td>
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
