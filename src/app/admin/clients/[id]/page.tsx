import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatINR, formatDate } from "@/lib/utils";
import { markContractSigned, sendContract } from "@/lib/actions/projects";
import { ProjectTabs, type ProjectTabsData } from "@/components/admin/ProjectTabs";
import { ChevronLeft } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      installments: { orderBy: { dueDate: "asc" } },
      assignments: { include: { teamMember: true } },
      deliverables: { include: { editor: true } },
      schedule: { orderBy: { sortOrder: "asc" } },
      contract: true,
    },
  });

  if (!project) notFound();

  const teamMembers = await prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { fullName: "asc" },
  });

  // Convert Decimal/Date fields to plain, client-serializable values.
  const data: ProjectTabsData = {
    id: project.id,
    title: project.title,
    eventType: project.eventType,
    eventDateISO: project.eventDate.toISOString(),
    venue: project.venue,
    totalQuote: Number(project.totalQuote),
    amountPaid: Number(project.amountPaid),
    contractStatus: project.contractStatus,
    client: project.client
      ? { fullName: project.client.fullName, email: project.client.email, phone: project.client.phone }
      : null,
    installments: project.installments.map((row) => ({
      id: row.id,
      label: row.label,
      amount: Number(row.amount),
      dueDateISO: row.dueDate.toISOString(),
      status: row.status,
    })),
    assignments: project.assignments.map((a) => ({
      id: a.id,
      shootLabel: a.shootLabel,
      teamMember: { fullName: a.teamMember.fullName, role: a.teamMember.role },
    })),
    deliverables: project.deliverables.map((d) => ({
      id: d.id,
      title: d.title,
      status: d.status,
      editor: d.editor ? { fullName: d.editor.fullName } : null,
    })),
    schedule: project.schedule.map((s) => ({
      id: s.id,
      title: s.title,
      eventDateISO: s.eventDate.toISOString(),
      startTime: s.startTime,
      location: s.location,
    })),
    contract: project.contract
      ? {
          fileUrl: project.contract.fileUrl,
          sentAtISO: project.contract.sentAt ? project.contract.sentAt.toISOString() : null,
          signedAtISO: project.contract.signedAt ? project.contract.signedAt.toISOString() : null,
        }
      : null,
    teamMembers: teamMembers.map((m) => ({ id: m.id, fullName: m.fullName, role: m.role })),
  };

  const sendContractWithId = sendContract.bind(null, project.id);
  const markSignedWithId = markContractSigned.bind(null, project.id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-ink/50 hover:text-ink/70">
        <ChevronLeft className="h-4 w-4" /> Back to Projects
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{project.title}</h1>
          <p className="mt-1 text-sm text-ink/50">
            {project.eventType} · {formatDate(project.eventDate.toISOString())}
            {project.venue ? ` · ${project.venue}` : ""}
          </p>
        </div>
        <Badge tone={project.contractStatus === "signed" ? "green" : "red"}>{project.contractStatus}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardLabel>Total Quote</CardLabel>
          <p className="text-xl font-semibold text-ink">{formatINR(Number(project.totalQuote))}</p>
        </Card>
        <Card>
          <CardLabel>Paid So Far</CardLabel>
          <p className="text-xl font-semibold text-green-600">{formatINR(Number(project.amountPaid))}</p>
        </Card>
        <Card>
          <CardLabel>Client</CardLabel>
          <p className="text-sm font-medium text-ink">{project.client?.fullName || "Unassigned"}</p>
          <p className="text-xs text-ink/40">{project.client?.email}</p>
        </Card>
      </div>

      <ProjectTabs project={data} sendContractAction={sendContractWithId} markSignedAction={markSignedWithId} />
    </div>
  );
}
