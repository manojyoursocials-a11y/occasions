import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";

export default async function AdminDashboard() {
  const [leadCount, projectCount, projects, leads] = await Promise.all([
    prisma.lead.count({ where: { status: "new" } }),
    prisma.project.count(),
    prisma.project.findMany({ orderBy: { eventDate: "asc" }, take: 5 }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const totalQuoted = projects.reduce((sum, p) => sum + Number(p.totalQuote), 0);
  const totalCollected = projects.reduce((sum, p) => sum + Number(p.amountPaid), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink">Studio Overview</h1>
      <p className="mt-1 text-sm text-ink/50">A snapshot of your pipeline, right now</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New Leads" value={leadCount} sub="awaiting response" />
        <StatCard label="Active Projects" value={projectCount} sub="booked events" />
        <StatCard label="Total Quoted" value={formatINR(totalQuoted)} />
        <StatCard label="Collected" value={formatINR(totalCollected)} sub="across all projects" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <p className="text-sm font-semibold text-ink">Recent Leads</p>
            <a href="/admin/leads" className="text-xs text-brand-700 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-black/5">
            {leads.length === 0 && <p className="px-5 py-4 text-sm text-ink/50">No leads yet.</p>}
            {leads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{lead.fullName}</p>
                  <p className="text-xs text-ink/40">
                    {lead.eventType || "Event"} · {lead.eventDate ? formatDate(lead.eventDate.toISOString()) : "date TBD"}
                  </p>
                </div>
                <Badge tone="brand">{lead.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <p className="text-sm font-semibold text-ink">Upcoming Events</p>
            <a href="/admin/clients" className="text-xs text-brand-700 hover:underline">View all</a>
          </div>
          <div className="divide-y divide-black/5">
            {projects.length === 0 && <p className="px-5 py-4 text-sm text-ink/50">No projects yet.</p>}
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-ink/40">{formatDate(p.eventDate.toISOString())}</p>
                </div>
                <Badge tone={p.contractStatus === "signed" ? "green" : "red"}>{p.contractStatus}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
