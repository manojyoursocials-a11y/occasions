import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function PortalTeamPage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const assignments = project
    ? await prisma.projectAssignment.findMany({
        where: { projectId: project.id },
        include: { teamMember: true },
      })
    : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Your Team</h1>
      <p className="mt-1 text-sm text-ink/50">Who&apos;s covering your event</p>

      <div className="mt-6 space-y-3">
        {assignments.length === 0 && (
          <Card><p className="text-sm text-ink/50">Crew hasn&apos;t been assigned yet.</p></Card>
        )}
        {assignments.map((a) => (
          <Card key={a.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink">{a.teamMember.fullName}</p>
              <p className="text-xs text-ink/40">{a.shootLabel}</p>
            </div>
            <Badge tone="brand">{a.teamMember.role}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
