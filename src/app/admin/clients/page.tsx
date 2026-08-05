import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProject } from "@/lib/actions/projects";
import { getSession } from "@/lib/get-session";
import { formatINR, formatDate } from "@/lib/utils";

export default async function ClientsPage() {
  const projects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { eventDate: "asc" },
  });

  const session = await getSession();
  const currentUser = session?.user
    ? await prisma.user.findUnique({ where: { id: session.user.id } })
    : null;
  const canDelete = Boolean(currentUser?.canDelete || currentUser?.isOwner);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Projects</h1>
          <p className="mt-1 text-sm text-ink/50">Every booked couple, one place</p>
        </div>
        <Link href="/admin/clients/new">
          <Button>+ New Project</Button>
        </Link>
      </div>

      <Card className="mt-6 p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-5 py-3 font-medium">Project</th>
              <th className="px-5 py-3 font-medium">Client</th>
              <th className="px-5 py-3 font-medium">Event Date</th>
              <th className="px-5 py-3 font-medium">Quote</th>
              <th className="px-5 py-3 font-medium">Contract</th>
              {canDelete && <th className="px-5 py-3 font-medium">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {projects.length === 0 && (
              <tr><td colSpan={canDelete ? 6 : 5} className="px-5 py-6 text-center text-ink/50">No projects yet.</td></tr>
            )}
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-black/[0.02]">
                <td className="px-5 py-3 font-medium text-ink">
                  <Link href={`/admin/clients/${p.id}`} className="hover:underline">{p.title}</Link>
                </td>
                <td className="px-5 py-3 text-ink/60">{p.client?.fullName || "Unassigned"}</td>
                <td className="px-5 py-3 text-ink/60">{formatDate(p.eventDate.toISOString())}</td>
                <td className="px-5 py-3 text-ink/60">{formatINR(Number(p.totalQuote))}</td>
                <td className="px-5 py-3"><Badge tone={p.contractStatus === "signed" ? "green" : "red"}>{p.contractStatus}</Badge></td>
                {canDelete && (
                  <td className="px-5 py-3">
                    <DeleteButton
                      action={deleteProject.bind(null, p.id)}
                      confirmMessage={`Delete "${p.title}"? This removes its payments, schedule, deliverables, and everything else tied to it. This can't be undone.`}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
