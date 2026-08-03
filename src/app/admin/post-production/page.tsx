import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

const TONE = { not_started: "gray", in_progress: "amber", ready: "brand", delivered: "green" } as const;
const LABEL = { not_started: "Not Started", in_progress: "In Progress", ready: "Ready", delivered: "Delivered" } as const;

export default async function PostProductionPage() {
  const deliverables = await prisma.deliverable.findMany({
    include: { project: true, editor: true },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink">Post-Production</h1>
      <p className="mt-1 text-sm text-ink/50">Track edits, files & deliverables in one place</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {deliverables.length === 0 && (
          <Card><p className="text-sm text-ink/50">Nothing in the post-production pipeline yet.</p></Card>
        )}
        {deliverables.map((d) => (
          <Card key={d.id}>
            <CardLabel>{d.project.title}</CardLabel>
            <p className="text-sm font-semibold text-ink">{d.title}</p>
            <p className="mt-1 text-xs text-ink/40">
              Editor: {d.editor?.fullName || "Unassigned"}
              {d.dueDate ? ` · Due ${formatDate(d.dueDate.toISOString())}` : ""}
            </p>
            <div className="mt-3">
              <Badge tone={TONE[d.status]}>{LABEL[d.status]}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
