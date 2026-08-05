import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";
import { Search, FolderOpen, Wallet, TrendingUp } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Following Up",
  quoted: "Proposal Sent",
  won: "Booked",
  lost: "Lost",
};

export default async function AdminDashboard() {
  const [leadCount, projectCount, allProjects, recentLeads, allLeads, duePayments] = await Promise.all([
    prisma.lead.count({ where: { status: "new" } }),
    prisma.project.count(),
    prisma.project.findMany({ orderBy: { eventDate: "asc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.lead.findMany(),
    prisma.paymentInstallment.findMany({
      where: { status: { in: ["due_soon", "overdue", "pending"] } },
      include: { project: true },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
  ]);

  const totalQuoted = allProjects.reduce((sum, p) => sum + Number(p.totalQuote), 0);
  const totalCollected = allProjects.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const totalOutstanding = totalQuoted - totalCollected;

  const funnelCounts: Record<string, number> = {};
  for (const lead of allLeads) funnelCounts[lead.status] = (funnelCounts[lead.status] || 0) + 1;

  const upcoming = allProjects
    .filter((p) => p.eventDate >= new Date())
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink">Studio Overview</h1>
      <p className="mt-1 text-sm text-ink/50">Everything across your enquiries and projects, at a glance</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New Enquiries" value={leadCount} sub="awaiting response" icon={Search} tone="brand" />
        <StatCard label="Active Projects" value={projectCount} sub="booked events" icon={FolderOpen} tone="blue" />
        <StatCard label="Collected" value={formatINR(totalCollected)} sub={`of ${formatINR(totalQuoted)} quoted`} icon={Wallet} tone="green" />
        <StatCard label="Outstanding" value={formatINR(totalOutstanding)} sub="still to collect" icon={TrendingUp} tone="amber" />
      </div>

      {/* Enquiry funnel */}
      <Card className="mt-6">
        <p className="mb-3 text-sm font-semibold text-ink">Enquiry Funnel</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <Link
              key={value}
              href={`/admin/leads?status=${value}`}
              className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-ink/60 hover:border-brand-300 hover:text-brand-700"
            >
              {label}: {funnelCounts[value] || 0}
            </Link>
          ))}
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <p className="text-sm font-semibold text-ink">Recent Enquiries</p>
            <Link href="/admin/leads" className="text-xs text-brand-700 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-black/5">
            {recentLeads.length === 0 && <p className="px-5 py-4 text-sm text-ink/50">No leads yet.</p>}
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{lead.fullName}</p>
                  <p className="text-xs text-ink/40">
                    {lead.eventType || "Event"} · {lead.eventDate ? formatDate(lead.eventDate.toISOString()) : "date TBD"}
                  </p>
                </div>
                <Badge tone="brand">{STATUS_LABELS[lead.status] || lead.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
            <p className="text-sm font-semibold text-ink">Upcoming Events</p>
            <Link href="/admin/clients" className="text-xs text-brand-700 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-black/5">
            {upcoming.length === 0 && <p className="px-5 py-4 text-sm text-ink/50">No upcoming events.</p>}
            {upcoming.map((p) => (
              <Link key={p.id} href={`/admin/clients/${p.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-black/[0.02]">
                <div>
                  <p className="text-sm font-medium text-ink">{p.title}</p>
                  <p className="text-xs text-ink/40">{formatDate(p.eventDate.toISOString())}</p>
                </div>
                <Badge tone={p.contractStatus === "signed" ? "green" : "red"}>{p.contractStatus}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-0">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <p className="text-sm font-semibold text-ink">Payments Needing Attention</p>
          <Link href="/admin/payments" className="text-xs text-brand-700 hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-black/5">
          {duePayments.length === 0 && <p className="px-5 py-4 text-sm text-ink/50">Nothing due right now.</p>}
          {duePayments.map((row) => (
            <div key={row.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{row.project.title} — {row.label}</p>
                <p className="text-xs text-ink/40">Due {formatDate(row.dueDate.toISOString())}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">{formatINR(Number(row.amount))}</p>
                <Badge tone={row.status === "overdue" ? "red" : "amber"}>{row.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
