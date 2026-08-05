import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { formatINR } from "@/lib/utils";
import { Percent, IndianRupee, Users, CalendarClock } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Following Up",
  quoted: "Proposal Sent",
  won: "Booked",
  lost: "Lost",
};

const STATUS_BAR_COLOR: Record<string, string> = {
  new: "bg-brand-500",
  contacted: "bg-blue-500",
  quoted: "bg-amber-500",
  won: "bg-green-500",
  lost: "bg-red-400",
};

export default async function DataPage() {
  const [leads, projects, installments] = await Promise.all([
    prisma.lead.findMany(),
    prisma.project.findMany(),
    prisma.paymentInstallment.findMany(),
  ]);

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === "won").length;
  const conversionRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;

  const statusCounts: Record<string, number> = {};
  for (const l of leads) statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
  const maxStatusCount = Math.max(1, ...Object.values(statusCounts));

  const sourceCounts: Record<string, number> = {};
  for (const l of leads) sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  const maxSourceCount = Math.max(1, ...Object.values(sourceCounts));

  const totalQuoted = projects.reduce((sum, p) => sum + Number(p.totalQuote), 0);
  const totalCollected = projects.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  const avgProjectValue = projects.length ? Math.round(totalQuoted / projects.length) : 0;

  const now = new Date();
  const in90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const upcomingEvents = projects.filter((p) => p.eventDate >= now && p.eventDate <= in90Days).length;

  const overdueCount = installments.filter((i) => i.status === "overdue").length;
  const dueSoonCount = installments.filter((i) => i.status === "due_soon").length;

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Data</h1>
      <p className="mt-1 text-sm text-ink/50">Reports across your enquiries, projects, and revenue</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} sub={`${wonLeads} of ${totalLeads} enquiries`} icon={Percent} tone="brand" />
        <StatCard label="Avg. Project Value" value={formatINR(avgProjectValue)} sub={`across ${projects.length} projects`} icon={IndianRupee} tone="blue" />
        <StatCard label="Upcoming Events" value={upcomingEvents} sub="in the next 90 days" icon={CalendarClock} tone="green" />
        <StatCard label="Payments Due Soon" value={dueSoonCount + overdueCount} sub={`${overdueCount} overdue`} icon={Users} tone="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardLabel>Enquiries by Status</CardLabel>
          <div className="space-y-3">
            {Object.entries(STATUS_LABELS).map(([value, label]) => {
              const count = statusCounts[value] || 0;
              return (
                <div key={value}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-ink/70">{label}</span>
                    <span className="font-medium text-ink">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className={`h-full rounded-full ${STATUS_BAR_COLOR[value]}`}
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {totalLeads === 0 && <p className="text-sm text-ink/50">No enquiries yet.</p>}
          </div>
        </Card>

        <Card>
          <CardLabel>Enquiries by Source</CardLabel>
          <div className="space-y-3">
            {Object.entries(sourceCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <div key={source}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="capitalize text-ink/70">{source.replace("_", " ")}</span>
                    <span className="font-medium text-ink">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(count / maxSourceCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            {totalLeads === 0 && <p className="text-sm text-ink/50">No enquiries yet.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <CardLabel>Revenue</CardLabel>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-ink/40">Total Quoted</p>
            <p className="font-heading text-xl font-bold text-ink">{formatINR(totalQuoted)}</p>
          </div>
          <div>
            <p className="text-xs text-ink/40">Total Collected</p>
            <p className="font-heading text-xl font-bold text-green-600">{formatINR(totalCollected)}</p>
          </div>
          <div>
            <p className="text-xs text-ink/40">Outstanding</p>
            <p className="font-heading text-xl font-bold text-ink">{formatINR(totalQuoted - totalCollected)}</p>
          </div>
        </div>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/5">
          <div
            className="h-full rounded-full bg-green-500"
            style={{ width: `${totalQuoted ? Math.min((totalCollected / totalQuoted) * 100, 100) : 0}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
