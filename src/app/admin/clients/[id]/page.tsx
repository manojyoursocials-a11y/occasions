import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/FormField";
import { MarkPaidButton } from "@/components/admin/MarkPaidButton";
import { formatINR, formatDate } from "@/lib/utils";
import { markContractSigned, sendContract } from "@/lib/actions/projects";
import { assignTeamMember } from "@/lib/actions/team";
import { createInstallment } from "@/lib/actions/payments";
import { ChevronLeft } from "lucide-react";

const PAYMENT_TONE = { pending: "gray", due_soon: "amber", overdue: "red", paid: "green" } as const;

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
      contract: true,
    },
  });

  if (!project) notFound();

  const teamMembers = await prisma.teamMember.findMany({
    where: { active: true },
    orderBy: { fullName: "asc" },
  });

  const signed = project.contractStatus === "signed";

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
        <Badge tone={signed ? "green" : "red"}>{project.contractStatus}</Badge>
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

      {/* Contract */}
      <Card className="mt-6">
        <div className="flex items-center justify-between">
          <CardLabel>Contract</CardLabel>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!signed && !project.contract && (
            <form action={sendContractWithId} className="flex flex-1 items-center gap-2">
              <Input name="fileUrl" placeholder="Paste contract link (Drive, DocuSign, etc.)" className="flex-1" />
              <Button type="submit" variant="secondary">Mark as Sent</Button>
            </form>
          )}
          {!signed && project.contract && (
            <form action={markSignedWithId}>
              <Button type="submit" variant="secondary">Mark Signed</Button>
            </form>
          )}
          {signed && <p className="text-sm text-green-600">Signed {project.contract?.signedAt ? formatDate(project.contract.signedAt.toISOString()) : ""}</p>}
        </div>
      </Card>

      {/* Team */}
      <Card className="mt-4">
        <CardLabel>Team Assigned</CardLabel>
        <div className="space-y-2">
          {project.assignments.length === 0 && <p className="text-sm text-ink/50">No crew assigned yet.</p>}
          {project.assignments.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
              <span className="text-sm text-ink">{a.teamMember.fullName}</span>
              <Badge tone="brand">{a.teamMember.role}</Badge>
            </div>
          ))}
        </div>
        <form action={assignTeamMember} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <Select name="teamMemberId" required className="w-auto flex-1">
            <option value="">Assign crew member…</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>{m.fullName} — {m.role}</option>
            ))}
          </Select>
          <Input name="shootLabel" placeholder="Shoot label (optional)" className="w-auto flex-1" />
          <Button type="submit" variant="secondary">Assign</Button>
        </form>
      </Card>

      {/* Payments */}
      <Card className="mt-4">
        <CardLabel>Payment Schedule</CardLabel>
        <div className="divide-y divide-black/5">
          {project.installments.length === 0 && <p className="py-2 text-sm text-ink/50">No installments scheduled.</p>}
          {project.installments.map((row) => (
            <div key={row.id} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-ink">{row.label}</p>
                <p className="text-xs text-ink/40">Due {formatDate(row.dueDate.toISOString())}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-ink">{formatINR(Number(row.amount))}</p>
                {row.status === "paid" ? (
                  <Badge tone="green">Paid</Badge>
                ) : (
                  <>
                    <Badge tone={PAYMENT_TONE[row.status]}>{row.status}</Badge>
                    <MarkPaidButton installmentId={row.id} />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <form action={createInstallment} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="projectId" value={project.id} />
          <Input name="label" placeholder="Label (e.g. Advance)" className="w-auto flex-1" required />
          <Input name="amount" type="number" placeholder="Amount" className="w-auto" required />
          <Input name="dueDate" type="date" className="w-auto" required />
          <Button type="submit" variant="secondary">Add Installment</Button>
        </form>
      </Card>

      {/* Deliverables */}
      <Card className="mt-4">
        <CardLabel>Deliverables</CardLabel>
        <div className="space-y-2">
          {project.deliverables.length === 0 && <p className="text-sm text-ink/50">Nothing in post-production yet.</p>}
          {project.deliverables.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-lg bg-surface px-3 py-2">
              <div>
                <p className="text-sm font-medium text-ink">{d.title}</p>
                <p className="text-xs text-ink/40">{d.editor?.fullName || "Unassigned editor"}</p>
              </div>
              <Badge tone="brand">{d.status.replace("_", " ")}</Badge>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink/40">
          Manage deliverable status from the <Link href="/admin/post-production" className="underline">Post Production</Link> page.
        </p>
      </Card>
    </div>
  );
}
