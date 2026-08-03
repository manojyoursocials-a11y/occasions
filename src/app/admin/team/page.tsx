import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { fullName: "asc" } });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Team</h1>
          <p className="mt-1 text-sm text-ink/50">Assign your crew, automatically</p>
        </div>
        <Button>+ Add Member</Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.length === 0 && (
          <Card><p className="text-sm text-ink/50">No team members added yet.</p></Card>
        )}
        {members.map((m) => (
          <Card key={m.id}>
            <p className="text-sm font-semibold text-ink">{m.fullName}</p>
            <p className="text-xs text-ink/40">{m.email}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="brand">{m.role}</Badge>
              <Badge tone={m.active ? "green" : "gray"}>{m.active ? "Active" : "Inactive"}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
