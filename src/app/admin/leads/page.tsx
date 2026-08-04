import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EnquiryRow } from "@/components/admin/EnquiryRow";
import { Search } from "lucide-react";

// Underlying enum stays new/contacted/quoted/won/lost (stable, low-risk),
// but we display it with labels and colors that match the studio's workflow.
const STATUS_META: Record<string, { label: string; active: string }> = {
  new: { label: "New", active: "border-brand-600 bg-brand-50 text-brand-700" },
  contacted: { label: "Following Up", active: "border-blue-600 bg-blue-50 text-blue-700" },
  quoted: { label: "Proposal Sent", active: "border-amber-600 bg-amber-50 text-amber-700" },
  won: { label: "Booked", active: "border-green-600 bg-green-50 text-green-700" },
  lost: { label: "Lost", active: "border-red-600 bg-red-50 text-red-700" },
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
          <p className="mt-1 text-sm text-ink/50">Landing page · leads · analytics · integrations</p>
        </div>
        <Link href="/admin/leads/new">
          <Button>+ New Enquiry</Button>
        </Link>
      </div>

      {/* Sub-tabs */}
      <div className="mt-4 flex gap-1 border-b border-black/5">
        <div className="border-b-2 border-brand-700 px-3 py-2 text-sm font-medium text-brand-800">
          Enquiries
        </div>
        <Link
          href="/admin/leads/landing-page"
          className="px-3 py-2 text-sm text-ink/50 hover:text-ink/70"
        >
          Landing Page
        </Link>
      </div>

      {/* Status pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href="/admin/leads"
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            !statusFilter ? "border-ink/70 bg-ink/5 text-ink" : "border-black/10 text-ink/50 hover:border-black/20"
          }`}
        >
          All: {allLeads.length}
        </Link>
        {Object.entries(STATUS_META).map(([value, meta]) => (
          <Link
            key={value}
            href={`/admin/leads?status=${value}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              statusFilter === value ? meta.active : "border-black/10 text-ink/50 hover:border-black/20"
            }`}
          >
            {meta.label}: {counts[value] || 0}
          </Link>
        ))}
        <span className="ml-auto text-xs text-ink/35">Showing {leads.length} of {allLeads.length}</span>
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
              <EnquiryRow
                key={lead.id}
                lead={{
                  id: lead.id,
                  fullName: lead.fullName,
                  email: lead.email,
                  phone: lead.phone,
                  eventType: lead.eventType,
                  eventDateISO: lead.eventDate ? lead.eventDate.toISOString() : null,
                  budgetRange: lead.budgetRange,
                  quoteAmount: lead.quoteAmount ? Number(lead.quoteAmount) : null,
                  source: lead.source,
                  status: lead.status,
                  notes: lead.notes,
                  createdAtISO: lead.createdAt.toISOString(),
                }}
              />
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
