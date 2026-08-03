import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";

export default async function ClientsPage() {
  const projects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { eventDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Clients & Projects</h1>
      <p className="mt-1 text-sm text-ink/50">Every booked couple, one place</p>

      <Card className="mt-6 p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Event Date</th>
              <th className="px-5 py-3 font-medium">Quote</th>
              <th className="px-5 py-3 font-medium">Contract</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {projects.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-ink/50">No projects yet.</td></tr>
            )}
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3 font-medium text-ink">{p.title}</td>
                <td className="px-5 py-3 text-ink/60">{p.client?.fullName || "Unassigned"}</td>
                <td className="px-5 py-3 text-ink/60">{formatDate(p.eventDate.toISOString())}</td>
                <td className="px-5 py-3 text-ink/60">{formatINR(Number(p.totalQuote))}</td>
                <td className="px-5 py-3"><Badge tone={p.contractStatus === "signed" ? "green" : "red"}>{p.contractStatus}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
