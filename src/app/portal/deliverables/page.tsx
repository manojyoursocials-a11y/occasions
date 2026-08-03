import { getSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const TONE = { not_started: "gray", in_progress: "amber", ready: "brand", delivered: "green" } as const;
const LABEL = { not_started: "Not Started", in_progress: "In Progress", ready: "Ready", delivered: "Delivered" } as const;

export default async function DeliverablesPage() {
  const session = await getSession();
  const project = await prisma.project.findFirst({
    where: { clientId: session!.user.id },
    orderBy: { eventDate: "asc" },
  });

  const items = project
    ? await prisma.deliverable.findMany({ where: { projectId: project.id } })
    : [];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink">Deliverables</h1>
      <p className="mt-1 text-sm text-ink/50">Photos, films & albums from your event</p>

      <div className="mt-6 space-y-3">
        {items.length === 0 && (
          <Card><p className="text-sm text-ink/50">Nothing in post-production yet.</p></Card>
        )}
        {items.map((d) => (
          <Card key={d.id} className="flex items-center justify-between">
            <div>
              <CardLabel>{d.title}</CardLabel>
              {d.deliveryLink && (
                <a href={d.deliveryLink} target="_blank" className="text-sm text-brand-700 underline">
                  Open delivery link
                </a>
              )}
            </div>
            <Badge tone={TONE[d.status]}>{LABEL[d.status]}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
