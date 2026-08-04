import { prisma } from "@/lib/prisma";
import { Card, CardLabel } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { DeliverableStatusSelect } from "@/components/admin/DeliverableStatusSelect";
import { createDeliverable } from "@/lib/actions/deliverables";
import { formatDate } from "@/lib/utils";

export default async function PostProductionPage() {
  const [deliverables, projects, editors] = await Promise.all([
    prisma.deliverable.findMany({
      include: { project: true, editor: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.project.findMany({ orderBy: { title: "asc" } }),
    prisma.teamMember.findMany({ where: { role: "editor", active: true }, orderBy: { fullName: "asc" } }),
  ]);

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
              <DeliverableStatusSelect id={d.id} status={d.status} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <p className="mb-3 text-sm font-semibold text-ink">Add Deliverable</p>
        <form action={createDeliverable} className="flex flex-wrap items-center gap-2">
          <Select name="projectId" required className="w-auto flex-1">
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </Select>
          <Input name="title" placeholder="e.g. Wedding Day Highlights" className="w-auto flex-1" required />
          <Select name="editorId" className="w-auto">
            <option value="">Unassigned editor</option>
            {editors.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </Select>
          <Input name="dueDate" type="date" className="w-auto" />
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </Card>
    </div>
  );
}
